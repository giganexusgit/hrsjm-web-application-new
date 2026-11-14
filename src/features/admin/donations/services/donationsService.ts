import { apiClient } from '@/api';
import type {
  CreateDonationInput,
  Donation,
  DonationCategory,
  DonationReceiptModel,
  DonationStatus,
  DateRange,
} from '../types/donations.types';
import {
  createDonationReceipt as makeReceipt,
  isWithinDateRange as checkDateRange,
} from '../data/donationsFixtures';
import {
  printOfficialDonationReceipt,
  downloadOfficialDonationReceiptPdf,
} from '../utils/donationReceiptGenerator';

const STORAGE_KEY = 'hrsjm_local_donations_v1';

function getStoredDonations(): Donation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached donations:', e);
  }
  return [];
}

function saveStoredDonations(donations: Donation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(donations));
  } catch (e) {
    console.warn('Failed to save donations to localStorage:', e);
  }
}

function triggerCsvDownload(csvContent: string, fileName: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const donationsService = {
  async getMyDonations(): Promise<Donation[]> {
    try {
      const res = await apiClient.get<any>('/donation-payments/my');
      const items = Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      return items.map((p: any) => ({
        id: p.id,
        donor_name: p.donor_name || 'Donor',
        donor_mobile: p.donor_mobile || '',
        donor_email: p.donor_email || '',
        amount: Number(p.amount) || 0,
        donation_type: (p.donation_type || 'ONE_TIME') as DonationCategory,
        status: (p.status || 'PAID') as DonationStatus,
        cause: p.cause || p.campaign_title || 'General Relief Fund',
        source: p.source || 'ONLINE',
        is_80g_claimed: Boolean(p.is_80g_eligible ?? true),
        pan_number: p.pan_number || undefined,
        receipt_number: p.receipt_number || undefined,
        created_at: p.created_at || new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Failed to load my donations:', e);
      return [];
    }
  },

  async getDonations(params?: {
    search?: string | null;
    status?: DonationStatus | null;
    category?: DonationCategory | null;
    source?: string | null;
    dateRange?: DateRange | null;
  }): Promise<Donation[]> {
    try {
      const query = new URLSearchParams();
      if (params?.status) query.set('status', params.status);
      if (params?.search) query.set('search', params.search);
      if (params?.source && params.source !== 'ALL') query.set('source', params.source);

      const url = `/donations${query.toString() ? `?${query.toString()}` : ''}`;
      const res = await apiClient.get<any>(url);
      const items = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.items)
        ? res.items
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : null;

      if (Array.isArray(items)) {
        return items.map((p: any) => ({
          id: p.id,
          donor_name: p.donor_name || 'Anonymous Donor',
          donor_mobile: p.donor_mobile || '',
          donor_email: p.donor_email || null,
          amount: Number(p.amount) || 0,
          donation_type: (p.donation_type || (p.source?.toUpperCase() === 'OFFLINE' ? 'OFFLINE' : 'ONE_TIME')) as 'ONE_TIME' | 'RECURRING' | 'OFFLINE',
          status: (p.status || 'SUCCESS') as DonationStatus,
          cause: p.cause || 'General Relief Fund',
          source: p.source || 'Website',
          is_80g_claimed: Boolean(p.is_80g_claimed ?? p.is_80g_eligible ?? true),
          pan_number: p.pan_number || undefined,
          receipt_number: p.receipt_number || (p.id ? `REC-${String(p.id).slice(0, 8).toUpperCase()}` : undefined),
          remark: p.remark || null,
          member_code: p.member_code || null,
          payment_method: p.payment_method || p.source || 'Online Payment',
          created_at: p.created_at || new Date().toISOString(),
          updated_at: p.updated_at || p.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {
      console.warn('Backend /donations unavailable, using local mock store:', e);
    }

    // Local in-memory / localStorage fallback
    let list = getStoredDonations();

    if (params?.category && params.category !== 'ALL') {
      list = list.filter(d => d.donation_type === params.category);
    }

    if (params?.status) {
      list = list.filter(d => d.status?.toUpperCase() === params.status?.toUpperCase());
    }

    if (params?.source && params.source !== 'ALL') {
      list = list.filter(d => (d.source ?? '').toLowerCase() === params.source?.toLowerCase());
    }

    if (params?.dateRange && (params.dateRange.from || params.dateRange.to)) {
      list = list.filter(d => checkDateRange(d.created_at, params.dateRange?.from, params.dateRange?.to));
    }

    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(d => {
        const name = d.donor_name.toLowerCase();
        const mobile = (d.donor_mobile || '').toLowerCase();
        const code = (d.member_code || '').toLowerCase();
        const cause = d.cause.toLowerCase();
        const remark = (d.remark || '').toLowerCase();
        const src = (d.source || '').toLowerCase();
        const amt = String(d.amount);
        return (
          name.includes(q) ||
          mobile.includes(q) ||
          code.includes(q) ||
          cause.includes(q) ||
          remark.includes(q) ||
          src.includes(q) ||
          amt.includes(q)
        );
      });
    }

    return list;
  },

  async getDonationById(id: string): Promise<Donation | null> {
    try {
      const res = await apiClient.get<any>(`/donations/${id}`);
      const data = res?.data || res;
      if (data && data.id) return data;
    } catch (e) {
      console.warn(`Backend /donations/${id} unavailable, checking local store:`, e);
    }

    const localList = getStoredDonations();
    return localList.find(d => d.id === id) || null;
  },

  async createDonation(input: CreateDonationInput): Promise<Donation> {
    try {
      const res = await apiClient.post<any>('/donations', {
        donor_name: input.donor_name.trim(),
        donor_mobile: input.donor_mobile?.trim(),
        donor_email: input.donor_email?.trim() || undefined,
        cause: input.cause?.trim() || 'General Donation',
        amount: Number(input.amount),
        is_anonymous: Boolean(input.is_anonymous),
        remark: input.remark?.trim() || undefined,
        source: input.source || 'Web App',
      });
      const data = res?.data || res;
      if (data && data.id) {
        // Also save to local storage
        const current = getStoredDonations();
        saveStoredDonations([data, ...current]);
        return data;
      }
    } catch (e) {
      console.warn('Backend create donation failed, creating locally:', e);
    }

    const current = getStoredDonations();
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
      donor_name: input.donor_name.trim(),
      donor_mobile: input.donor_mobile?.trim() || '+91 98000 00000',
      donor_email: input.donor_email?.trim() || null,
      cause: input.cause?.trim() || 'General Donation',
      amount: Number(input.amount),
      status: 'SUCCESS',
      remark: input.remark?.trim() || 'Recorded from Web Admin',
      source: input.source || 'Web App',
      donation_type: input.donation_type || 'ONE_TIME',
      member_code: `MEM${Math.floor(100000 + Math.random() * 900000)}`,
      payment_method: input.payment_method || 'Online Payment',
      transaction_id: input.transaction_id || `TXN${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveStoredDonations([newDonation, ...current]);
    return newDonation;
  },

  async refundDonation(id: string, reason = 'Admin initiated refund from Web Application'): Promise<boolean> {
    try {
      await apiClient.post(`/donations/${id}/refund`, { reason });
    } catch (e) {
      console.warn('Backend refund endpoint failed, updating locally:', e);
    }

    const current = getStoredDonations();
    const updated = current.map(d => (d.id === id ? { ...d, status: 'REFUNDED', remark: `${d.remark || ''} [Refunded: ${reason}]` } : d));
    saveStoredDonations(updated);
    return true;
  },

  async getReceiptByDonationId(id: string): Promise<DonationReceiptModel> {
    try {
      const res = await apiClient.get<any>(`/receipts/donation/${id}`);
      const data = res?.data || res;
      if (data && data.receipt_number) {
        return {
          id: data.id || id,
          receiptNumber: data.receipt_number,
          receiptDate: data.receipt_date || new Date().toISOString(),
          donorName: data.issued_to || data.user?.full_name || 'Donor',
          donorMobile: data.user?.mobile_number || null,
          donorEmail: data.user?.email || null,
          memberCode: null,
          cause: 'Donation Contribution',
          amount: data.amount,
          paymentMethod: data.payment_method || 'Online',
          transactionId: data.transaction_id || data.reference_number || null,
          status: 'SUCCESS',
          notes: data.notes || null,
        };
      }
    } catch {
      // fallback to donation entity
    }

    const donation = await this.getDonationById(id);
    if (!donation) {
      throw new Error(`Donation with ID ${id} not found`);
    }
    return makeReceipt(donation);
  },

  exportDonationsCsv(donations: Donation[]): void {
    const headers = [
      'Donation ID',
      'Donor Name',
      'Mobile Number',
      'Email',
      'Member Code',
      'Cause / Campaign',
      'Amount (INR)',
      'Category',
      'Source / Platform',
      'Status',
      'Payment Method',
      'Transaction ID',
      'Date & Time',
      'Remarks',
    ];

    const rows = donations.map(d => [
      `"${d.id}"`,
      `"${(d.donor_name || '').replace(/"/g, '""')}"`,
      `"${d.donor_mobile || ''}"`,
      `"${d.donor_email || ''}"`,
      `"${d.member_code || ''}"`,
      `"${(d.cause || '').replace(/"/g, '""')}"`,
      d.amount.toFixed(2),
      `"${d.donation_type || 'ONE_TIME'}"`,
      `"${d.source || 'Website'}"`,
      `"${d.status || 'SUCCESS'}"`,
      `"${(d.payment_method || '').replace(/"/g, '""')}"`,
      `"${d.transaction_id || ''}"`,
      `"${new Date(d.created_at).toLocaleString('en-IN')}"`,
      `"${(d.remark || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerCsvDownload(csv, `HRSJM_Donations_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  },

  printDonationReceipt(receipt: DonationReceiptModel): void {
    printOfficialDonationReceipt(receipt);
  },

  downloadDonationReceipt(receipt: DonationReceiptModel): void {
    downloadOfficialDonationReceiptPdf(receipt);
  },
};
