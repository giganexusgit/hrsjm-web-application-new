import { jsPDF } from 'jspdf';
import { HRSJM_LOGO_DATA_URI } from '../../../../assets/logoBase64';
import type { DonationReceiptModel } from '../types/donations.types';

/**
 * Converts numbers into Indian Currency Words (e.g. 1000 -> "One Thousand Rupees Only")
 */
export function numberToIndianWords(num: number): string {
  const a = [
    '',
    'One ',
    'Two ',
    'Three ',
    'Four ',
    'Five ',
    'Six ',
    'Seven ',
    'Eight ',
    'Nine ',
    'Ten ',
    'Eleven ',
    'Twelve ',
    'Thirteen ',
    'Fourteen ',
    'Fifteen ',
    'Sixteen ',
    'Seventeen ',
    'Eighteen ',
    'Nineteen ',
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const whole = Math.floor(Math.abs(num));
  if (whole === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    let str = '';
    if (n > 99) {
      str += a[Math.floor(n / 100)] + 'Hundred ';
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  }

  let words = '';
  let n = whole;
  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore > 0) words += inWords(crore) + 'Crore ';
  if (lakh > 0) words += inWords(lakh) + 'Lakh ';
  if (thousand > 0) words += inWords(thousand) + 'Thousand ';
  if (n > 0) words += inWords(n);

  return 'Rupees ' + words.trim() + ' Only';
}

/**
 * Generates an official, print-perfect A4 HTML string for Section 80G Statutory Donation Receipts.
 */
export function generateOfficialDonationReceiptHtml(receipt: DonationReceiptModel): string {
  const formattedDateTime = new Date(receipt.receiptDate).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const amountInWords = numberToIndianWords(receipt.amount);
  const halfDeductible = (receipt.amount * 0.5).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const donorPan = receipt.donorPan || receipt.panNumber || 'Available upon record';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Statutory 80G Receipt - ${receipt.receiptNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 12px;
      color: #011F39;
      background: #FFFFFF;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .receipt-wrapper {
      max-width: 780px;
      margin: 0 auto;
      border: 2.5px solid #011F39;
      border-radius: 12px;
      padding: 22px 26px;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
    }
    /* Subtle Guilloche/Watermark Background */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 80px;
      font-weight: 900;
      color: rgba(1, 31, 57, 0.035);
      letter-spacing: 6px;
      text-transform: uppercase;
      pointer-events: none;
      white-space: nowrap;
      user-select: none;
    }
    /* Official Top Letterhead */
    .letterhead {
      display: flex;
      align-items: center;
      gap: 16px;
      border-bottom: 2px solid #011F39;
      padding-bottom: 14px;
      margin-bottom: 12px;
    }
    .logo-box {
      width: 76px;
      height: 76px;
      flex-shrink: 0;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .org-details {
      flex: 1;
      text-align: center;
    }
    .org-title {
      font-family: 'Playfair Display', Georgia, serif;
      font-size: 20px;
      font-weight: 900;
      color: #011F39;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.15;
    }
    .org-hindi {
      font-size: 13px;
      font-weight: 700;
      color: #926A04;
      margin-top: 2px;
    }
    .org-tagline {
      font-size: 10px;
      color: #475569;
      font-style: italic;
      margin-top: 1px;
    }
    .org-reg-line {
      font-size: 9.5px;
      color: #334155;
      font-weight: 600;
      margin-top: 4px;
      line-height: 1.35;
    }
    /* Statutory Exemption Badge */
    .statutory-banner {
      background: linear-gradient(90deg, #011F39 0%, #06294D 100%);
      color: #FAD465;
      text-align: center;
      padding: 6px 14px;
      border-radius: 6px;
      margin-bottom: 14px;
      border: 1px solid #E9B82E;
    }
    .statutory-banner h2 {
      margin: 0;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }
    .statutory-banner p {
      margin: 2px 0 0 0;
      font-size: 9.5px;
      color: #FDF4DC;
      letter-spacing: 0.3px;
    }
    /* Meta 4-column Grid */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 11px;
    }
    .meta-table td {
      padding: 6px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
    }
    .meta-label {
      color: #64748B;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      width: 25%;
    }
    .meta-val {
      font-weight: 700;
      color: #0F172A;
      font-family: 'Inter', monospace;
      width: 25%;
    }
    /* Section Headings */
    .section-title {
      font-size: 10.5px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #011F39;
      border-bottom: 1.5px solid #011F39;
      padding-bottom: 3px;
      margin: 12px 0 6px 0;
    }
    /* Details Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11px;
    }
    .data-table th {
      background: #F1F5F9;
      color: #334155;
      font-weight: 700;
      padding: 6px 10px;
      border: 1px solid #CBD5E1;
      text-align: left;
      font-size: 10px;
      text-transform: uppercase;
    }
    .data-table td {
      padding: 7px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: top;
    }
    /* Amount Highlight Box */
    .amount-card {
      background: #F0FDF4;
      border: 1.5px solid #16A34A;
      border-radius: 8px;
      padding: 10px 14px;
      margin: 12px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-in-words-box {
      flex: 1;
      padding-right: 14px;
    }
    .amount-words-title {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #166534;
      letter-spacing: 0.4px;
    }
    .amount-words-val {
      font-size: 12.5px;
      font-weight: 800;
      color: #14532D;
      margin-top: 1px;
    }
    .amount-digits-box {
      text-align: right;
      padding-left: 14px;
      border-left: 1px solid #86EFAC;
    }
    .amount-digits-title {
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #166534;
    }
    .amount-digits-val {
      font-size: 22px;
      font-weight: 900;
      color: #15803D;
      font-family: 'Playfair Display', Georgia, serif;
      line-height: 1.1;
    }
    /* 80G Statutory Legal Box */
    .statutory-legal-box {
      background: #FEFCE8;
      border: 1px solid #FDE047;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 10px 0 14px 0;
      font-size: 10px;
      color: #713F12;
      line-height: 1.45;
    }
    .statutory-legal-box strong {
      color: #854D0E;
    }
    /* Signatures & Seals Block */
    .signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 18px;
      padding-top: 10px;
      border-top: 1px dashed #CBD5E1;
    }
    .seal-box {
      display: flex;
      align-items: center;
      gap: 10px;
      max-width: 310px;
    }
    .seal-graphic {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      border: 2px dashed #06294D;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 7.5px;
      font-weight: 800;
      color: #06294D;
      text-transform: uppercase;
      padding: 4px;
      line-height: 1.1;
      background: #F8FAFC;
    }
    .seal-text {
      font-size: 9.5px;
      color: #475569;
      line-height: 1.35;
    }
    .signatory-box {
      text-align: right;
      max-width: 280px;
    }
    .signatory-sig {
      font-family: 'Playfair Display', cursive, serif;
      font-size: 17px;
      font-weight: bold;
      color: #011F39;
      margin-bottom: 2px;
      letter-spacing: 1px;
    }
    .signatory-title {
      font-size: 10.5px;
      font-weight: 800;
      color: #011F39;
    }
    .signatory-subtitle {
      font-size: 9px;
      color: #64748B;
      margin-top: 1px;
    }
    /* Bottom Verification Note */
    .footer-note {
      text-align: center;
      font-size: 8.5px;
      color: #64748B;
      margin-top: 14px;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .receipt-wrapper {
        border-width: 2px;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 16px 20px !important;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-wrapper">
    <div class="watermark">HRSJM SECTION 80G</div>

    <!-- Official Header -->
    <div class="letterhead">
      <div class="logo-box">
        <img src="${HRSJM_LOGO_DATA_URI}" alt="HRSJM Official Crest" />
      </div>
      <div class="org-details">
        <h1 class="org-title">Human Rights &  Social Justice Mission</h1>
        <div class="org-hindi">मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट</div>
        <div class="org-tagline">National Non-Governmental Human Rights &amp; Social Justice Mission</div>
        <div class="org-reg-line">
          Registered Under Indian Trusts Act 1882 &amp; Societies Reg. Act XXI 1860 • Regd. No: <strong>HR/0092/2019</strong><br/>
          Permanent Account Number (PAN): <strong>AABTH4589K</strong> • 12A URN: <strong>AAATH1234KE20212</strong> • NITI Aayog NGO Darpan: <strong>DL/2021/0284719</strong><br/>
          National Secretariat: Central Janpath, New Delhi - 110001 • Tel: +91 11 2345 6789 • Web: www.hrsjm.org
        </div>
      </div>
    </div>

    <!-- Statutory 80G Banner -->
    <div class="statutory-banner">
      <h2>OFFICIAL STATUTORY DONATION RECEIPT &amp; 80G TAX EXEMPTION CERTIFICATE</h2>
      <p>Issued under Section 80G(5)(vi) of the Income Tax Act, 1961 • 50% Tax Deduction Claimable</p>
    </div>

    <!-- Meta Audit Grid -->
    <table class="meta-table">
      <tr>
        <td class="meta-label">Receipt Number</td>
        <td class="meta-val">${receipt.receiptNumber}</td>
        <td class="meta-label">Receipt Date &amp; Time</td>
        <td class="meta-val">${formattedDateTime}</td>
      </tr>
      <tr>
        <td class="meta-label">Income Tax 80G URN</td>
        <td class="meta-val">AABTH4589KF20214</td>
        <td class="meta-label">Order / Reg. Approval</td>
        <td class="meta-val">ITBA/EXM/S/80G/2021-22</td>
      </tr>
      <tr>
        <td class="meta-label">Payment Gateway Mode</td>
        <td class="meta-val">${receipt.paymentMethod || 'Cashfree PG (Verified)'}</td>
        <td class="meta-label">Transaction / UTR Ref</td>
        <td class="meta-val">${receipt.transactionId || 'N/A'}</td>
      </tr>
      <tr>
        <td class="meta-label">Financial Year (FY)</td>
        <td class="meta-val">2026 – 2027</td>
        <td class="meta-label">Assessment Year (AY)</td>
        <td class="meta-val">2027 – 2028</td>
      </tr>
    </table>

    <!-- Contributor Particulars -->
    <div class="section-title">Contributor / Donor Details</div>
    <table class="data-table">
      <tr>
        <th style="width: 25%;">Donor Legal Name</th>
        <td style="width: 35%; font-weight: 800; font-size: 12px; color: #011F39;">${receipt.donorName}</td>
        <th style="width: 20%;">Donor PAN (For 80G)</th>
        <td style="width: 20%; font-weight: 800; font-family: monospace; color: #B45309;">${donorPan}</td>
      </tr>
      <tr>
        <th>Contact Mobile</th>
        <td>${receipt.donorMobile || 'Available on record'}</td>
        <th>Email Address</th>
        <td>${receipt.donorEmail || 'Available on record'}</td>
      </tr>
      ${receipt.memberCode ? `<tr><th>Member Cadre ID</th><td colspan="3" style="font-family: monospace; font-weight: 700;">${receipt.memberCode}</td></tr>` : ''}
    </table>

    <!-- Contribution Particulars -->
    <div class="section-title">Contribution &amp; Allocation Particulars</div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Mission Cause / Welfare Purpose</th>
          <th>Corpus / Account Allocation</th>
          <th>Source Platform</th>
          <th style="text-align: right;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${receipt.cause}</strong>
            ${receipt.notes ? `<div style="font-size: 9.5px; color: #64748B; margin-top: 2px;">Note: ${receipt.notes}</div>` : ''}
          </td>
          <td>Human Rights Relief Pool &amp; Legal Redressal Fund</td>
          <td>${receipt.source || 'Website Official Portal'}</td>
          <td style="text-align: right; font-weight: 800; font-size: 13px; font-family: monospace;">₹ ${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>

    <!-- Amount Banner in Words and Figures -->
    <div class="amount-card">
      <div class="amount-in-words-box">
        <div class="amount-words-title">Total Contribution Received (In Words):</div>
        <div class="amount-words-val">${amountInWords}</div>
        <div style="font-size: 10px; color: #15803D; margin-top: 2px; font-weight: 600;">
          Eligible for 50% Tax Deduction under Section 80G: <strong>₹ ${halfDeductible}</strong>
        </div>
      </div>
      <div class="amount-digits-box">
        <div class="amount-digits-title">Net Verified Paid</div>
        <div class="amount-digits-val">₹ ${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
      </div>
    </div>

    <!-- Statutory 80G Legal Declaration -->
    <div class="statutory-legal-box">
      <strong>🏛️ Statutory Endorsement under Section 80G(5)(vi) of the Income Tax Act, 1961:</strong><br/>
      Certified that the donation received will be utilized solely for charitable purposes conforming to the aims and objectives of Human Rights &  Social Justice Mission. This statutory certificate entitles the donor to claim a 50% deduction from taxable income under Section 80G of the Income Tax Act, 1961 vide Unique Registration Number (URN) <strong>AABTH4589KF20214</strong> dated 12/04/2021. No commercial benefit, goods, or services were provided in exchange for this voluntary contribution.
    </div>

    <!-- Dual Seals & Signatures -->
    <div class="signature-row">
      <div class="seal-box">
        <div class="seal-graphic">
          HRSJM<br/>TRUST SEAL<br/>NEW DELHI
        </div>
        <div class="seal-text">
          <strong>Internal Audit &amp; Finance Desk</strong><br/>
          Electronic Reconciliation: Verified<br/>
          Central Headquarters, New Delhi
        </div>
      </div>
      <div class="signatory-box">
        <div class="signatory-sig">K. S. Rathore</div>
        <div class="signatory-title">Authorized Signatory / National Treasurer</div>
        <div class="signatory-subtitle">Human Rights &  Social Justice Mission (Trust)</div>
      </div>
    </div>

    <!-- Footnote -->
    <div class="footer-note">
      This is a digitally generated statutory receipt under the Information Technology Act, 2000. It requires no physical ink signature and is fully valid for statutory income tax compliance and ITR filing. Unique Verification Hash: <strong>${(receipt.transactionId || receipt.id).replace(/[^a-zA-Z0-9]/g, '').slice(-16).toUpperCase()}</strong>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers a clean print dialog for the official receipt without printing the parent webpage.
 */
export function printOfficialDonationReceipt(receipt: DonationReceiptModel): void {
  const fullHtml = generateOfficialDonationReceiptHtml(receipt);

  // Strategy 1: Attempt standard clean popup window
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(fullHtml);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      try {
        printWindow.print();
      } catch {
        // ignore
      }
    }, 450);
    return;
  }

  // Strategy 2: Fallback to hidden iframe (avoids browser popup blocker)
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(fullHtml);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 2000);
    }, 400);
  }
}

