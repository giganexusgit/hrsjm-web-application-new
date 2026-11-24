import { apiClient } from '@/api';
import type { AddUserPayload, EditUserPayload, UserStatus } from '../types/user.types';

export const usersService = {
  /**
   * Fetches users list from GET /users with pagination and search
   */
  async listUsers(params?: { page?: number; limit?: number; search?: string; status?: string }) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.limit) query.append('limit', String(params.limit));
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);
    query.append('_t', String(Date.now()));

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<any>(`/users${queryString}`);
  },

  /**
   * Fetches single user by ID from GET /users/:id
   */
  async getUser(id: string) {
    return apiClient.get<any>(`/users/${id}`);
  },

  /**
   * Creates a user account from POST /users
   */
  async createUser(payload: AddUserPayload) {
    const body: Record<string, any> = {
      full_name: payload.name.trim(),
      mobile_number: payload.phone.replace(/\D/g, '').slice(-10),
      email: payload.email.trim() || undefined,
      password: payload.password || undefined,
      role_name: payload.userType === 'admin'
        ? 'ADMIN'
        : payload.userType === 'member'
        ? 'MEMBER'
        : payload.userType === 'seeker'
        ? 'DONATION_SEEKER'
        : 'USER',
      dob: payload.dob || undefined,
      gender: payload.gender || undefined,
      address: payload.address || undefined,
      avatar: payload.avatarUrl || undefined,
    };
    return apiClient.post<any>('/users', body);
  },

  /**
   * Updates user fields via PATCH /users/:id
   */
  async updateUser(id: string, payload: EditUserPayload) {
    const body: Record<string, any> = {};
    if (payload.name !== undefined) body.full_name = payload.name.trim();
    if (payload.email !== undefined) body.email = payload.email.trim();
    if (payload.phone !== undefined) {
      body.mobile_number = payload.phone.replace(/\D/g, '').slice(-10);
    }
    if (payload.dob !== undefined) body.dob = payload.dob;
    if (payload.gender !== undefined) body.gender = payload.gender;
    if (payload.address !== undefined) body.address = payload.address.trim();
    if (payload.avatarUrl !== undefined) body.avatar = payload.avatarUrl;

    return apiClient.patch<any>(`/users/${id}`, body);
  },

  /**
   * Updates user account status via PATCH /users/:id/status
   */
  async updateUserStatus(id: string, status: UserStatus) {
    const apiStatus =
      status === 'blocked' ? 'BLOCKED' : status === 'pending' ? 'PENDING' : 'ACTIVE';
    return apiClient.patch<any>(`/users/${id}/status`, { status: apiStatus });
  },

  /**
   * Resets user password directly via POST /users/:id/reset-password
   */
  async resetPassword(id: string, newPassword: string) {
    return apiClient.post<any>(`/users/${id}/reset-password`, {
      new_password: newPassword,
    });
  },

  /**
   * Approves donation seeker via POST /users/:id/approve-seeker
   */
  async approveSeeker(id: string) {
    return apiClient.post<any>(`/users/${id}/approve-seeker`);
  },

  /**
   * Deletes a user via DELETE /users/:id
   */
  async deleteUser(id: string) {
    return apiClient.delete<any>(`/users/${id}`);
  },
};
