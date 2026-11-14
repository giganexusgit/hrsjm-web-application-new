import { jsPDF } from 'jspdf';
import { HRSJM_LOGO_DATA_URI } from '../../../../assets/logoBase64';
import type { ExpenseEntryItem } from '../types/expenses.types';
import { formatINR } from '../types/expenses.types';
import { numberToIndianWords } from '../../donations/utils/donationReceiptGenerator';

export function generateOfficialExpenseVoucherHtml(voucher: ExpenseEntryItem): string {
  const formattedDate = new Date(voucher.expense_date || voucher.created_at || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedDateTime = new Date(voucher.created_at || Date.now()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const amountInWords = numberToIndianWords(voucher.amount);
  const accountName = voucher.expense_account?.account_name || 'General Operations & Administration';
  const accountCode = voucher.expense_account?.account_code || '5002';
  
  const paymentMethodDisplay =
    voucher.payment_method === 'UPI'
      ? 'UPI (Digital Transfer)'
      : voucher.payment_method === 'CASH'
      ? 'Cash-in-Hand'
      : voucher.payment_method === 'BANK_TRANSFER'
      ? 'Bank Transfer (NEFT/RTGS/IMPS)'
      : voucher.payment_method;

  const disbursingAccount =
    voucher.payment_method === 'UPI'
      ? 'UPI — Bank Account'
      : voucher.paid_from_account?.account_name ||
        (voucher.payment_method === 'CASH' ? 'Cash Account (Petty Cash)' : 'Bank Account');

  const isCancelled = voucher.status === 'CANCELLED';
  const isWebApp = Boolean(
    voucher.reference_number?.toUpperCase().startsWith('WEB-APP') ||
    voucher.description?.includes('[Source: Web App]')
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Payment Voucher - ${voucher.voucher_number}</title>
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 12px;
      color: #011F39;
      background: #FFFFFF;
      font-size: 11px;
      line-height: 1.4;
    }
    .voucher-wrapper {
      max-width: 820px;
      margin: 0 auto;
      border: 2px solid #011F39;
      border-radius: 8px;
      padding: 18px 22px;
      position: relative;
      background: #FFFFFF;
      overflow: hidden;
    }
    /* Subtle Guilloche Watermark */
    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 64px;
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
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .logo-box {
      width: 68px;
      height: 68px;
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
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 18px;
      font-weight: 900;
      color: #011F39;
      letter-spacing: 0.5px;
      margin: 0;
      line-height: 1.2;
    }
    .org-hindi {
      font-size: 12px;
      font-weight: 700;
      color: #926A04;
      margin-top: 2px;
    }
    .org-tagline {
      font-size: 9px;
      color: #475569;
      font-style: italic;
      margin-top: 1px;
    }
    .org-reg-line {
      font-size: 8.5px;
      color: #334155;
      font-weight: 600;
      margin-top: 4px;
      line-height: 1.3;
    }
    /* Voucher Title Ribbon */
    .voucher-ribbon {
      background: linear-gradient(90deg, #011F39 0%, #06294D 100%);
      color: #FAD465;
      padding: 7px 16px;
      border-radius: 6px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid #E9B82E;
    }
    .voucher-title {
      font-family: Georgia, serif;
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin: 0;
    }
    .voucher-num-box {
      text-align: right;
    }
    .voucher-num-label {
      font-size: 8.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #FDF4DC;
    }
    .voucher-num {
      font-family: monospace;
      font-size: 14px;
      font-weight: 800;
      color: #FFFFFF;
    }
    /* Meta 4-column Grid */
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      background: #F8FAFC;
      border: 1px solid #CBD5E1;
      border-radius: 6px;
      font-size: 10.5px;
    }
    .meta-table td {
      padding: 6px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: middle;
    }
    .meta-label {
      color: #64748B;
      font-weight: 600;
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      width: 25%;
    }
    .meta-val {
      font-weight: 700;
      color: #0F172A;
      width: 25%;
    }
    /* Section Headings */
    .section-title {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #011F39;
      border-bottom: 1.5px solid #011F39;
      padding-bottom: 2px;
      margin: 10px 0 6px 0;
    }
    /* Payee & Allocation Table */
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 10px;
      font-size: 10.5px;
    }
    .data-table th {
      background: #F1F5F9;
      color: #334155;
      font-weight: 700;
      padding: 5px 10px;
      border: 1px solid #CBD5E1;
      text-align: left;
      font-size: 9px;
      text-transform: uppercase;
    }
    .data-table td {
      padding: 6px 10px;
      border: 1px solid #E2E8F0;
      vertical-align: top;
    }
    /* Amount Highlight Box */
    .amount-card {
      background: #F8FAFC;
      border: 1.5px solid #011F39;
      border-radius: 6px;
      padding: 8px 12px;
      margin: 10px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .amount-in-words-box {
      flex: 1;
      padding-right: 12px;
    }
    .amount-words-title {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
      letter-spacing: 0.4px;
    }
    .amount-words-val {
      font-size: 11.5px;
      font-weight: 800;
      color: #011F39;
      margin-top: 2px;
    }
    .amount-digits-box {
      text-align: right;
      padding-left: 12px;
      border-left: 1.5px solid #CBD5E1;
    }
    .amount-digits-title {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      color: #475569;
    }
    .amount-digits-val {
      font-size: 20px;
      font-weight: 900;
      color: #011F39;
      font-family: Georgia, serif;
      line-height: 1.1;
      margin-top: 2px;
    }
    /* Double-Entry Journal Table */
    .journal-box {
      background: #FAFAFA;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 7px 10px;
      margin-bottom: 10px;
    }
    .journal-header {
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
      margin-bottom: 5px;
      border-bottom: 1px solid #E2E8F0;
      padding-bottom: 3px;
    }
    .journal-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      padding: 2px 0;
      color: #1E293B;
    }
    /* Signatures & Seals Block */
    .signature-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 16px;
      padding-top: 10px;
      border-top: 1px dashed #CBD5E1;
    }
    .sign-col {
      text-align: center;
      width: 30%;
    }
    .sign-line {
      height: 32px;
      border-bottom: 1px solid #011F39;
      margin-bottom: 4px;
    }
    .sign-title {
      font-size: 9.5px;
      font-weight: 800;
      color: #011F39;
      text-transform: uppercase;
    }
    .sign-role {
      font-size: 8px;
      color: #64748B;
    }
    .seal-graphic {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: 1.5px dashed #06294D;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-size: 6.5px;
      font-weight: 800;
      color: #06294D;
      text-transform: uppercase;
      padding: 2px;
      line-height: 1.1;
      background: #F8FAFC;
      margin-bottom: 3px;
    }
    /* Statutory Bottom Verification Footer */
    .footer-note {
      text-align: center;
      font-size: 8px;
      color: #64748B;
      margin-top: 12px;
      border-top: 1px solid #E2E8F0;
      padding-top: 6px;
      line-height: 1.35;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .voucher-wrapper {
        border-width: 1.5px;
        box-shadow: none !important;
        margin: 0 !important;
        padding: 12px 16px !important;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="voucher-wrapper">
    <div class="watermark">HRSJM VOUCHER</div>

    <!-- Official Header / Letterhead -->
    <div class="letterhead">
      <div class="logo-box">
        <img src="${HRSJM_LOGO_DATA_URI}" alt="HRSJM Official Logo" />
      </div>
      <div class="org-details">
        <h1 class="org-title">HUMAN RIGHTS &amp; SOCIAL JUSTICE MISSION</h1>
        <div class="org-hindi">मानव अधिकार एवं सामाजिक न्याय मिशन</div>
        <div class="org-tagline">National Organization for Human Rights Advocacy, Social Justice, Legal Aid &amp; Public Welfare</div>
        <div class="org-reg-line">
          Registered under Societies Registration Act XXI of 1860 | NITI Aayog NGO-Darpan Regd: UP/2021/0285655<br/>
          Central Secretariat: New Delhi / Lucknow (U.P.), India | Email: contact@hrsjm.org | Web: www.hrsjm.org
        </div>
      </div>
    </div>

    <!-- Official Voucher Ribbon Banner -->
    <div class="voucher-ribbon">
      <div>
        <div class="voucher-title">
          PAYMENT DISBURSEMENT VOUCHER
          ${isCancelled ? '<span style="color: #F87171; margin-left: 8px;">[CANCELLED]</span>' : ''}
          ${isWebApp ? '<span style="background: rgba(255,255,255,0.2); padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-left: 6px;">Web App</span>' : ''}
        </div>
        <div style="font-size: 9px; color: #FDF4DC; margin-top: 1px;">
          Official Double-Entry Organizational Expenditure Receipt
        </div>
      </div>
      <div class="voucher-num-box">
        <div class="voucher-num-label">Voucher Number</div>
        <div class="voucher-num">${voucher.voucher_number}</div>
      </div>
    </div>

    <!-- Primary Metadata Grid -->
    <table class="meta-table">
      <tr>
        <td class="meta-label">Voucher Date</td>
        <td class="meta-val">${formattedDate}</td>
        <td class="meta-label">Payment Method</td>
        <td class="meta-val">${paymentMethodDisplay}</td>
      </tr>
      <tr>
        <td class="meta-label">Disbursing Account</td>
        <td class="meta-val">${disbursingAccount}</td>
        <td class="meta-label">Ref / Transaction #</td>
        <td class="meta-val" style="font-family: monospace;">${voucher.reference_number || '—'}</td>
      </tr>
      <tr>
        <td class="meta-label">Audit Status</td>
        <td class="meta-val" style="color: ${isCancelled ? '#DC2626' : '#15803D'};">
          ${voucher.status === 'POSTED' ? 'AUDITED & POSTED' : voucher.status}
        </td>
        <td class="meta-label">Generated Timestamp</td>
        <td class="meta-val" style="font-size: 9.5px;">${formattedDateTime}</td>
      </tr>
    </table>

    <!-- Beneficiary & Classification Details -->
    <div class="section-title">Disbursement Particulars &amp; Classification</div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width: 28%;">Recipient / Payee</th>
          <th style="width: 32%;">Accounting Classification (Head)</th>
          <th style="width: 40%;">Detailed Purpose &amp; Narration</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <div style="font-size: 12px; font-weight: 800; color: #011F39;">${voucher.paid_to}</div>
            <div style="font-size: 9px; color: #64748B; margin-top: 2px;">Authorized Recipient</div>
          </td>
          <td>
            <div style="font-weight: 700; color: #011F39;">${accountName}</div>
            <div style="font-size: 9px; color: #64748B; font-family: monospace; margin-top: 2px;">Chart of Accounts: #${accountCode}</div>
          </td>
          <td>
            <div style="color: #334155; line-height: 1.4;">${voucher.description || 'Disbursement for approved organizational activities and operations.'}</div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Amount Card -->
    <div class="amount-card">
      <div class="amount-in-words-box">
        <div class="amount-words-title">Amount Passed for Payment (in Words)</div>
        <div class="amount-words-val">${amountInWords}</div>
      </div>
      <div class="amount-digits-box">
        <div class="amount-digits-title">Total Disbursed (INR)</div>
        <div class="amount-digits-val" style="${isCancelled ? 'text-decoration: line-through; color: #94A3B8;' : ''}">
          ${formatINR(voucher.amount)}
        </div>
      </div>
    </div>

    <!-- Double-Entry Journal Audit Lines -->
    <div class="journal-box">
      <div class="journal-header">
        <span>Automated Double-Entry General Ledger Posting</span>
        <span>${voucher.accounting_entry?.entry_number ? `Journal Ref: ${voucher.accounting_entry.entry_number}` : 'Statutory Double-Entry'}</span>
      </div>
      <div class="journal-row">
        <span><strong>Dr. (Debit Expense):</strong> ${accountName} (A/c #${accountCode})</span>
        <span style="font-weight: 700; font-family: monospace;">+ ${formatINR(voucher.amount)}</span>
      </div>
      <div class="journal-row">
        <span><strong>Cr. (Credit Disbursing Asset):</strong> ${disbursingAccount}</span>
        <span style="font-weight: 700; font-family: monospace;">- ${formatINR(voucher.amount)}</span>
      </div>
    </div>

    <!-- Signatures & Authorization Section -->
    <div class="signature-row">
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Prepared By</div>
        <div class="sign-role">Accounts Officer / Cashier</div>
      </div>

      <div class="sign-col">
        <div class="seal-graphic">
          HRSJM<br/>OFFICIAL<br/>SEAL
        </div>
        <div class="sign-title">Verified &amp; Audited</div>
        <div class="sign-role">Internal Finance Auditor</div>
      </div>

      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Authorized Signatory</div>
        <div class="sign-role">Treasurer / General Secretary</div>
      </div>
    </div>

    <!-- Official Statutory Footer -->
    <div class="footer-note">
      This is an official computer-generated payment disbursement voucher of <strong>Human Rights &amp; Social Justice Mission</strong>.<br/>
      Certified for statutory society audit under the Societies Registration Act XXI of 1860. Retain for tax &amp; financial records.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Clean isolated popup/iframe print that excludes browser navigation and full web app layout
 */
export function printOfficialExpenseVoucher(voucher: ExpenseEntryItem): void {
  const fullHtml = generateOfficialExpenseVoucherHtml(voucher);

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
      } catch (e) {
        console.warn('Print window print error:', e);
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
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('Iframe print error:', e);
      } finally {
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }
    }, 450);
  }
}

