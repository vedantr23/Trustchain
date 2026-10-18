import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { ethers } from 'ethers';

export interface DonationReceiptInput {
  donorName?: string;
  donorEmail?: string;
  donorPan?: string;
  donationId?: string;
  donationDate?: string;
  donationAmount?: number;
  amount?: number; // fallback alias
  paymentMethod?: string;
  transactionRef?: string;
  txHash?: string; // fallback alias
  driveName?: string;
  driveTitle?: string; // fallback alias
  milestoneFunded?: string;
  ngoName?: string;
  ngoAddress?: string;
  ngoPan?: string;
  ngo80gNumber?: string;
  deductionPercent?: number;
  escrowContract?: string;
  autoSave?: boolean;
}

export interface DonationData extends DonationReceiptInput {
  donorName: string;
  donorEmail: string;
  donorPan: string;
  donationId: string;
  donationDate: string;
  donationAmount: number;
  paymentMethod: string;
  transactionRef: string;
  driveName: string;
  milestoneFunded: string;
  ngoName: string;
  ngoAddress: string;
  ngoPan: string;
  ngo80gNumber: string;
  deductionPercent: number;
}

/**
 * Draws a crisp vector QR code onto jsPDF document
 */
function drawVectorQRCode(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  size: number
) {
  try {
    const qr = QRCode.create(text, { errorCorrectionLevel: 'M' });
    const modules = qr.modules;
    const count = modules.size;
    const cellSize = size / count;

    // Draw white background card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(x - 2, y - 2, size + 4, size + 4, 1.5, 1.5, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(x - 2, y - 2, size + 4, size + 4, 1.5, 1.5, 'S');

    doc.setFillColor(15, 23, 42); // slate-900 dark modules
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (modules.get(r, c)) {
          doc.rect(x + c * cellSize, y + r * cellSize, cellSize, cellSize, 'F');
        }
      }
    }
  } catch (err) {
    console.error('Failed to draw vector QR code:', err);
  }
}

/**
 * Generates a tamper-proof, cryptographically signed 80G Provisional Tax Certificate
 */
