import { apiClient } from '../../../services/apiClient';
import { jsPDF } from 'jspdf';
import type {
  TransactionFilterParams,
  UserTransactionItem,
  UserTransactionsResponse,
} from '../types/transactions.types';

export const transactionsService = {
  /**
   * Fetches unified transaction ledger and totals for current user.
   */
  async getMyTransactions(params?: TransactionFilterParams): Promise<UserTransactionsResponse> {
    try {
      const res = await apiClient.get<any>('/transactions/my', {
        params: {
          category: params?.category && params.category !== 'ALL' ? params.category : undefined,
          status: params?.status && params.status !== 'ALL' ? params.status : undefined,
          search: params?.search ? params.search.trim() : undefined,
          fromDate: params?.fromDate,
          toDate: params?.toDate,
          page: params?.page || 1,
          limit: params?.limit || 50,
        },
      });

      const payload = res?.data || res;
      if (Array.isArray(payload?.items)) {
        const calculatedTax80G = payload.items
          .filter((i: any) => (i.status === 'Success' || i.status_code === 'SUCCESS') && (i.category_code === 'DONATION' || i.related_info?.tax_exemption_eligible))
          .reduce((acc: number, i: any) => acc + (Number(i.amount) || 0), 0);

        return {
          summary: {
            total_amount_paid: payload.summary?.total_amount_paid ?? payload.items.reduce((acc: number, i: any) => acc + (Number(i.amount) || 0), 0),
            total_transactions: payload.summary?.total_transactions ?? payload.items.length,
            successful_count: payload.summary?.successful_count ?? payload.items.filter((i: any) => i.status === 'Success' || i.status_code === 'SUCCESS').length,
            pending_count: payload.summary?.pending_count ?? payload.items.filter((i: any) => i.status === 'Pending' || i.status_code === 'PENDING').length,
            failed_count: payload.summary?.failed_count ?? payload.items.filter((i: any) => i.status === 'Failed' || i.status_code === 'FAILED').length,
            refunded_count: payload.summary?.refunded_count ?? payload.items.filter((i: any) => i.status === 'Refunded' || i.status_code === 'REFUNDED').length,
            tax_exemption_total: payload.summary?.tax_exemption_total ?? calculatedTax80G,
          },
          items: payload.items,
          meta: payload.meta || {
            page: 1,
            limit: 50,
            total: payload.items.length,
            totalPages: 1,
          },
        };
      }
    } catch {
      // Return empty live state if API fails
    }

    return {
      summary: {
        total_amount_paid: 0,
        total_transactions: 0,
        successful_count: 0,
        pending_count: 0,
        failed_count: 0,
        refunded_count: 0,
        tax_exemption_total: 0,
      },
      items: [],
      meta: {
        page: params?.page || 1,
        limit: params?.limit || 50,
        total: 0,
        totalPages: 0,
      },
    };
  },

  /**
   * Retrieves single transaction details by ID.
   */
  async getTransactionById(id: string): Promise<UserTransactionItem | null> {
    try {
      const res = await apiClient.get<any>(`/transactions/${id}`);
      const payload = res?.data || res;
      if (payload && payload.id) return payload;
    } catch {
      // Return null if not found
    }

    return null;
  },

  /**
   * Generates and triggers download of official 80G Tax Exemption Receipt (A4 Portrait PDF).
   */
  downloadReceiptPdf(transaction: UserTransactionItem, donorName?: string): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const W = 210;
    const H = 297;

    // Background tint
    doc.setFillColor(254, 252, 246);
    doc.rect(0, 0, W, H, 'F');

    // Navy & Gold Double Border
    doc.setDrawColor(6, 41, 77); // Navy #06294D
    doc.setLineWidth(1.5);
    doc.rect(12, 12, W - 24, H - 24);

    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(0.5);
    doc.rect(14, 14, W - 28, H - 28);

    // Organization Seal / Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(6, 41, 77);
    doc.text('Human Rights &  Social Justice Mission', W / 2, 26, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('मानव अधिकार एवं सामाजिक न्याय संरक्षण ट्रस्ट', W / 2, 31, { align: 'center' });
    doc.text('Registered under Indian Trust Act 1882 • Section 12A & 80G Certified Non-Profit Entity', W / 2, 35, {
      align: 'center',
    });
    doc.text('National Secretariat: 12/4, Institutional Area, Lodhi Road, New Delhi - 110003', W / 2, 39, {
      align: 'center',
    });
    doc.text('PAN: AABTH4589K  •  80G Order: CIT(E)/DELHI/80G/2021-22/A/10492  •  Validity: Perpetual', W / 2, 43, {
      align: 'center',
    });

    // Divider Line
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.8);
    doc.line(20, 47, W - 20, 47);

    // Title Ribbon
    doc.setFillColor(6, 41, 77);
    doc.roundedRect(35, 51, W - 70, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(250, 212, 101); // Gold text
    doc.text('OFFICIAL CONTRIBUTION & 80G TAX EXEMPTION RECEIPT', W / 2, 57.5, { align: 'center' });

    // Receipt Meta Grid
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 66, W - 40, 24, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 66, W - 40, 24);

    const receiptNo = transaction.receipt_number || `REC-${transaction.transaction_id}`;
    const pDate = new Date(transaction.payment_date || transaction.created_at);
    const dateStr = !isNaN(pDate.getTime())
      ? pDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'N/A';

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text('Receipt No:', 25, 73);
    doc.text('Payment Date:', 115, 73);
    doc.text('Transaction ID:', 25, 83);
    doc.text('Payment Mode:', 115, 83);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(receiptNo, 55, 73);
    doc.text(dateStr, 145, 73);
    doc.text(transaction.transaction_id, 55, 83);
    doc.text(transaction.payment_method, 145, 83);

    // Contributor Details Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 41, 77);
    doc.text('CONTRIBUTOR / MEMBER PARTICULARS', 20, 98);

    doc.setFillColor(255, 255, 255);
    doc.rect(20, 101, W - 40, 22, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 101, W - 40, 22);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Contributor Name:', 25, 108);
    doc.text('Category / Role:', 25, 117);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(donorName || 'HRSJM Member / Contributor', 60, 108);
    doc.text(`${transaction.category} Contribution`, 60, 117);

    // Payment Particulars Box
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(6, 41, 77);
    doc.text('PAYMENT & TRANSACTION PARTICULARS', 20, 132);

    doc.setFillColor(255, 255, 255);
    doc.rect(20, 135, W - 40, 48, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 135, W - 40, 48);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(transaction.title, 25, 143);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    const purposeLines = doc.splitTextToSize(transaction.purpose, W - 50);
    doc.text(purposeLines, 25, 150);

    if (transaction.gateway_payment_id) {
      doc.text(`Gateway Reference: ${transaction.gateway_payment_id}`, 25, 163);
    }
    if (transaction.related_info.notes) {
      doc.text(`Audit Note: ${transaction.related_info.notes}`, 25, 170);
    }

    // Amount Banner
    doc.setFillColor(236, 253, 245); // Emerald-50
    doc.rect(20, 189, W - 40, 18, 'F');
    doc.setDrawColor(5, 150, 105);
    doc.rect(20, 189, W - 40, 18);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(6, 78, 59);
    doc.text('TOTAL AMOUNT RECEIVED:', 25, 200);

    doc.setFontSize(13);
    doc.setTextColor(4, 120, 87);
    doc.text(`INR ${transaction.amount.toLocaleString('en-IN')}/-`, W - 25, 200, { align: 'right' });

    const is80G = transaction.category_code === 'DONATION' || Boolean(transaction.related_info?.tax_exemption_eligible);

    // Section 80G Statutory Notice or General Membership Receipt Notice
    if (is80G) {
      doc.setFillColor(254, 243, 199); // Amber-50
      doc.rect(20, 212, W - 40, 24, 'F');
      doc.setDrawColor(217, 119, 6);
      doc.rect(20, 212, W - 40, 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(146, 64, 14);
      doc.text('STATUTORY 80G TAX BENEFIT CERTIFICATION', 25, 218);

      const deductionAmt = Math.round(transaction.amount * 0.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(120, 53, 15);
      doc.text(
        `Donation of INR ${transaction.amount.toLocaleString('en-IN')}/- qualifies for 50% income tax deduction (INR ${deductionAmt.toLocaleString('en-IN')}/-)`,
        25,
        223
      );
      doc.text(
        'under Section 80G(5)(vi) of the Income Tax Act 1961. This computer-generated receipt carries legal validity without manual signature.',
        25,
        228
      );
      doc.text(
        'Central Unique Reference (URN): AABTH4589KF20214 • Date of Effect: 01-04-2021 to Indefinite',
        25,
        233
      );
    } else {
      doc.setFillColor(241, 245, 249); // Slate-50
      doc.rect(20, 212, W - 40, 24, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 212, W - 40, 24);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text('STATUTORY ENROLLMENT / MEMBERSHIP RECEIPT', 25, 218);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(
        'Official record of payment for membership enrollment / statutory affiliation fees.',
        25,
        223
      );
      doc.text(
        'Membership fees and event passes are not eligible for Section 80G donation tax exemptions.',
        25,
        228
      );
      doc.text(
        'For verified donation tax receipts, please refer to the donation contributions section.',
        25,
        233
      );
    }

    // Official Stamp & Verification Box
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 241, W - 40, 26, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.rect(20, 241, W - 40, 26);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(6, 41, 77);
    doc.text('DIGITALLY VERIFIED STATUTORY LEDGER ENTRY', 25, 248);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorized Finance Secretary', W - 30, 258, { align: 'right' });
    doc.text('National Human Rights &  Social Justice Mission', W - 30, 262, { align: 'right' });

    // Save PDF
    const filename = `HRSJM_${receiptNo.replace(/\//g, '_')}.pdf`;
    doc.save(filename);
  },
};
export default transactionsService;

