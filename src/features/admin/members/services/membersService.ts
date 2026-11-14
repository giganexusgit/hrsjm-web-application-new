import { apiClient } from '@/api';
import type {
  MemberStats,
  MembershipCategoryItem,
  CreateMemberPayload,
  UpdateMemberPayload,
  KitFulfillmentData,
} from '../types/members.types';
import { STANDARD_MEMBERSHIP_CATEGORIES } from '../data/membersFixtures';

export interface ListMembersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category_id?: string;
  user_id?: string;
}

export const membersService = {
  /**
   * Fetches memberships list from GET /memberships
   */
  async list(params?: ListMembersParams) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    if (params?.category_id) query.append('category_id', params.category_id);
    if (params?.user_id) query.append('user_id', params.user_id);

    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<any>(`/memberships${qs}`);
  },

  /**
   * Fetches member directory statistics from GET /memberships/stats
   */
  async getStats(params?: { search?: string; category_id?: string }): Promise<MemberStats> {
    try {
      const query = new URLSearchParams();
      if (params?.search) query.append('search', params.search);
      if (params?.category_id) query.append('category_id', params.category_id);
      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await apiClient.get<any>(`/memberships/stats${qs}`);
      if (res && typeof res.total === 'number') {
        return {
          total: res.total,
          active: res.active ?? 0,
          expiringSoon: res.expiringSoon ?? 0,
          inactive: res.inactive ?? 0,
          pending: res.pending ?? 0,
        };
      }
      return { total: 0, active: 0, expiringSoon: 0, inactive: 0 };
    } catch {
      return { total: 0, active: 0, expiringSoon: 0, inactive: 0 };
    }
  },

  /**
   * Fetches active membership categories from GET /membership-categories
   */
  async getCategories(): Promise<MembershipCategoryItem[]> {
    try {
      const res = await apiClient.get<any>('/membership-categories');
      const list = Array.isArray(res)
        ? res
        : res?.items || res?.data?.items || res?.data || [];
      if (Array.isArray(list) && list.length > 0) {
        return list.map((c: any) => ({
          id: c.id,
          name: c.name || c.title || 'General Member',
          code: c.code || '',
          fee: c.fee !== undefined ? c.fee : 0,
          description: c.description || '',
          validity_days: c.validity_days || (c.validity_months ? c.validity_months * 30 : 365),
          status: c.status || 'ACTIVE',
          free_renewal_years: c.free_renewal_years,
        }));
      }
      return STANDARD_MEMBERSHIP_CATEGORIES;
    } catch {
      return STANDARD_MEMBERSHIP_CATEGORIES;
    }
  },

  /**
   * Fetches full membership details by ID from GET /memberships/:id
   */
  async getById(id: string): Promise<any> {
    return apiClient.get<any>(`/memberships/${id}`);
  },

  /**
   * Registers a new member via POST /memberships
   */
  async create(payload: CreateMemberPayload): Promise<any> {
    const { auto_activate, ...dto } = payload;
    const res = await apiClient.post<any>('/memberships', dto);
    if (auto_activate && res?.id) {
      try {
        await apiClient.patch(`/memberships/${res.id}/status`, {
          status: 'ACTIVE',
          admin_notes: 'Auto-approved on creation by admin',
        });
      } catch {
        // Silently tolerate if status patch fails
      }
    }
    return res;
  },

  /**
   * Updates member details via PATCH /memberships/:id
   */
  async update(id: string, payload: UpdateMemberPayload): Promise<any> {
    return apiClient.patch<any>(`/memberships/${id}`, payload);
  },

  /**
   * Updates member status (ACTIVE, SUSPENDED, EXPIRED, etc.) via PATCH /memberships/:id/status
   */
  async updateStatus(id: string, status: string, adminNotes?: string): Promise<any> {
    return apiClient.patch<any>(`/memberships/${id}/status`, {
      status,
      admin_notes: adminNotes,
    });
  },

  /**
   * Updates physical Welcome Kit fulfillment via PATCH /memberships/:id/kit-fulfillment
   */
  async updateKitFulfillment(id: string, payload: KitFulfillmentData): Promise<any> {
    return apiClient.patch<any>(`/memberships/${id}/kit-fulfillment`, payload);
  },

  /**
   * Fetches uploaded member documents via GET /memberships/:id/documents
   */
  async getDocuments(id: string): Promise<{ membership_id: string; documents: any[] }> {
    try {
      return await apiClient.get<any>(`/memberships/${id}/documents`);
    } catch {
      return { membership_id: id, documents: [] };
    }
  },

  /**
   * Resets member password in database via POST /memberships/:id/reset-password
   */
  async resetPassword(id: string, newPassword?: string) {
    return apiClient.post<any>(`/memberships/${id}/reset-password`, {
      new_password: newPassword,
    });
  },
};