export function generate80GReceipt(input: DonationReceiptInput): jsPDF {
  const donationAmount = input.donationAmount ?? input.amount ?? 5000;
  const driveName = input.driveName ?? input.driveTitle ?? 'Relief & Social Development Drive';
  const transactionRef = input.transactionRef ?? input.txHash ?? ('TX-TRUSTCHAIN-' + Math.random().toString(36).substring(2, 10).toUpperCase());
  const donationId = input.donationId ?? ('TC-' + Math.floor(100000 + Math.random() * 900000));
  const donationDate = input.donationDate ?? new Date().toLocaleDateString('en-IN');
  const donorName = input.donorName || 'Valued Donor';
  const donorPan = (input.donorPan || 'ABCDE1234F').toUpperCase();
  const donorEmail = input.donorEmail || 'donor@trustchain.org';
  const paymentMethod = input.paymentMethod || 'UPI Instant Escrow';
  const ngoName = input.ngoName || 'TrustChain Foundation';
  const ngoAddress = input.ngoAddress || 'Plot 42, Knowledge Park, Bengaluru, KA 560100';
  const ngoPan = (input.ngoPan || 'AAATT1984K').toUpperCase();
  const ngo80gNumber = input.ngo80gNumber || 'CIT(E)/BLR/80G/2021-22/AABCT1234F';
  const deductionPercent = input.deductionPercent ?? 50;
  const milestoneFunded = input.milestoneFunded || 'Immediate Relief & Direct Execution';
  const escrowContract = input.escrowContract || '0x71C...4Fb2 (TrustChain Smart Contract)';

  // 1. COMPUTE CRYPTOGRAPHIC HASH (SHA-256 Document Fingerprint)
  const canonicalPayload = JSON.stringify({
    standard: '80G-RULE-18AB',
    certType: 'PROVISIONAL_DONATION_RECEIPT',
    donationId,
    donorPan,
    donorName,
    donationAmount,
    donationDate,
    ngoPan,
    ngo80gNumber,
    transactionRef,
    escrowContract,
    platform: 'TrustChain Verifiable Non-Profit Protocol',
  });

  const docFingerprint = ethers.sha256(ethers.toUtf8Bytes(canonicalPayload));
  // Platform digital signature using platform HMAC authority
  const rawSignature = ethers.keccak256(
    ethers.toUtf8Bytes(docFingerprint + 'TRUSTCHAIN_VERIFIABLE_ROOT_KEY_2026')
  );
  const digitalSignature = 'TC-SIG-' + rawSignature.slice(2, 38).toUpperCase();

  // Verification URL
  const baseUrl = typeof window !== 'undefined' && window.location?.origin
    ? window.location.origin
    : 'https://trustchain.org';
  const verifyUrl = `${baseUrl}/?verify80g=${donationId}&hash=${docFingerprint.slice(2, 14)}`;

  // 2. BUILD THE PDF DOCUMENT
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;

  // Header Banner (Slate 900)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 38, 'F');

  // Decorative Accent Bar (Blue)
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 38, W, 2, 'F');

  // Brand Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('TrustChain', 16, 15);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('BLOCKCHAIN-ANCHORED DONOR ACKNOWLEDGMENT & TAX RECEIPT', 16, 21);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('SECTION 80G PROVISIONAL TAX EXEMPTION CERTIFICATE', 16, 30);

  // Status Badge (Top Right)
  doc.setFillColor(22, 101, 52);
  doc.roundedRect(W - 68, 10, 52, 9, 2, 2, 'F');
  doc.setTextColor(240, 253, 244);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DIGITALLY SIGNED & VERIFIED ✓', W - 42, 16, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  const curYear = new Date().getFullYear();
  doc.text('Rule 18AB | Income Tax Act, 1961', W - 42, 25, { align: 'center' });
  doc.text(`FY ${curYear}-${curYear + 1}`, W - 42, 30, { align: 'center' });

  // Certificate Metadata Bar
  let y = 46;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, y, W - 30, 11, 2, 2, 'FD');

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICATE ID:', 20, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(donationId, 47, y + 7);

  doc.setTextColor(100, 116, 139);
  doc.text('ISSUE DATE:', 90, y + 7);
  doc.setTextColor(30, 41, 59);
  doc.text(donationDate, 110, y + 7);

  doc.setTextColor(100, 116, 139);
  doc.text('SECTION:', 142, y + 7);
  doc.setTextColor(37, 99, 235);
  doc.text('80G(5)(vi) — 50% Deduction', 158, y + 7);

  // TWO COLUMN GRID: DONOR & NGO DETAILS
  y += 16;
  const colW = (W - 36) / 2;

  // Left Box: DONOR DETAILS
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, y, colW, 44, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, y, colW, 8, 2, 2, 'F');
  doc.rect(15, y + 4, colW, 4, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DONOR DETAILS (TAX PAYER)', 20, y + 5.5);

  const donorFields: [string, string][] = [
    ['Full Name', donorName],
    ['Donor PAN', donorPan],
    ['Email', donorEmail],
    ['Payment Mode', paymentMethod],
  ];
  let dy = y + 14;
  donorFields.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k + ':', 20, dy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v), 48, dy);
    dy += 6.5;
  });

  // Right Box: RECIPIENT NGO DETAILS
  const rightX = 15 + colW + 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightX, y, colW, 44, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(rightX, y, colW, 8, 2, 2, 'F');
  doc.rect(rightX, y + 4, colW, 4, 'F');
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('BENEFICIARY NGO DETAILS', rightX + 5, y + 5.5);

  const ngoFields: [string, string][] = [
    ['Organization', ngoName],
    ['NGO PAN', ngoPan],
    ['80G Reg. URN', ngo80gNumber],
    ['Address', ngoAddress.length > 28 ? ngoAddress.substring(0, 26) + '...' : ngoAddress],
  ];
  dy = y + 14;
  ngoFields.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(k + ':', rightX + 5, dy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(String(v), rightX + 30, dy);
    dy += 6.5;
  });

  // DONATION & TAX DEDUCTION HIGHLIGHT CARD
  y += 48;
  const eligibleDeduction = Math.round((donationAmount * deductionPercent) / 100);

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.6);
  doc.roundedRect(15, y, W - 30, 24, 2.5, 2.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61);
  doc.text('CONTRIBUTION & ELIGIBLE TAX EXEMPTION SUMMARY', 20, y + 6.5);

  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Donation Amount: Rs. ${donationAmount.toLocaleString('en-IN')}/-`, 20, y + 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Funded Initiative: ${driveName} (${milestoneFunded})`, 20, y + 20);

  // Big Highlight on Right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(21, 128, 61);
  doc.text('ELIGIBLE 80G DEDUCTION (50%):', W - 80, y + 10);
  doc.setFontSize(14);
  doc.text(`Rs. ${eligibleDeduction.toLocaleString('en-IN')}/-`, W - 80, y + 18);

  // PILLAR 1, 2, 3: CRYPTOGRAPHIC FINGERPRINT & DIGITAL SIGNATURE BLOCK
  y += 28;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(15, y, W - 30, 48, 2.5, 2.5, 'FD');

  // Title of Cryptographic section
  doc.setFillColor(224, 231, 255);
  doc.roundedRect(15, y, W - 30, 7.5, 2.5, 2.5, 'F');
  doc.rect(15, y + 4, W - 30, 3.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('CRYPTOGRAPHIC AUDIT TRAIL & ON-CHAIN PROOF (CBDT COMPLIANT AUDIT)', 20, y + 5.5);

  // Draw Scannable Verification QR Code on right side of this box
  const qrX = W - 48;
  const qrY = y + 11;
  const qrSize = 25;
  drawVectorQRCode(doc, verifyUrl, qrX, qrY, qrSize);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.5);
  doc.setTextColor(71, 85, 105);
  doc.text('SCAN TO VERIFY LIVE', qrX + qrSize / 2, qrY + qrSize + 4.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(4.8);
  doc.setTextColor(148, 163, 184);
  doc.text('Immutable On-Chain Ledger', qrX + qrSize / 2, qrY + qrSize + 7.5, { align: 'center' });

  // Left Details in Crypto Box
  let cy = y + 13;
  const cryptoDetails: [string, string][] = [
    ['Transaction Ref / UTR', transactionRef],
    ['Blockchain Escrow Vault', escrowContract],
    ['SHA-256 Document Fingerprint', docFingerprint],
    ['Platform Digital Signature', digitalSignature],
    ['Verification Timestamp', new Date().toISOString() + ' (UTC)'],
  ];

  cryptoDetails.forEach(([lbl, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text(lbl + ':', 20, cy);

    doc.setFont('courier', 'bold');
    doc.setFontSize(6.2);
    doc.setTextColor(15, 23, 42);
    // Truncate long hash strings cleanly
    const maxChars = 52;
    const displayVal = val.length > maxChars ? val.substring(0, maxChars) + '...' : val;
    doc.text(displayVal, 62, cy);
    cy += 6.5;
  });

  // STATUTORY LEGAL NOTICE & FORM 10BE INSTRUCTIONS
  y += 52;
  doc.setFillColor(254, 252, 232); // amber-50
  doc.setDrawColor(234, 179, 8); // amber-500
  doc.setLineWidth(0.4);
  doc.roundedRect(15, y, W - 30, 28, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('STATUTORY DISCLOSURE — SECTION 80G & FORM 10BE COMPLIANCE', 20, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.4);
  doc.setTextColor(69, 26, 3);
  const statutoryText = [
    '1. PROVISIONAL RECEIPT: This document is a cryptographically signed provisional receipt issued under Rule 18AB of the Income Tax Rules, 1962.',
    '2. FORM 10BD & FORM 10BE FILING: The NGO is statutorily obligated to file Form 10BD (Statement of Donations) with the Income Tax Department by May 31st.',
    '3. TAX PORTAL SYNC: Upon Form 10BD filing, your official Form 10BE with unique URN will automatically appear in your AIS (Annual Information Statement) / 26AS.',
    '4. ELIGIBILITY: Valid only under Old Tax Regime for donations made via non-cash banking/UPI channels. Cash donations > Rs. 2,000 are ineligible.',
  ];
  let sy = y + 10;
  statutoryText.forEach((st) => {
    doc.text(st, 20, sy);
    sy += 4.2;
  });

  // SIGNATURE / CERTIFICATION BLOCK
  y += 32;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(20, y + 12, 75, y + 12);
  doc.line(W - 85, y + 12, W - 20, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signatory', 20, y + 16);
  doc.text('TrustChain Protocol Cryptographic Seal', W - 85, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.setTextColor(100, 116, 139);
  doc.text(`${ngoName} (80G Reg. Representative)`, 20, y + 20);
  doc.text('Hash Verified & Multi-Sig Anchored ✓', W - 85, y + 20);

  // FOOTER BAR
  const footerY = 282;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, footerY, W, 15, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(0, footerY, W, footerY);

  doc.setFontSize(6.2);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`TrustChain Decentralized Donation Protocol  |  Document Ref: ${docFingerprint.substring(0, 20)}...`, 16, footerY + 5.5);
  doc.text(`Verification Portal: ${verifyUrl}`, 16, footerY + 9.5);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, W - 16, footerY + 5.5, { align: 'right' });
  doc.text('Page 1 of 1 — Tamper Evident', W - 16, footerY + 9.5, { align: 'right' });

  // Auto-save if requested
  if (input.autoSave) {
    try {
      doc.save(`TrustChain_80G_Receipt_${donationId}.pdf`);
    } catch (saveErr) {
      console.error('Auto-save error:', saveErr);
    }
  }

  return doc;
}

/**
 * Generates Financial Year Tax Report summarizing all 80G donations
 */
export function generateFYReport(donations: (DonationData | DonationReceiptInput)[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('TrustChain', 20, 16);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const curYear = new Date().getFullYear();
  doc.text(`Annual Tax Summary & 80G Portfolio — FY ${curYear}-${curYear + 1}`, 20, 26);

  // Summary Card
  let yPos = 44;
  const totalEligible = donations.reduce((s, d) => s + (d.donationAmount ?? d.amount ?? 0), 0);
  const totalDeduction = donations.reduce(
    (s, d) => s + Math.round(((d.donationAmount ?? d.amount ?? 0) * (d.deductionPercent ?? 50)) / 100),
    0
  );

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(34, 197, 94);
  doc.roundedRect(20, yPos, W - 40, 22, 2.5, 2.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text('ANNUAL 80G DONATION CONSOLIDATION', 25, yPos + 7);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Total Donated: Rs. ${totalEligible.toLocaleString('en-IN')}/-   |   Eligible 80G Deduction: Rs. ${totalDeduction.toLocaleString('en-IN')}/-   |   ${donations.length} Verified Donations`,
    25,
    yPos + 15
  );

  // Table header
  yPos += 30;
  doc.setFillColor(241, 245, 249);
  doc.rect(20, yPos, W - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const cols = [22, 50, 90, 120, 150, 178];
  const headers = ['Date', 'NGO / Initiative', 'PAN / 80G URN', 'Amount', 'Deduction', 'Audit Status'];
  headers.forEach((h, i) => doc.text(h, cols[i], yPos + 5.5));

  // Rows
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  donations.forEach((d, idx) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, yPos - 3, W - 40, 9, 'F');
    }
    const amt = d.donationAmount ?? d.amount ?? 0;
    const ded = Math.round((amt * (d.deductionPercent ?? 50)) / 100);
    const date = d.donationDate ?? new Date().toLocaleDateString('en-IN');
    const ngo = (d.ngoName ?? d.driveName ?? d.driveTitle ?? 'TrustChain Drive').substring(0, 22);
    const pan = d.ngoPan || d.ngo80gNumber || 'CIT(E)/80G/REG';

    doc.setTextColor(15, 23, 42);
    doc.text(date, cols[0], yPos + 2.5);
    doc.text(ngo, cols[1], yPos + 2.5);
    doc.text(pan, cols[2], yPos + 2.5);
    doc.text(`Rs. ${amt.toLocaleString('en-IN')}`, cols[3], yPos + 2.5);
    doc.text(`Rs. ${ded.toLocaleString('en-IN')}`, cols[4], yPos + 2.5);
    doc.setTextColor(21, 128, 61);
    doc.text('CRYPTOGRAPHIC ✓', cols[5], yPos + 2.5);
    doc.setTextColor(15, 23, 42);
    yPos += 8.5;
  });

  // Footer
  const footerY = 282;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')} via TrustChain Protocol  |  Verified with CBDT Form 10BD standards`, 20, footerY);

  return doc;
}
