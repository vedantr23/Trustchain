import { Router } from 'express';
import {
  getMilestonesByDrive, getMilestoneById, createMilestone,
  updateMilestoneStatus, getPendingMilestones,
} from '../db/milestones.js';
import { logAudit } from '../db/auditLogs.js';
import { validateBody } from '../middleware/validateBody.js';

const router = Router();

/** GET /milestones/pending  – admin review queue */
router.get('/pending', async (req, res, next) => {
  try {
    const data = await getPendingMilestones();
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** GET /milestones/by-drive/:driveId */
router.get('/by-drive/:driveId', async (req, res, next) => {
  try {
    const data = await getMilestonesByDrive(req.params.driveId);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** GET /milestones/:id */
router.get('/:id', async (req, res, next) => {
  try {
    const data = await getMilestoneById(req.params.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
});

/** POST /milestones  – NGO creates a milestone for a drive */
router.post(
  '/',
  validateBody(['drive_id', 'title', 'target_amount']),
  async (req, res, next) => {
    try {
      const payload = {
        drive_id: req.body.drive_id,
        title: req.body.title,
        description: req.body.description || null,
        target_amount: req.body.target_amount,
        target_date: req.body.target_date || null,
        status: req.body.status || 'pending',
        gps_required: Boolean(req.body.gps_required ?? req.body.requires_gps),
        photo_required: Boolean(req.body.photo_required ?? req.body.requires_photo),
        video_required: Boolean(req.body.video_required ?? req.body.requires_video),
        invoice_required: Boolean(req.body.invoice_required ?? req.body.requires_invoice),
      };
      const milestone = await createMilestone(payload);
      await logAudit({
        action: 'MILESTONE_CREATED',
        targetTable: 'milestones',
        targetId: milestone.id,
        details: { drive_id: milestone.drive_id, title: milestone.title },
      });
      res.status(201).json({ success: true, data: milestone });
    } catch (err) { next(err); }
  }
);

/** POST /milestones/:id/review  – admin approve or reject */
router.post(
  '/:id/review',
  validateBody(['status']),
  async (req, res, next) => {
    try {
      const { status } = req.body;
      const admin_id = req.body.admin_id || '00000000-0000-0000-0000-000000000000';
      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, error: 'status must be "approved" or "rejected"' });
      }
      const milestone = await updateMilestoneStatus(req.params.id, status);
      const action = status === 'approved' ? 'MILESTONE_APPROVED' : 'MILESTONE_REJECTED';
      await logAudit({ action, actorId: admin_id, targetTable: 'milestones', targetId: milestone.id });
      res.json({ success: true, data: milestone });
    } catch (err) { next(err); }
  }
);

/** POST /milestones/:id/release-funds  – admin releases escrow funds to NGO UPI */
router.post(
  '/:id/release-funds',
  validateBody(['amount']),
  async (req, res, next) => {
    try {
      const admin_id = req.body.admin_id || '00000000-0000-0000-0000-000000000000';
      const payout_upi_id = req.body.payout_upi_id || 'ngo@upi';
      const { amount, upi_ref_id, notes } = req.body;

      const milestone = await updateMilestoneStatus(req.params.id, 'approved');
      await logAudit({
        action: 'FUNDS_RELEASED_TO_NGO_UPI',
        actorId: admin_id,
        targetTable: 'milestones',
        targetId: req.params.id,
        details: {
          amount,
          payout_upi_id,
          upi_ref_id: upi_ref_id || `UPI-${Date.now()}`,
          notes: notes || 'Admin verified proofs and authorized escrow release to NGO UPI.',
        },
      });
      res.json({
        success: true,
        data: milestone,
        released: true,
        payout_upi_id,
        amount,
        upi_ref_id,
      });
    } catch (err) { next(err); }
  }
);

export default router;

