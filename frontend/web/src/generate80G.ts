import jsPDF from 'jspdf';

interface DonationData {
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

function drawSeal(doc: jsPDF, x: number, y: number) {
  // Outer circle
  doc.setDrawColor(22, 163, 74);
  doc.setLineWidth(1.5);
  doc.circle(x, y, 18);
  doc.setLineWidth(0.8);
  doc.circle(x, y, 15);
  
  // Inner shield
  doc.setFillColor(37, 99, 235);
  doc.circle(x, y, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text('✓', x - 1.5, y + 2.5);
  
  // Circular text
  doc.setTextColor(22, 163, 74);
  doc.setFontSize(4.5);
  const radius = 12;
  const topText = 'VERIFIED 80G REGISTERED NGO';
  const bottomText = 'TRUSTCHAIN APPROVED';
  
  for (let i = 0; i < topText.length; i++) {
    const angle = -Math.PI + (i / topText.length) * Math.PI;
    const cx = x + radius * Math.cos(angle);
    const cy = y + radius * Math.sin(angle);
    doc.text(topText[i], cx - 1, cy + 1);
  }
  
  for (let i = 0; i < bottomText.length; i++) {
    const angle = (i / bottomText.length) * Math.PI;
    const cx = x + radius * Math.cos(angle);
    const cy = y + radius * Math.sin(angle);
    doc.text(bottomText[i], cx - 1, cy + 1);
  }
}

export function generate80GReceipt(data: DonationData) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  
  // Header gradient bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 40, 'F');
  doc.setFillColor(22, 163, 74);
  doc.rect(0, 40, W, 3, 'F');
  
  // Logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TrustChain', 20, 18);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Transparent Milestone-Based Donation Platform', 20, 25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('DONATION RECEIPT — 80G TAX CERTIFICATE', 20, 35);
  
  // Seal
  drawSeal(doc, W - 35, 22);
  
  // NGO Details
  let yPos = 52;
  doc.setTextColor(55, 65, 81);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('NGO DETAILS', 20, yPos);
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.5);
  doc.line(20, yPos + 2, 80, yPos + 2);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const ngoDetails = [
    ['Organization', data.ngoName],
    ['Address', data.ngoAddress],
    ['PAN Number', data.ngoPan],
    ['80G Reg. Number', data.ngo80gNumber],
    ['Status', 'Government Approved 80G Registered NGO'],
  ];
  ngoDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(label + ':', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(value, 65, yPos);
    yPos += 6;
  });
  
  // Donor Details
  yPos += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('DONOR DETAILS', 20, yPos);
  doc.line(20, yPos + 2, 80, yPos + 2);
  yPos += 10;
  
  doc.setFontSize(9);
  const donorDetails = [
    ['Full Name', data.donorName],
    ['Email', data.donorEmail],
    ['PAN Number', data.donorPan],
  ];
  donorDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(label + ':', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(value, 65, yPos);
    yPos += 6;
  });
  
  // Donation Details
  yPos += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(55, 65, 81);
  doc.text('DONATION DETAILS', 20, yPos);
  doc.line(20, yPos + 2, 80, yPos + 2);
  yPos += 10;
  
  doc.setFontSize(9);
  const donationDetails = [
    ['Donation ID', data.donationId],
    ['Date', data.donationDate],
    ['Amount (INR)', `Rs. ${data.donationAmount.toLocaleString('en-IN')}/-`],
    ['Payment Method', data.paymentMethod],
    ['Transaction Ref', data.transactionRef],
    ['Drive Name', data.driveName],
    ['Milestone Funded', data.milestoneFunded],
    ['Deduction %', `${data.deductionPercent}% under Section 80G`],
  ];
  donationDetails.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(107, 114, 128);
    doc.text(label + ':', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(17, 24, 39);
    doc.text(value, 65, yPos);
    yPos += 6;
  });
  
  // Amount highlight box
  yPos += 4;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(22, 163, 74);
  doc.roundedRect(20, yPos, W - 40, 20, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(22, 163, 74);
  doc.text(`ELIGIBLE TAX DEDUCTION: Rs. ${Math.round(data.donationAmount * data.deductionPercent / 100).toLocaleString('en-IN')}/-`, W / 2, yPos + 13, { align: 'center' });
  
  // Legal note
  yPos += 30;
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(20, yPos, W - 40, 35, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(37, 99, 235);
  doc.text('LEGAL NOTE — SECTION 80G, INCOME TAX ACT, 1961', 25, yPos + 7);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(55, 65, 81);
  const legalLines = [
    'This receipt may be used while filing Income Tax Return under the old tax regime as per',
    'Section 80G of the Income Tax Act, 1961. The donor is eligible for tax deduction on the',
    'above donation amount. Please note:',
    '• Donations in kind (goods, services) are NOT eligible for tax deduction under 80G.',
    '• Cash donations exceeding Rs. 2,000 are NOT valid for 80G tax deduction.',
    '• This receipt is valid only for the financial year in which the donation was made.',
  ];
  let legalY = yPos + 13;
  legalLines.forEach(line => {
    doc.text(line, 25, legalY);
    legalY += 4;
  });
  
  // Signatures
  yPos += 44;
  doc.setDrawColor(228, 231, 236);
  doc.line(20, yPos + 10, 80, yPos + 10);
  doc.line(120, yPos + 10, 190, yPos + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Authorized Signatory (NGO)', 25, yPos + 15);
  doc.text('TrustChain Verification', 130, yPos + 15);
  doc.text(data.ngoName, 25, yPos + 20);
  doc.text('Platform Verified ✓', 130, yPos + 20);
  
  // Footer
  const footerY = 280;
  doc.setFillColor(249, 250, 251);
  doc.rect(0, footerY - 5, W, 20, 'F');
  doc.setDrawColor(228, 231, 236);
  doc.line(0, footerY - 5, W, footerY - 5);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(`Issue Date: ${new Date().toLocaleDateString('en-IN')}  |  Valid for FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 20, footerY);
  doc.text('Support: support@trustchain.org  |  www.trustchain.org', 20, footerY + 5);
  doc.text('This is a computer-generated receipt and does not require physical signature.', 20, footerY + 10);
  
  return doc;
}

export function generateFYReport(donations: DonationData[]) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const W = 210;
  
  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, W, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('TrustChain', 20, 16);
  doc.setFontSize(11);
  doc.text(`Financial Year Tax Report — FY ${new Date().getFullYear()}-${new Date().getFullYear() + 1}`, 20, 28);
  
  drawSeal(doc, W - 35, 18);
  
  // Summary
  let yPos = 45;
  const totalEligible = donations.reduce((s, d) => s + d.donationAmount, 0);
  const totalDeduction = donations.reduce((s, d) => s + Math.round(d.donationAmount * d.deductionPercent / 100), 0);
  
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(20, yPos, W - 40, 24, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(22, 163, 74);
  doc.text('ANNUAL SUMMARY', 25, yPos + 8);
  doc.setFontSize(9);
  doc.text(`Total Donations: Rs. ${totalEligible.toLocaleString('en-IN')}/-   |   Estimated Deduction: Rs. ${totalDeduction.toLocaleString('en-IN')}/-   |   ${donations.length} Eligible Donations`, 25, yPos + 17);
  
  // Table header
  yPos += 34;
  doc.setFillColor(249, 250, 251);
  doc.rect(20, yPos, W - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  const cols = [20, 45, 85, 115, 148, 175];
  const headers = ['Date', 'NGO / Drive', 'PAN / 80G', 'Amount', 'Deduction', 'Status'];
  headers.forEach((h, i) => doc.text(h, cols[i] + 2, yPos + 5.5));
  
  // Rows
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  donations.forEach((d, idx) => {
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    if (idx % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(20, yPos - 3, W - 40, 10, 'F');
    }
    doc.setTextColor(17, 24, 39);
    doc.text(d.donationDate, cols[0] + 2, yPos + 2);
    doc.text(d.ngoName.substring(0, 20), cols[1] + 2, yPos + 2);
    doc.text(d.ngoPan, cols[2] + 2, yPos + 2);
    doc.text(`Rs. ${d.donationAmount.toLocaleString('en-IN')}`, cols[3] + 2, yPos + 2);
    doc.text(`Rs. ${Math.round(d.donationAmount * d.deductionPercent / 100).toLocaleString('en-IN')}`, cols[4] + 2, yPos + 2);
    doc.setTextColor(22, 163, 74);
    doc.text('VERIFIED', cols[5] + 2, yPos + 2);
    doc.setTextColor(17, 24, 39);
    yPos += 10;
  });
  
  // Footer 
  const footerY = 280;
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(156, 163, 175);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} by TrustChain Platform  |  support@trustchain.org`, 20, footerY);
  
  return doc;
}