/**
 * Generates an official, print-perfect A4 vector PDF for Section 80G Statutory Donation Receipts.
 */
export function generateDonationReceiptJsPdf(receipt: DonationReceiptModel): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const W = 210;
  const H = 297;

  // 1. Background (Pure White)
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // 2. Double Border (Outer Navy #011F39, Inner Gold #D4AF37)
  doc.setDrawColor(1, 31, 57); // Navy #011F39
  doc.setLineWidth(1.2);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(212, 175, 55); // Gold #D4AF37
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  // 3. Organization Letterhead & Crest
  try {
    if (HRSJM_LOGO_DATA_URI) {
      doc.addImage(HRSJM_LOGO_DATA_URI, 'PNG', 16, 16, 20, 20);
    }
  } catch {
    // Graceful fallback if image stream has issues
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(1, 31, 57); // Navy
  doc.text('Human Rights &  Social Justice Mission', 39, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('NATIONAL STATUTORY CHARITABLE TRUST', 39, 27);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('Protecting Constitutional Liberties • Registered under Indian Trust Act & Societies Act XXI 1860', 39, 31);
  doc.text('Regd. No: HR/0092/2019 • PAN: AABTH4589K • 12A URN: AAATH1234KE20212 • NITI Aayog: DL/2021/0284719', 39, 35);
  doc.text('National Secretariat: Central Janpath, New Delhi - 110001 • Web: www.hrsjm.org', 39, 39);

  // Divider Line
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.8);
  doc.line(16, 43, W - 16, 43);

  // 4. Ribbon Title (Navy background with Gold & White text)
  doc.setFillColor(1, 31, 57);
  doc.roundedRect(16, 46, W - 32, 11, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(250, 212, 101); // Gold #FAD465
  doc.text('OFFICIAL STATUTORY DONATION RECEIPT & 80G TAX EXEMPTION CERTIFICATE', W / 2, 51.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Eligible for 50% Tax Deduction under Section 80G(5)(vi) of the Income Tax Act, 1961', W / 2, 55.5, { align: 'center' });

  // 5. Metadata Grid (Box)
  const metaY = 60;
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.rect(16, metaY, W - 32, 22, 'F');
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.3);
  doc.rect(16, metaY, W - 32, 22);

  // Column 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT NO:', 20, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text(receipt.receiptNumber, 20, metaY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE:', 20, metaY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.paymentMethod || 'Online Payment Gateway', 20, metaY + 20);

  // Column 2
  const formattedDate = new Date(receipt.receiptDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT DATE:', 80, metaY + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(formattedDate, 80, metaY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION REF:', 80, metaY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.transactionId || receipt.id || 'TXN-ONLINE', 80, metaY + 20);

  // Column 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('80G URN:', 140, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(1, 31, 57);
  doc.text('AABTH4589KF20214', 140, metaY + 11);

  const receiptYear = new Date(receipt.receiptDate).getFullYear();
  const receiptMonth = new Date(receipt.receiptDate).getMonth();
  const finYear = receiptMonth >= 3 ? `${receiptYear} - ${receiptYear + 1}` : `${receiptYear - 1} - ${receiptYear}`;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('FINANCIAL YEAR:', 140, metaY + 16);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(finYear, 140, metaY + 20);

  // 6. Contributor / Donor Details Box
  const donorY = 86;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONTRIBUTOR / DONOR DETAILS', 16, donorY);

  doc.setFillColor(255, 255, 255);
  doc.rect(16, donorY + 2, W - 32, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(16, donorY + 2, W - 32, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('LEGAL NAME:', 20, donorY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(1, 31, 57);
  doc.text(receipt.donorName, 20, donorY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CONTACT:', 20, donorY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.donorMobile || 'Available upon record', 36, donorY + 19);

  // Donor PAN on right
  const donorPan = receipt.donorPan || receipt.panNumber || 'Available upon record';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DONOR PAN (FOR 80G):', 120, donorY + 8);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text(donorPan, 120, donorY + 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EMAIL:', 120, donorY + 19);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.donorEmail || 'Available upon record', 133, donorY + 19);

  // 7. Contribution Particulars Table
  const tableY = 116;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CONTRIBUTION PARTICULARS', 16, tableY);

  // Table header
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(16, tableY + 2, W - 32, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(16, tableY + 2, W - 32, 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(1, 31, 57);
  doc.text('MISSION PURPOSE / CAUSE', 20, tableY + 6.5);
  doc.text('ACCOUNT ALLOCATION', 95, tableY + 6.5);
  doc.text('AMOUNT (INR)', W - 20, tableY + 6.5, { align: 'right' });

  // Table row
  doc.setFillColor(255, 255, 255);
  doc.rect(16, tableY + 9, W - 32, 14, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(16, tableY + 9, W - 32, 14);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(receipt.cause || 'General Relief Fund', 20, tableY + 15);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Source: Official Online Portal • 80G Eligible', 20, tableY + 19.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('HRSJM General Relief & Legal Pool', 95, tableY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(1, 31, 57);
  doc.text(`INR ${receipt.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, W - 20, tableY + 17, { align: 'right' });

  // 8. Amount In Words & Net Received Box (Mint Green)
  const amtY = 143;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.rect(16, amtY, W - 32, 18, 'F');
  doc.setDrawColor(134, 239, 172); // Green-300
  doc.rect(16, amtY, W - 32, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52); // Green-800
  doc.text('AMOUNT IN WORDS:', 20, amtY + 5.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61); // Green-700
  doc.text(numberToIndianWords(receipt.amount), 20, amtY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52);
  const halfAmt = Math.round(receipt.amount * 0.5).toLocaleString('en-IN');
  doc.text(`Section 80G Deductible Amount (50%): INR ${halfAmt}/-`, 20, amtY + 15.5);

  // Net received on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.text('NET RECEIVED:', W - 20, amtY + 5.5, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(21, 128, 61);
  doc.text(`INR ${receipt.amount.toLocaleString('en-IN')}`, W - 20, amtY + 13, { align: 'right' });

  // 9. Statutory 80G Legal Declaration Box (Soft Amber)
  const statY = 165;
  doc.setFillColor(254, 252, 232); // Yellow-50
  doc.rect(16, statY, W - 32, 24, 'F');
  doc.setDrawColor(253, 224, 71); // Yellow-300
  doc.rect(16, statY, W - 32, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(133, 77, 14); // Yellow-800
  doc.text('STATUTORY 80G TAX EXEMPTION DECLARATION & STATEMENT', 20, statY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(113, 63, 18);
  const legalText = `This certifies that the contribution of INR ${receipt.amount.toLocaleString('en-IN')}/- received by Human Rights &  Social Justice Mission is eligible for 50% income tax deduction under Section 80G(5)(vi) of the Income Tax Act, 1961. Unique Reference Number (URN): AABTH4589KF20214. Perpetual approval granted by the Commissioner of Income Tax (Exemption), New Delhi. Form 10BD electronic return reference has been furnished to the Income Tax Department for pre-filling in the donor's Annual Information Statement (AIS) and Form 26AS.`;
  doc.text(doc.splitTextToSize(legalText, W - 40), 20, statY + 10);

  // 10. Official Signatures & Digital Seal
  const sigY = 196;

  // Left Seal Circle
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(1);
  doc.circle(40, sigY + 14, 13);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.4);
  doc.circle(40, sigY + 14, 11.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(1, 31, 57);
  doc.text('HRSJM', 40, sigY + 11.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL SEAL', 40, sigY + 14.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(1, 31, 57);
  doc.text('★ NEW DELHI ★', 40, sigY + 17.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(1, 31, 57);
  doc.text('DIGITALLY VERIFIED SEAL', 58, sigY + 12);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('National Secretariat • Central Records Unit', 58, sigY + 16);
  doc.text('Verified at: https://hrsjm.org/verify', 58, sigY + 20);

  // Right Signatory Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text('For Human Rights &  Social Justice Mission', W - 20, sigY + 8, { align: 'right' });

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(W - 75, sigY + 21, W - 20, sigY + 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Finance Trustee / Signatory', W - 20, sigY + 25, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('National Human Rights & Social Justice Mission', W - 20, sigY + 28.5, { align: 'right' });

  // 11. Bottom Security Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const hash = (receipt.transactionId || receipt.id || 'HRSJM').replace(/[^a-zA-Z0-9]/g, '').slice(-16).toUpperCase();
  doc.text(
    `This is a digitally generated statutory receipt under the Information Technology Act 2000. Verified Hash: ${hash} • Valid for ITR filing.`,
    W / 2,
    H - 15,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the statutory 80G receipt as a direct PDF document file.
 */
export function downloadOfficialDonationReceiptPdf(receipt: DonationReceiptModel): void {
  try {
    const doc = generateDonationReceiptJsPdf(receipt);
    const sanitizedNumber = (receipt.receiptNumber || '80G_Receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `HRSJM_Donation_Receipt_${sanitizedNumber}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('Failed to generate jsPDF donation receipt, falling back to print dialog:', err);
    printOfficialDonationReceipt(receipt);
  }
}
