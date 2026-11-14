import { apiClient, ENDPOINTS } from '@/api';
import type {
  CreateTicketBody,
  CreatePublicComplaintBody,
  CreateContactInquiryBody,
  SupportTicket,
  SupportTicketListData,
  SupportTicketMessage,
  SupportTicketQuery,
  TicketStatsData,
  UpdateTicketStatusBody,
  AddTicketMessageBody,
} from '../types/support.types';

export const supportService = {
  async list(query: SupportTicketQuery = {}): Promise<SupportTicketListData> {
    return apiClient.get<SupportTicketListData>(ENDPOINTS.support.list, {
      params: {
        page: query.page,
        limit: query.limit,
        status: query.status && (query.status as string) !== 'ALL' ? query.status : undefined,
        category: query.category && query.category !== 'ALL' ? query.category : undefined,
        source: query.source && query.source !== 'ALL' ? query.source : undefined,
        from_date: query.from_date,
        to_date: query.to_date,
        search: query.search?.trim() || undefined,
      },
    });
  },

  async getStatsSummary(query: SupportTicketQuery = {}): Promise<TicketStatsData> {
    return apiClient.get<TicketStatsData>(ENDPOINTS.support.summary, {
      params: {
        status: query.status && (query.status as string) !== 'ALL' ? query.status : undefined,
        category: query.category && query.category !== 'ALL' ? query.category : undefined,
        from_date: query.from_date,
        to_date: query.to_date,
      },
    });
  },

  async getById(id: string): Promise<SupportTicket> {
    return apiClient.get<SupportTicket>(ENDPOINTS.support.getById(id));
  },

  async updateStatus(id: string, body: UpdateTicketStatusBody): Promise<SupportTicket> {
    return apiClient.patch<SupportTicket>(ENDPOINTS.support.updateStatus(id), body);
  },

  async getMessages(ticketId: string): Promise<SupportTicketMessage[]> {
    return apiClient.get<SupportTicketMessage[]>(ENDPOINTS.support.messages(ticketId));
  },

  async addMessage(ticketId: string, body: AddTicketMessageBody): Promise<SupportTicketMessage> {
    return apiClient.post<SupportTicketMessage>(ENDPOINTS.support.sendMessage(ticketId), body);
  },

  async create(body: CreateTicketBody): Promise<SupportTicket> {
    // Strip properties that are not part of the standard CreateTicketDto to prevent forbidden property validation errors
    const { category, priority, ...cleanBody } = body;
    return apiClient.post<SupportTicket>(ENDPOINTS.support.create, cleanBody);
  },

  async createPublic(body: CreatePublicComplaintBody): Promise<{ ticketNumber: string; id?: string; message?: string }> {
    return apiClient.post<{ ticketNumber: string; id?: string; message?: string }>(
      ENDPOINTS.support.publicCreate,
      body,
      { skipAuth: true }
    );
  },

  async submitContactInquiry(body: CreateContactInquiryBody): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.support.contact,
      body,
      { skipAuth: true }
    );
  },
};
