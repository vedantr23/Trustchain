import { Router } from 'express';
import crypto from 'crypto';
import { createDonation, getDonationsByDrive, getDonationsByDonor } from '../db/donations.js';
import { logAudit } from '../db/auditLogs.js';
import { validateBody } from '../middleware/validateBody.js';
import {
  isRazorpayConfigured,
  getRazorpayInstance,
  getRazorpayKeyId,
  getRazorpayKeySecret,
} from '../config/razorpay.js';

const router = Router();

/**
 * GET /donations/razorpay/config
 * Check if Razorpay keys are configured and expose public key ID.
 */
router.get('/razorpay/config', (_req, res) => {
  const configured = isRazorpayConfigured();
  res.json({
    success: true,
    configured,
    keyId: configured ? getRazorpayKeyId() : null,
  });
});

/**
 * POST /donations/razorpay/create-order
 * Create a live/test Razorpay Order for real UPI / card payments.
 */
router.post('/razorpay/create-order', async (req, res, next) => {
  try {
    const { amount, currency = 'INR', drive_id, milestone_id, donor_name, donor_email } = req.body;

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      return res.status(400).json({ success: false, error: 'Valid amount is required (greater than 0)' });
    }

    const rzp = getRazorpayInstance();
    if (!rzp) {
      return res.status(503).json({
        success: false,
        error: 'Razorpay is not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env',
      });
    }

    // Razorpay requires amount in smallest currency sub-unit (paise for INR)
    const amountInPaise = Math.round(numAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: currency || 'INR',
      receipt: `tc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        drive_id: drive_id || '',
        milestone_id: milestone_id || '',
        donor_name: donor_name || 'Anonymous Supporter',
        donor_email: donor_email || '',
        platform: 'TrustChain',
      },
    };

    const order = await rzp.orders.create(options);

    res.status(201).json({
      success: true,
      order,
      keyId: getRazorpayKeyId(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /donations/razorpay/verify
 * Cryptographically verify Razorpay payment signature & record verified donation.
 */
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      drive_id,
      amount,
      donor_id,
      donor_name,
      donor_email,
      milestone_id,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required Razorpay parameters: order_id, payment_id, or signature',
      });
    }

    const secret = getRazorpayKeySecret();
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Server missing RAZORPAY_KEY_SECRET to verify signature',
      });
    }

    // Cryptographic HMAC SHA256 Signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Razorpay payment verification failed: Invalid cryptographic signature',
      });
    }

    // Generate cryptographic hash representation for ledger
    const txHash = `0x${crypto.createHash('sha256').update(razorpay_payment_id).digest('hex')}`;

    // Record verified donation in database (with milestone escrow lock)
    let donation;
    const donationPayload = {
      drive_id,
      amount: Number(amount),
      donor_id: donor_id || '00000000-0000-0000-0000-000000000000',
      donor_name: donor_name || 'Anonymous Supporter',
      transaction_id: razorpay_payment_id,
      blockchain_tx_hash: txHash,
      payment_gateway: 'razorpay',
      status: 'completed',
      milestone_id: milestone_id || null,
      upi_ref_id: razorpay_payment_id,
      escrow_status: 'locked',
    };

    try {
      donation = await createDonation(donationPayload);
    } catch (dbErr) {
      // Fallback if schema doesn't have newer columns
      delete donationPayload.milestone_id;
      delete donationPayload.upi_ref_id;
      delete donationPayload.escrow_status;
      donation = await createDonation(donationPayload);
    }

    await logAudit({
      action: 'DONATION_RECEIVED',
      actorId: donor_id,
      targetTable: 'donations',
      targetId: donation.id,
      details: {
        amount,
        drive_id,
        milestone_id,
        donor_email,
        razorpay_payment_id,
        razorpay_order_id,
        gateway: 'razorpay_upi',
      },
    });

    res.json({
      success: true,
      verified: true,
      data: donation,
      paymentId: razorpay_payment_id,
      txHash,
    });
  } catch (err) {
    next(err);
  }
});

/** POST /donations  – record a donation directly (fallback / manual) */
router.post(
  '/',
  validateBody(['drive_id', 'amount']),
  async (req, res, next) => {
    try {
      const { drive_id, donor_id, donor_name, amount, transaction_id, blockchain_tx_hash, payment_gateway, milestone_id, upi_ref_id } = req.body;
      let donation;
      const payload = {
        drive_id,
        amount,
        donor_id: donor_id || '00000000-0000-0000-0000-000000000000',
        donor_name: donor_name || 'Anonymous',
        transaction_id,
        blockchain_tx_hash,
        payment_gateway: payment_gateway || 'upi_direct',
        status: 'completed',
        milestone_id: milestone_id || null,
        upi_ref_id: upi_ref_id || transaction_id || null,
        escrow_status: 'locked',
      };
      try {
        donation = await createDonation(payload);
      } catch (e) {
        delete payload.milestone_id;
        delete payload.upi_ref_id;
        delete payload.escrow_status;
        donation = await createDonation(payload);
      }
      await logAudit({ action: 'DONATION_RECEIVED', actorId: donor_id, targetTable: 'donations', targetId: donation.id, details: { amount, drive_id, milestone_id } });
      res.status(201).json({ success: true, data: donation });
    } catch (err) { next(err); }
  }
);

/** GET /donations/drive/:driveId */
router.get('/drive/:driveId', async (req, res, next) => {
  try {
    const data = await getDonationsByDrive(req.params.driveId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** GET /donations/donor/:donorId */
router.get('/donor/:donorId', async (req, res, next) => {
  try {
    const data = await getDonationsByDonor(req.params.donorId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

export default router;
