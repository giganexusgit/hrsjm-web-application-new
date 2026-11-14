import { jsPDF } from 'jspdf';
import type { MemberProfile, MemberPassbookEntry } from '../types/member.types';

/**
 * Generates an official HRSJM Certificate of Membership (A4 Landscape PDF).
 */
export const generateMemberCertificatePdf = (member: MemberProfile): jsPDF => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4', // 297 x 210 mm
  });

  const W = 297;
  const H = 210;

  // 1. Background Tint (Ivory)
  doc.setFillColor(254, 252, 246);
  doc.rect(0, 0, W, H, 'F');

  // 2. Gold & Navy Double Border
  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(2.5);
  doc.rect(10, 10, W - 20, H - 20);

  doc.setDrawColor(15, 40, 96); // Deep Navy
  doc.setLineWidth(0.8);
  doc.rect(13, 13, W - 26, H - 26);

  // Corner Accents (Gold corner squares)
  doc.setFillColor(212, 175, 55);
  doc.rect(11, 11, 4, 4, 'F');
  doc.rect(W - 15, 11, 4, 4, 'F');
  doc.rect(11, H - 15, 4, 4, 'F');
  doc.rect(W - 15, H - 15, 4, 4, 'F');

  // 3. Header: Mission Name & Registry
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(15, 40, 96);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 32, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // Amber
  doc.text('MANAV ADHIKAR & SAMAJIK NYAY • REG. UNDER SOCIETIES ACT XXI OF 1860', W / 2, 40, {
    align: 'center',
  });

  // Thin Gold Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.75);
  doc.line(60, 45, W - 60, 45);

  // 4. Certificate Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(15, 40, 96);
  doc.text('CERTIFICATE OF MEMBERSHIP', W / 2, 60, { align: 'center' });

  // 5. Body Text
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(100, 116, 139);
  doc.text('This is to proudly certify that', W / 2, 74, { align: 'center' });

  // Member Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(15, 40, 96);
  doc.text(member.fullName || 'Registered Member', W / 2, 90, { align: 'center' });

  // Underline beneath name
  const nameWidth = Math.max(90, (member.fullName?.length || 10) * 8);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.2);
  doc.line((W - nameWidth) / 2, 94, (W + nameWidth) / 2, 94);

  // Recognition Statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `is officially enrolled as an authorized ${member.categoryTitle} of the Mission,`,
    W / 2,
    106,
    { align: 'center' }
  );
  doc.text(
    'pledged to advocate for human rights, protect social justice, and support community empowerment.',
    W / 2,
    114,
    { align: 'center' }
  );

  // 6. Member Details Badge Box
  const boxW = 190;
  const boxH = 26;
  const boxX = (W - boxW) / 2;
  const boxY = 124;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(boxX, boxY, boxW, boxH, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('MEMBER ID:', boxX + 10, boxY + 11);
  doc.text('JOINED ON:', boxX + 72, boxY + 11);
  doc.text('VALID TILL:', boxX + 134, boxY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 40, 96);
  doc.text(member.membershipNumber, boxX + 10, boxY + 19);
  doc.text(member.joiningDate, boxX + 72, boxY + 19);
  doc.text(member.validUpto, boxX + 134, boxY + 19);

  // 7. Signatures & Official Seal
  const sigY = 172;

  // Left Signatory
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.5);
  doc.line(35, sigY, 95, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 96);
  doc.text('National President', 65, sigY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('HRSJM National Governing Council', 65, sigY + 11, { align: 'center' });

  // Center Official Seal Badge
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(1.5);
  doc.circle(W / 2, sigY - 2, 14, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(180, 83, 9);
  doc.text('HRSJM', W / 2, sigY - 5, { align: 'center' });
  doc.text('OFFICIAL SEAL', W / 2, sigY + 1, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('★ VERIFIED ★', W / 2, sigY + 6, { align: 'center' });

  // Right Signatory
  doc.line(W - 95, sigY, W - 35, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 40, 96);
  doc.text('General Secretary', W - 65, sigY + 6, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Human Rights Mission Secretariat', W - 65, sigY + 11, { align: 'center' });

  return doc;
};

/**
 * Downloads official Certificate PDF
 */
export const downloadMemberCertificatePdf = (member: MemberProfile): void => {
  const doc = generateMemberCertificatePdf(member);
  const safeName = member.fullName.replace(/\s+/g, '_').toLowerCase();
  doc.save(`HRSJM_Certificate_${safeName}_${member.membershipNumber}.pdf`);
};

/**
 * Generates official Printable Membership Card PDF (CR80 PVC standard: 85.6 x 54 mm).
 */
export const generateMemberCardPdf = (member: MemberProfile): jsPDF => {
  const W = 85.6;
  const H = 54.0;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [W, H],
  });

  // ═════════ FRONT SIDE ═════════
  // Navy background
  doc.setFillColor(6, 41, 77); // #06294D
  doc.rect(0, 0, W, H, 'F');

  // Top header banner (Gold/Ivory)
  doc.setFillColor(255, 249, 230);
  doc.rect(0, 0, W, 13, 'F');

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.6);
  doc.line(0, 13, W, 13);

  // Top header text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 41, 77);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 5.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(180, 83, 9);
  doc.text('MANAV ADHIKAR SANRAKSHAN • REG. ACT XXI OF 1860', W / 2, 9.5, { align: 'center' });

  // Photo placeholder box
  const photoW = 20;
  const photoH = 24;
  const photoX = 6;
  const photoY = 17;

  doc.setFillColor(240, 244, 248);
  doc.setDrawColor(250, 212, 101);
  doc.setLineWidth(0.8);
  doc.roundedRect(photoX, photoY, photoW, photoH, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text('PHOTO', photoX + 10, photoY + 13, { align: 'center' });

  // Member Information
  const infoX = 30;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(member.fullName, infoX, 21);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(250, 212, 101); // Gold
  doc.text(`ID: ${member.membershipNumber}`, infoX, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(220, 228, 236);
  doc.text(`TIER: ${member.categoryTitle}`, infoX, 31);
  doc.text(`BLOOD GROUP: ${member.bloodGroup || 'N/A'}`, infoX, 35);
  doc.text(`VALID FROM: ${member.validFrom}`, infoX, 39);
  doc.text(`VALID UPTO: ${member.validUpto}`, infoX, 43);

  // Bottom footer strip
  doc.setFillColor(1, 31, 57);
  doc.rect(0, 48, W, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(250, 212, 101);
  doc.text('OFFICIAL ACCREDITED IDENTITY CARD • NOT TRANSFERABLE', W / 2, 52, { align: 'center' });

  // ═════════ BACK SIDE ═════════
  doc.addPage([W, H], 'landscape');

  doc.setFillColor(250, 247, 240); // Ivory
  doc.rect(0, 0, W, H, 'F');

  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.rect(2, 2, W - 4, H - 4);

  // Back Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 41, 77);
  doc.text('MEMBER VERIFICATION & JURISDICTION', W / 2, 8, { align: 'center' });

  // QR box
  const qrBoxSize = 22;
  const qrX = 6;
  const qrY = 12;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(200, 210, 220);
  doc.rect(qrX, qrY, qrBoxSize, qrBoxSize, 'FD');

  doc.setFontSize(5);
  doc.setTextColor(100, 116, 139);
  doc.text('SCAN QR TO', qrX + 11, qrY + 10, { align: 'center' });
  doc.text('VERIFY STATUS', qrX + 11, qrY + 14, { align: 'center' });

  // Terms and Contact
  const backTextX = 32;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5);
  doc.setTextColor(51, 65, 85);
  doc.text(`Chapter: ${member.chapter}`, backTextX, 15);
  doc.text(`Contact: ${member.phone}`, backTextX, 19);
  doc.text(`Emergency Helpline: +91 11 2345 6789`, backTextX, 23);
  doc.text('If found, return to: Central Secretariat,', backTextX, 27);
  doc.text('Human Rights & Social Justice Mission, New Delhi.', backTextX, 31);

  // Signatures on back
  doc.line(backTextX, 42, backTextX + 22, 42);
  doc.text('Authorized Signatory', backTextX + 11, 45, { align: 'center' });

  return doc;
};

/**
 * Downloads official Member Card PDF
 */
export const downloadMemberCardPdf = (member: MemberProfile): void => {
  const doc = generateMemberCardPdf(member);
  const safeName = member.fullName.replace(/\s+/g, '_').toLowerCase();
  doc.save(`HRSJM_ID_Card_${safeName}_${member.membershipNumber}.pdf`);
};

/**
 * Triggers standard browser print dialog for ID Card
 */
export const printMemberCardHtml = (member: MemberProfile): void => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>HRSJM Official ID Card - ${member.fullName} (${member.membershipNumber})</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 20px; background-color: #FAF7F0; color: #011F39; text-align: center; }
          .title { font-size: 18px; font-weight: 800; color: #06294D; margin-bottom: 6px; text-transform: uppercase; }
          .sub { font-size: 13px; color: #64748B; margin-bottom: 24px; }
          .cards-row { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; margin-bottom: 30px; }
          .card { width: 320px; height: 480px; border-radius: 14px; border: 1px solid #CBD5E1; overflow: hidden; background: #06294D; color: #FFFFFF; display: flex; flex-direction: column; text-align: left; }
          .card-back { background: #FAF7F0; color: #06294D; border: 2px solid #D4AF37; }
          .c-header { background: #011F39; padding: 14px; text-align: center; border-bottom: 2px solid #FAD465; }
          .c-title { font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.5px; }
          .c-sub { font-size: 10px; color: #FAD465; margin-top: 3px; }
          .c-body { padding: 18px; display: flex; flex-direction: column; align-items: center; flex: 1; }
          .photo { width: 100px; height: 100px; border-radius: 50%; border: 3px solid #FAD465; object-fit: cover; margin-bottom: 12px; }
          .name { font-size: 16px; font-weight: 800; color: #FFFFFF; margin-bottom: 4px; }
          .id-badge { background: #FAD465; color: #06294D; font-size: 11px; font-weight: 700; padding: 2px 8px; borderRadius: 4px; margin-bottom: 16px; }
          .fields { width: 100%; font-size: 12px; color: #DCE4EC; line-height: 1.7; }
          .fields strong { color: #FFFFFF; }
          .c-footer { background: #011F39; padding: 8px; font-size: 10px; color: #FAD465; text-align: center; font-weight: 700; }
        </style>
      </head>
      <body>
        <div class="title">Human Rights & Social Justice Mission</div>
        <div class="sub">Official Digital Member Credential • Registered under Act XXI of 1860</div>
        <div class="cards-row">
          <!-- Front -->
          <div class="card">
            <div class="c-header">
              <div class="c-title">HUMAN RIGHTS & SOCIAL JUSTICE MISSION</div>
              <div class="c-sub">MANAV ADHIKAR SANRAKSHAN TRUST</div>
            </div>
            <div class="c-body">
              <img src="${member.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}" class="photo" alt="Photo" />
              <div class="name">${member.fullName}</div>
              <div class="id-badge">${member.membershipNumber}</div>
              <div class="fields">
                <div>Category: <strong>${member.categoryTitle}</strong></div>
                <div>Blood Group: <strong>${member.bloodGroup || 'O+'}</strong></div>
                <div>Chapter: <strong>${member.chapter}</strong></div>
                <div>Valid Upto: <strong>${member.validUpto}</strong></div>
              </div>
            </div>
            <div class="c-footer">OFFICIAL MEMBER IDENTITY CARD</div>
          </div>
          <!-- Back -->
          <div class="card card-back">
            <div class="c-header" style="background: #06294D;">
              <div class="c-title" style="color:#FAD465;">TERMS & VERIFICATION</div>
              <div class="c-sub" style="color:#FFFFFF;">CENTRAL SECRETARIAT, NEW DELHI</div>
            </div>
            <div class="c-body" style="justify-content: space-between;">
              <div style="font-size: 12px; line-height: 1.6; color: #334155; margin-top: 10px;">
                <p>1. This card certifies active membership in the Human Rights & Social Justice Mission.</p>
                <p>2. Non-transferable and remains the property of the Mission.</p>
                <p>3. In case of emergency or verification, visit <strong>hrsjm.org/verify</strong></p>
                <p>Helpline: +91 11 2345 6789</p>
              </div>
              <div style="border-top: 1px solid #CBD5E1; padding-top: 10px; width: 100%; text-align: center; font-size: 11px; font-weight: 700; color: #06294D;">
                General Secretary • National President
              </div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
};


/**
 * Converts numbers into Indian English words
 */
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ',
    'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ',
    'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

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
  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;

  if (crore > 0) words += inWords(crore) + 'Crore ';
  if (lakh > 0) words += inWords(lakh) + 'Lakh ';
  if (thousand > 0) words += inWords(thousand) + 'Thousand ';
  if (num > 0) words += inWords(num);

  return words.trim() + ' Only';
}

/**
 * Generates an official 80G Tax Exemption Receipt (A4 Portrait PDF)
 */
export const generate80GReceiptPdf = (member: MemberProfile, entry: MemberPassbookEntry): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const W = 210;
  const H = 297;

  // Background tint
  doc.setFillColor(254, 252, 246);
  doc.rect(0, 0, W, H, 'F');

  // Navy & Gold Border
  doc.setDrawColor(6, 41, 77); // Navy
  doc.setLineWidth(1.5);
  doc.rect(12, 12, W - 24, H - 24);

  doc.setDrawColor(212, 175, 55); // Gold
  doc.setLineWidth(0.5);
  doc.rect(14, 14, W - 28, H - 28);

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(6, 41, 77);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 26, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Registered under Indian Trust Act 1882 • Section 12A & 80G Certified Non-Profit Entity', W / 2, 31, {
    align: 'center',
  });
  doc.text('National Secretariat: 12/4, Institutional Area, Lodhi Road, New Delhi - 110003', W / 2, 35, {
    align: 'center',
  });
  doc.text('PAN: AAATH1234F  •  80G Order No: CIT(E)/DELHI/80G/2021-22/A/10492  •  Validity: Perpetual', W / 2, 39, {
    align: 'center',
  });

  // Divider Line
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.8);
  doc.line(20, 43, W - 20, 43);

  // Title Ribbon
  doc.setFillColor(6, 41, 77);
  doc.roundedRect(40, 47, W - 80, 10, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(250, 212, 101); // Gold text
  doc.text('OFFICIAL 80G DONATION & CONTRIBUTION RECEIPT', W / 2, 53.5, { align: 'center' });

  // Receipt Meta Grid
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 62, W - 40, 22, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 62, W - 40, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 41, 77);
  doc.text('Receipt No:', 24, 69);
  doc.text('Date:', 120, 69);
  doc.text('Payment Mode:', 24, 78);
  doc.text('Transaction Ref:', 120, 78);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(entry.receiptNumber, 52, 69);
  doc.text(new Date(entry.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), 148, 69);
  doc.text(entry.paymentMethod, 52, 78);
  doc.text(entry.transactionId, 148, 78);

  // Donor Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 41, 77);
  doc.text('DONOR / CONTRIBUTOR PARTICULARS', 20, 92);

  doc.setFillColor(255, 255, 255);
  doc.rect(20, 95, W - 40, 36, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 95, W - 40, 36);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Received with thanks from:', 24, 103);
  doc.text('Membership ID:', 24, 111);
  doc.text('Donor PAN Number:', 120, 111);
  doc.text('Registered Address:', 24, 119);
  doc.text('Mobile / Email:', 24, 127);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 41, 77);
  doc.text(member.fullName, 68, 103);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(member.membershipNumber, 68, 111);
  doc.text(entry.donorPan || 'ABCDE1234F', 156, 111);
  const addrText = `${member.address.line}, ${member.address.city}, ${member.address.state} - ${member.address.pincode}`;
  doc.text(doc.splitTextToSize(addrText, W - 95), 68, 119);
  doc.text(`${member.phone}  |  ${member.email}`, 68, 127);

  // Contribution Particulars
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 41, 77);
  doc.text('CONTRIBUTION PARTICULARS', 20, 140);

  // Table
  doc.setFillColor(6, 41, 77);
  doc.rect(20, 143, W - 40, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('S.No', 24, 148.5);
  doc.text('Description / Purpose of Contribution', 40, 148.5);
  doc.text('Amount (INR)', W - 24, 148.5, { align: 'right' });

  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 151, W - 40, 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('1.', 24, 159);
  doc.setFont('helvetica', 'bold');
  doc.text(entry.title, 40, 158);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(doc.splitTextToSize(entry.description, 110), 40, 163);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(6, 41, 77);
  doc.text(`₹ ${entry.amount.toLocaleString('en-IN')}.00`, W - 24, 160, { align: 'right' });

  // Total Box
  doc.setFillColor(248, 250, 252);
  doc.rect(20, 169, W - 40, 12, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(20, 169, W - 40, 12);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 41, 77);
  doc.text('Total Amount Received:', 24, 176.5);
  doc.text(`INR ₹${entry.amount.toLocaleString('en-IN')}/-`, W - 24, 176.5, { align: 'right' });

  // Amount in words
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Amount in Words:', 20, 187);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 41, 77);
  doc.text(`Rupees ${numberToWords(entry.amount)}`, 52, 187);

  // Section 80G Statutory Declaration
  doc.setFillColor(254, 243, 199); // Soft Amber
  doc.rect(20, 195, W - 40, 28, 'F');
  doc.setDrawColor(245, 158, 11);
  doc.rect(20, 195, W - 40, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14);
  doc.text('STATUTORY 80G TAX DEDUCTION CERTIFICATE', 24, 201);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(120, 53, 15);
  const declarationText = `This is to certify that the contribution mentioned above qualifies for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961, as per Order No. CIT(E)/DELHI/80G/2021-22/A/10492 dated 15/09/2021 issued by the Commissioner of Income Tax (Exemption), New Delhi. Donations are 50% exempt from income tax in the hands of the donor. Form 10BD acknowledgment reference has been furnished to the Income Tax Department.`;
  doc.text(doc.splitTextToSize(declarationText, W - 48), 24, 206);

  // Signatures & Official Stamp
  const sigY = 245;

  // Stamp circle
  doc.setDrawColor(6, 41, 77);
  doc.setLineWidth(1);
  doc.circle(50, sigY + 5, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 41, 77);
  doc.text('HRSJM', 50, sigY + 3, { align: 'center' });
  doc.setFontSize(5);
  doc.text('CENTRAL SEAL', 50, sigY + 7, { align: 'center' });
  doc.text('★ NEW DELHI ★', 50, sigY + 11, { align: 'center' });

  // Signature line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(6, 41, 77);
  doc.text('For Human Rights & Social Justice Mission', W - 30, sigY, { align: 'right' });

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(W - 85, sigY + 18, W - 25, sigY + 18);

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Authorized Signatory / Chief Financial Trustee', W - 30, sigY + 22, { align: 'right' });

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is an authentic system-generated computerized voucher and does not require an ink signature.', W / 2, H - 18, {
    align: 'center',
  });
  doc.text('Verification Portal: https://hrsjm.org/verify/receipt/' + entry.receiptNumber, W / 2, H - 14, {
    align: 'center',
  });

  return doc;
};

/**
 * Generates and downloads official Membership Guidelines PDF
 */
export const downloadMemberGuidelinesPdf = (member: MemberProfile): void => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const W = 210;
  const H = 297;

  // Header background
  doc.setFillColor(1, 31, 57);
  doc.rect(0, 0, W, 40, 'F');

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('HUMAN RIGHTS & SOCIAL JUSTICE MISSION', W / 2, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(250, 212, 101);
  doc.text('OFFICIAL MEMBERSHIP GUIDELINES, ETHICAL CODE & PROTOCOLS', W / 2, 28, { align: 'center' });

  // Member Reference Box
  doc.setFillColor(250, 247, 240);
  doc.roundedRect(14, 48, W - 28, 22, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(1, 31, 57);
  doc.text(`Issued To: ${member.fullName}`, 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Member ID: ${member.membershipNumber || 'HRSJM-47611'}  |  Category: ${member.categoryTitle || 'User Member'}  |  Valid Till: ${member.validUpto || '10 Nov 2027'}`, 20, 65);

  // Content Paragraphs
  let y = 82;
  const sections = [
    {
      title: '1. Constitutional Purpose & Mission',
      body: 'Human Rights and Social Justice Mission (HRSJM) is a national registered constitutional non-governmental body. Every member undertakes to protect fundamental civil liberties, uphold human dignity, advocate gender equality, and assist underprivileged communities.',
    },
    {
      title: '2. Code of Conduct & Public Demeanor',
      body: 'Members are ambassadors of fundamental constitutional values. Members must act with fairness, non-discrimination, honesty, and civic responsibility at all times. Misuse of the organizational title, logo, or credential for personal gain or illegal activities is strictly prohibited.',
    },
    {
      title: '3. Digital & Physical Credential Verification',
      body: 'The digital pass and official membership card are issued strictly to the registered holder and are non-transferable. Authenticity can be verified at any time via the official QR verification portal. Any lost credentials must be reported immediately.',
    },
    {
      title: '4. Rights & Benefits of Members',
      body: 'Active members enjoy priority access to legal literacy camps, educational conclaves, humanitarian drives, and national community forums. Members are entitled to participate in member delegates assemblies as per organizational bylaws.',
    },
    {
      title: '5. Validity, Extension & Renewals',
      body: 'Membership is valid for the term specified on your certificate and digital card. Timely renewal ensures continuous access to services, credentials validity, and participation in state and national chapter initiatives.',
    },
  ];

  sections.forEach((sec) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(1, 31, 57);
    doc.text(sec.title, 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);
    const splitBody = doc.splitTextToSize(sec.body, W - 28);
    doc.text(splitBody, 14, y);
    y += splitBody.length * 5 + 6;
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, H - 24, W - 14, H - 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Human Rights & Social Justice Mission • National Headquarters, New Delhi • Official Secretariat Document', W / 2, H - 16, { align: 'center' });
  doc.text('Verification & Information Portal: https://hrsjm.org/membership', W / 2, H - 11, { align: 'center' });

  doc.save(`HRSJM_Guidelines_${(member.fullName || 'Member').replace(/\s+/g, '_')}.pdf`);
};
