import { apiClient } from '@/api';
import type {
  AssistanceQuery,
  AssistanceRequest,
  AssistanceSummaryStats,
  CreateAssistanceRequestPayload,
  UpdateAssistanceStatusBody,
  AssistanceDocumentItem,
} from '../types/assistance.types';

export const assistanceService = {
  /**
   * Submit or register new assistance request / donation seeker via POST /assistance-requests
   */
  async create(payload: CreateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const { documents, ...raw } = payload as any;

    const metaParts: string[] = [];
    const locationParts = [raw.city, raw.state].map((v: any) => (v ? String(v).trim() : '')).filter(Boolean);
    if (locationParts.length > 0) {
      metaParts.push(`[Location: ${locationParts.join(', ')}]`);
    }
    if (raw.urgency) {
      metaParts.push(`[Urgency: ${String(raw.urgency).trim()}]`);
    }
    if (raw.age !== undefined && raw.age !== null && String(raw.age).trim() !== '') {
      metaParts.push(`[Age: ${String(raw.age).trim()}]`);
    }

    const baseDescription = raw.description ? String(raw.description).trim() : '';
    const combinedDescription = [baseDescription, metaParts.join(' ')].filter(Boolean).join('\n\n');

    const body: Record<string, any> = {
      full_name: String(raw.full_name || '').trim(),
      mobile: String(raw.mobile || '').trim(),
      requested_amount: Number(raw.requested_amount),
      reason: String(raw.reason || '').trim(),
    };

    if (raw.email && String(raw.email).trim()) body.email = String(raw.email).trim();
    if (combinedDescription) body.description = combinedDescription;
    if (raw.user_id) body.user_id = raw.user_id;
    if (raw.admin_remark && String(raw.admin_remark).trim()) body.admin_remark = String(raw.admin_remark).trim();
    if (raw.status) body.status = raw.status;

    const res = await apiClient.post<any>('/assistance-requests', body);
    const created: AssistanceRequest = res?.data || res;

    // Attach documents if present
    if (documents && documents.length > 0 && created?.id) {
      for (const doc of documents) {
        try {
          await this.attachDocument(created.id, {
            document_name: doc.document_name,
            file_name: doc.file_name,
            uri: doc.uri || doc.url,
          });
        } catch {
          // Continue gracefully
        }
      }
    }

    return created;
  },

  /**
   * List assistance requests with filters via GET /assistance-requests
   */
  async list(query: AssistanceQuery = {}): Promise<{
    items: AssistanceRequest[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));
    if (query.status) params.append('status', query.status);
    if (query.search) params.append('search', query.search);
    if (query.category) params.append('category', query.category);
    if (query.min_amount !== undefined) params.append('min_amount', String(query.min_amount));
    if (query.max_amount !== undefined) params.append('max_amount', String(query.max_amount));
    if (query.from_date) params.append('from_date', query.from_date);
    if (query.to_date) params.append('to_date', query.to_date);

    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.get<any>(`/assistance-requests${qs}`);
    const data = res?.data || res;
    return {
      items: data?.items || (Array.isArray(data) ? data : []),
      meta: data?.meta || {
        page: query.page ?? 1,
        limit: query.limit ?? 25,
        total: (data?.items || data || []).length,
        totalPages: 1,
      },
    };
  },

  /**
   * Get KPI aggregate statistics from GET /assistance-requests/stats/summary
   */
  async getStatsSummary(query: AssistanceQuery = {}): Promise<AssistanceSummaryStats> {
    try {
      const params = new URLSearchParams();
      if (query.status) params.append('status', query.status);
      if (query.search) params.append('search', query.search);
      if (query.category) params.append('category', query.category);
      if (query.min_amount !== undefined) params.append('min_amount', String(query.min_amount));
      if (query.max_amount !== undefined) params.append('max_amount', String(query.max_amount));
      if (query.from_date) params.append('from_date', query.from_date);
      if (query.to_date) params.append('to_date', query.to_date);

      const qs = params.toString() ? `?${params.toString()}` : '';
      const res = await apiClient.get<any>(`/assistance-requests/stats/summary${qs}`);
      const data = res?.data || res;
      if (data && typeof data.total === 'number') {
        return {
          total: data.total,
          underReview: data.underReview ?? data.under_review ?? 0,
          approved: data.approved ?? 0,
          rejected: data.rejected ?? 0,
          closed: data.closed ?? 0,
          totalAmount: data.totalAmount ?? data.total_amount ?? 0,
        };
      }
      return { total: 0, underReview: 0, approved: 0, rejected: 0, closed: 0, totalAmount: 0 };
    } catch {
      return { total: 0, underReview: 0, approved: 0, rejected: 0, closed: 0, totalAmount: 0 };
    }
  },

  /**
   * Fetch single assistance request details by ID via GET /assistance-requests/:id
   */
  async getById(id: string): Promise<AssistanceRequest> {
    const res = await apiClient.get<any>(`/assistance-requests/${id}`);
    return res?.data || res;
  },

  /**
   * Update request status (Under Review, Approve, Reject, Close) via PATCH /assistance-requests/:id/status
   */
  async updateStatus(id: string, body: UpdateAssistanceStatusBody): Promise<AssistanceRequest> {
    const res = await apiClient.patch<any>(`/assistance-requests/${id}/status`, body);
    return res?.data || res;
  },

  /**
   * List approved assistance requests as verified public causes via GET /assistance-requests/approved
   */
  async listApproved(query: AssistanceQuery = {}): Promise<AssistanceRequest[]> {
    try {
      const res = await apiClient.get<any>('/assistance-requests/approved', {
        params: { limit: query.limit ?? 100, ...query } as any,
        skipAuth: true,
      });
      const data = res?.data || res;
      return Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },

  /**
   * List uploaded documents for assistance request
   */
  async listDocuments(requestId: string): Promise<AssistanceDocumentItem[]> {
    try {
      const res = await apiClient.get<any>(
        `/documents?related_entity_type=ASSISTANCE_REQUEST&related_entity_id=${encodeURIComponent(requestId)}`
      );
      const data = res?.data || res;
      return data?.items || (Array.isArray(data) ? data : []);
    } catch {
      return [];
    }
  },

  /**
   * Attach supporting document to assistance request via POST /assistance-requests/:id/documents
   */
  async attachDocument(requestId: string, fileData: any): Promise<any> {
    return apiClient.post<any>(`/assistance-requests/${requestId}/documents`, fileData);
  },
};