/**
 * Generates an official, pixel-perfect PDF of the expense voucher using jsPDF
 */
export function generateExpenseVoucherJsPdf(voucher: ExpenseEntryItem): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const W = 210;
  const H = 297;

  // 1. Pure White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, W, H, 'F');

  // 2. Official Outer & Inner Border
  doc.setDrawColor(1, 31, 57); // Navy #011F39
  doc.setLineWidth(1.2);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(212, 175, 55); // Gold #D4AF37
  doc.setLineWidth(0.4);
  doc.rect(12, 12, W - 24, H - 24);

  // 3. Organization Crest & Official Letterhead
  try {
    if (HRSJM_LOGO_DATA_URI) {
      doc.addImage(HRSJM_LOGO_DATA_URI, 'PNG', 16, 15, 20, 20);
    }
  } catch {
    // fallback if logo has issue
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(1, 31, 57);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', 40, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(180, 83, 9); // Amber Gold
  doc.text('NATIONAL ORGANIZATION FOR HUMAN RIGHTS ADVOCACY & SOCIAL JUSTICE', 40, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(71, 85, 105);
  doc.text('Registered under Societies Registration Act XXI of 1860 • NITI Aayog NGO-Darpan Regd: UP/2021/0285655', 40, 30.5);
  doc.text('Section 12A & 80G Certified • Central Secretariat: New Delhi / Lucknow, India • Web: www.hrsjm.org', 40, 34.5);

  // Divider Line
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.6);
  doc.line(16, 38, W - 16, 38);

  // 4. Ribbon Banner
  doc.setFillColor(1, 31, 57);
  doc.roundedRect(16, 41, W - 32, 10, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(250, 212, 101); // Gold
  doc.text('OFFICIAL PAYMENT DISBURSEMENT VOUCHER', 22, 47.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`VOUCHER NO: ${voucher.voucher_number}`, W - 22, 47.5, { align: 'right' });

  // 5. Metadata Table Grid
  const metaY = 54;
  doc.setFillColor(248, 250, 252);
  doc.rect(16, metaY, W - 32, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(16, metaY, W - 32, 22);

  const formattedDate = new Date(voucher.expense_date || voucher.created_at || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const paymentMethodDisplay =
    voucher.payment_method === 'UPI'
      ? 'UPI (Digital Transfer)'
      : voucher.payment_method === 'CASH'
      ? 'Cash-in-Hand'
      : voucher.payment_method === 'BANK_TRANSFER'
      ? 'Bank Transfer'
      : voucher.payment_method;

  const disbursingAccount =
    voucher.payment_method === 'UPI'
      ? 'UPI — Bank Account'
      : voucher.paid_from_account?.account_name ||
        (voucher.payment_method === 'CASH' ? 'Cash Account' : 'Bank Account');

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('VOUCHER DATE:', 20, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text(formattedDate, 52, metaY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT METHOD:', 110, metaY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text(paymentMethodDisplay, 146, metaY + 6);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DISBURSING A/C:', 20, metaY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(disbursingAccount, 52, metaY + 13);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('EXTERNAL REF #:', 110, metaY + 13);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(voucher.reference_number || '—', 146, metaY + 13);

  // Row 3
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('AUDIT STATUS:', 20, metaY + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(voucher.status === 'CANCELLED' ? 220 : 21, voucher.status === 'CANCELLED' ? 38 : 128, voucher.status === 'CANCELLED' ? 38 : 61);
  doc.text(voucher.status === 'POSTED' ? 'AUDITED & POSTED' : voucher.status, 52, metaY + 19.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('APPLICATION SOURCE:', 110, metaY + 19.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const isWebApp = Boolean(
    voucher.reference_number?.toUpperCase().startsWith('WEB-APP') ||
    voucher.description?.includes('[Source: Web App]')
  );
  doc.text(isWebApp ? 'Web App (Official)' : 'Direct ERP Entry', 146, metaY + 19.5);

  // 6. Section Heading: Disbursement Particulars
  const partY = 82;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text('DISBURSEMENT PARTICULARS & BENEFICIARY CLASSIFICATION', 16, partY);
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.4);
  doc.line(16, partY + 1.5, W - 16, partY + 1.5);

  // Table box
  const tableY = partY + 4;
  doc.setFillColor(241, 245, 249);
  doc.rect(16, tableY, W - 32, 7, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(16, tableY, W - 32, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('PAID TO (RECIPIENT)', 20, tableY + 5);
  doc.text('ACCOUNTING HEAD (CODE)', 80, tableY + 5);
  doc.text('PURPOSE & NARRATION', 140, tableY + 5);

  doc.line(16, tableY + 7, W - 16, tableY + 7);

  // Table row values
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(1, 31, 57);
  doc.text(voucher.paid_to || 'Recipient', 20, tableY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Payee / Beneficiary', 20, tableY + 19);

  const accountName = voucher.expense_account?.account_name || 'General Operations';
  const accountCode = voucher.expense_account?.account_code || '5002';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(1, 31, 57);
  doc.text(accountName, 80, tableY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(100, 116, 139);
  doc.text(`Account Code: #${accountCode}`, 80, tableY + 19);

  // Narration (multi-line text)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const splitNarration = doc.splitTextToSize(
    voucher.description || 'Approved expenditure for official organizational operations.',
    50
  );
  doc.text(splitNarration, 140, tableY + 13);

  // 7. Amount Box
  const amountY = tableY + 32;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(16, amountY, W - 32, 18, 2, 2, 'F');
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.5);
  doc.roundedRect(16, amountY, W - 32, 18, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('AMOUNT PASSED FOR PAYMENT (IN WORDS):', 20, amountY + 6);

  const amountInWords = numberToIndianWords(voucher.amount);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(1, 31, 57);
  const splitWords = doc.splitTextToSize(amountInWords, 110);
  doc.text(splitWords, 20, amountY + 12);

  // Amount in Digits Box (Right side)
  doc.line(146, amountY, 146, amountY + 18);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('TOTAL DISBURSED (INR)', 150, amountY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(1, 31, 57);
  doc.text(formatINR(voucher.amount), 150, amountY + 13.5);

  // 8. Double-Entry Journal Box
  const journalY = amountY + 22;
  doc.setFillColor(250, 250, 250);
  doc.rect(16, journalY, W - 32, 24, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(16, journalY, W - 32, 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('AUTOMATED DOUBLE-ENTRY GENERAL LEDGER POSTINGS', 20, journalY + 5.5);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`Ref: ${voucher.accounting_entry?.entry_number || 'JV-AUTO'}`, W - 22, journalY + 5.5, { align: 'right' });

  doc.line(16, journalY + 8, W - 16, journalY + 8);

  // Dr row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Dr. (Debit Expense): ${accountName} (A/c #${accountCode})`, 20, journalY + 13.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(21, 128, 61);
  doc.text(`+ ${formatINR(voucher.amount)}`, W - 22, journalY + 13.5, { align: 'right' });

  // Cr row
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`Cr. (Credit Disbursing Asset): ${disbursingAccount}`, 20, journalY + 19.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(194, 65, 12);
  doc.text(`- ${formatINR(voucher.amount)}`, W - 22, journalY + 19.5, { align: 'right' });

  // 9. Signatures & Official Seals
  const sigY = journalY + 34;

  // Col 1: Prepared By
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.4);
  doc.line(22, sigY + 16, 68, sigY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(1, 31, 57);
  doc.text('PREPARED BY', 45, sigY + 20.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Accounts Officer / Cashier', 45, sigY + 24, { align: 'center' });

  // Col 2: Circular Seal
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.8);
  doc.circle(105, sigY + 10, 10);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.3);
  doc.circle(105, sigY + 10, 8.8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(1, 31, 57);
  doc.text('HRSJM', 105, sigY + 8.5, { align: 'center' });
  doc.setFontSize(4.2);
  doc.setTextColor(180, 83, 9);
  doc.text('OFFICIAL SEAL', 105, sigY + 11, { align: 'center' });
  doc.setFontSize(4);
  doc.setTextColor(1, 31, 57);
  doc.text('VERIFIED', 105, sigY + 13.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(1, 31, 57);
  doc.text('VERIFIED & AUDITED', 105, sigY + 25, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Internal Finance Auditor', 105, sigY + 28.5, { align: 'center' });

  // Col 3: Authorized Signatory
  doc.setDrawColor(1, 31, 57);
  doc.setLineWidth(0.4);
  doc.line(142, sigY + 16, 188, sigY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(1, 31, 57);
  doc.text('AUTHORIZED SIGNATORY', 165, sigY + 20.5, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('Treasurer / General Secretary', 165, sigY + 24, { align: 'center' });

  // 10. Official Statutory Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'This is an official computer-generated payment disbursement voucher of Human Rights & Social Justice Mission.',
    W / 2,
    H - 18,
    { align: 'center' }
  );
  doc.text(
    'Certified for statutory society audit under Societies Registration Act XXI of 1860. Retain for official tax & financial records.',
    W / 2,
    H - 14.5,
    { align: 'center' }
  );

  return doc;
}

/**
 * Downloads the official expense voucher as a direct high-quality PDF document file.
 */
export function downloadOfficialExpenseVoucherPdf(voucher: ExpenseEntryItem): void {
  try {
    const doc = generateExpenseVoucherJsPdf(voucher);
    const sanitizedNumber = (voucher.voucher_number || 'EXP_VOUCHER').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `HRSJM_Expense_Voucher_${sanitizedNumber}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('Failed to generate jsPDF expense voucher, falling back to print dialog:', err);
    printOfficialExpenseVoucher(voucher);
  }
}
