import { apiClient, ENDPOINTS, getAuthToken } from '@/api';

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  address?: string;
  blood_group?: string;
}

export const memberService = {
  /**
   * Fetches the current logged-in user's active membership profile
   * GET /api/v1/users/me/membership
   */
  async getOwnMembership() {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.get<any>(ENDPOINTS.memberships.myMembership);
    } catch {
      return null;
    }
  },

  /**
   * Fetches the authenticated user profile
   * GET /api/v1/auth/me
   */
  async getOwnProfile() {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.get<any>(ENDPOINTS.auth.me);
    } catch {
      return null;
    }
  },

  /**
   * Fetches impact metrics for the authenticated user
   * GET /api/v1/auth/me/impact
   */
  async getOwnImpact() {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.get<any>('/auth/me/impact');
    } catch {
      return null;
    }
  },

  /**
   * Updates authenticated user profile details
   * PATCH /api/v1/auth/me
   */
  async updateOwnProfile(payload: UpdateProfilePayload) {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.patch<any>(ENDPOINTS.auth.me, payload);
    } catch {
      return null;
    }
  },

  /**
   * Fetches available membership tiers and categories
   * GET /api/v1/membership-categories
   */
  async getMembershipCategories() {
    try {
      return await apiClient.get<any>(ENDPOINTS.memberships.categories);
    } catch {
      return null;
    }
  },

  /**
   * Fetches payment history for the logged-in member
   * GET /api/v1/membership-payments
   */
  async getOwnMembershipPayments() {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.get<any>('/membership-payments');
    } catch {
      return null;
    }
  },

  /**
   * Fetches donation payments made by the logged-in member
   * GET /api/v1/donation-payments
   */
  async getOwnDonations() {
    if (!getAuthToken()) return null;
    try {
      return await apiClient.get<any>('/donation-payments');
    } catch {
      return null;
    }
  },

  /**
   * Fetches documents uploaded for the membership
   * GET /api/v1/memberships/:id/documents
   */
  async getMembershipDocuments(membershipId: string) {
    try {
      return await apiClient.get<any>(ENDPOINTS.memberships.documents(membershipId));
    } catch {
      return null;
    }
  },

  /**
   * Fetches member renewal records
   * GET /api/v1/memberships/:id/renewal-history
   */
  async getRenewalHistory(membershipId: string) {
    try {
      return await apiClient.get<any>(ENDPOINTS.memberships.renewalHistory(membershipId));
    } catch {
      return null;
    }
  },
};
