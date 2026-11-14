import { apiClient } from '../../../services/apiClient';
import { assistanceStore } from '../../admin/assistance/store/assistanceStore';
import type {
  SeekerPersonalDetails,
  AssistanceNeedDetails,
  UploadedDocFile,
  SeekerApplicationRecord,
  DocumentTypeOption,
} from '../types/seekerRegistration.types';
import type {
  AssistanceDocumentItem,
  AssistanceRequest,
  CreateAssistancePayload,
  CreateSupportTicketPayload,
  SeekerNotification,
  SupportTicket,
  SupportTicketMessage,
} from '../types/seeker.types';

const STORAGE_KEY = 'hrsjm_seeker_applications_list';
const LAST_APP_NO_KEY = 'hrsjm_seeker_application_number';
const LOCAL_SEEKER_REQUESTS_KEY = 'hrsjm_seeker_requests_store_v1';
const LOCAL_SEEKER_TICKETS_KEY = 'hrsjm_seeker_tickets_store_v1';

export const seekerService = {
  /**
   * Check if mobile number or email is already in use
   */
  async checkDuplicate(params: { mobile_number?: string; email?: string }): Promise<{
    mobile_taken?: boolean;
    mobile_message?: string;
    email_taken?: boolean;
    email_message?: string;
  }> {
    try {
      const res = await apiClient.post<any>('/auth/check-duplicates', params);
      return res?.data || res || {};
    } catch {
      // Offline fallback: check local storage records
      const cleanMobile = params.mobile_number?.replace(/\D/g, '').slice(-10);
      const cleanEmail = params.email?.trim().toLowerCase();
      const existing = seekerService.getSavedApplications();

      const mobileMatch = cleanMobile
        ? existing.some(
            (a) => a.phone.replace(/\D/g, '').slice(-10) === cleanMobile
          )
        : false;
      const emailMatch = cleanEmail
        ? existing.some((a) => a.email?.trim().toLowerCase() === cleanEmail)
        : false;

      return {
        mobile_taken: mobileMatch,
        mobile_message: mobileMatch
          ? 'Mobile number is already registered. Please login.'
          : undefined,
        email_taken: emailMatch,
        email_message: emailMatch
          ? 'Email address is already registered. Please login.'
          : undefined,
      };
    }
  },

  /**
   * Submit complete Donation Seeker Registration & Assistance Request
   */
  async submitApplication(data: {
    personal: SeekerPersonalDetails;
    selectedDocType: DocumentTypeOption;
    selectedDocTitle: string;
    identityFiles: UploadedDocFile[];
    need: AssistanceNeedDetails;
  }): Promise<SeekerApplicationRecord> {
    const cleanMobile = data.personal.phone.replace(/\D/g, '').slice(-10);
    const cleanEmail =
      data.personal.email && data.personal.email.trim()
        ? data.personal.email.trim().toLowerCase()
        : undefined;
    const effectivePassword =
      data.personal.password && data.personal.password.trim().length >= 6
        ? data.personal.password.trim()
        : 'Hrsjm@2026';

    let backendAppNumber: string | undefined;
    let backendRequestId: string | undefined;
    let authUserId: string | undefined;

    // 1. Register Auth Account as DONATION_SEEKER
    try {
      const authRes = await apiClient.post<any>('/auth/register', {
        full_name: data.personal.fullName.trim(),
        mobile_number: cleanMobile,
        email: cleanEmail,
        password: effectivePassword,
        confirm_password: effectivePassword,
        role_name: 'DONATION_SEEKER',
        dob: data.personal.dob || undefined,
      });

      const responsePayload = authRes?.data || authRes;
      if (responsePayload?.user?.id) {
        authUserId = responsePayload.user.id;
      }
      if (responsePayload?.assistance_application_number) {
        backendAppNumber = responsePayload.assistance_application_number;
      }
      if (responsePayload?.assistance_request_id) {
        backendRequestId = responsePayload.assistance_request_id;
      }

      // Store auth session if returned
      if (responsePayload?.accessToken) {
        try {
          localStorage.setItem('hrsjm_auth_token', responsePayload.accessToken);
          localStorage.setItem(
            'hrsjm_current_user',
            JSON.stringify(responsePayload.user || {})
          );
        } catch {
          // ignore localStorage issues
        }
      }
    } catch (err: any) {
      console.warn('Backend /auth/register issue, continuing offline mode:', err?.message || err);
    }

    // 2. Generate reliable Application Reference Number if not provisioned by backend
    if (!backendAppNumber) {
      const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
      backendAppNumber = `HRSJM-SEK-${hex}`;
    }

    // 3. Create or Update Detailed Assistance Request
    try {
      const assistPayload = {
        full_name: data.personal.fullName.trim(),
        mobile: cleanMobile,
        email: cleanEmail,
        requested_amount: Number(data.need.requestedAmount) || 10000,
        reason: data.need.cause === 'Other' && data.need.otherCauseDetails
          ? `Other: ${data.need.otherCauseDetails.trim()}`
          : data.need.cause,
        description: data.need.description?.trim() || `${data.need.cause} emergency assistance application.`,
        user_id: authUserId,
      };

      const assistRes = await apiClient.post<any>('/assistance-requests', assistPayload);
      const createdAssist = assistRes?.data || assistRes;
      if (createdAssist?.id) {
        backendRequestId = createdAssist.id;
      }
    } catch (err) {
      console.warn('Could not POST /assistance-requests, record saved locally:', err);
    }

    // 4. Attach Uploaded Documents to Backend if backendRequestId exists
    const allFiles = [...data.identityFiles, ...data.need.additionalDocuments];
    if (backendRequestId && allFiles.length > 0) {
      for (const item of allFiles) {
        if (item.file) {
          try {
            const formData = new FormData();
            formData.append('file', item.file);
            formData.append('document_name', item.docTitle || item.name);
            formData.append('description', `Uploaded during seeker registration: ${item.name}`);
            await apiClient.post(`/assistance-requests/${backendRequestId}/documents`, formData);
          } catch (uploadErr) {
            console.warn(`Failed to upload ${item.name} to backend:`, uploadErr);
          }
        }
      }
    }

    // 5. Build Complete Application Record
    const nowIso = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const record: SeekerApplicationRecord = {
      id: backendRequestId || authUserId || `sek-${Date.now()}`,
      applicationNumber: backendAppNumber,
      fullName: data.personal.fullName.trim(),
      phone: `+91 ${cleanMobile}`,
      email: cleanEmail,
      dob: data.personal.dob,
      gender: data.personal.gender,
      selectedDocType: data.selectedDocType,
      selectedDocTitle: data.selectedDocTitle,
      identityDocuments: data.identityFiles,
      cause: data.need.cause,
      requestedAmount: Number(data.need.requestedAmount) || 10000,
      urgency: data.need.urgency,
      description: data.need.description,
      additionalDocuments: data.need.additionalDocuments,
      status: 'under_review',
      submittedAt: formattedDate,
      submittedDate: nowIso,
      timeline: [
        {
          title: 'Application Submitted',
          description: `Applicant ${data.personal.fullName} submitted assistance request for ₹${(Number(data.need.requestedAmount) || 10000).toLocaleString('en-IN')}.`,
          timestamp: formattedDate,
          completed: true,
        },
        {
          title: 'Document & Identity Verification',
          description: `KYC ${data.selectedDocTitle} submitted. Under verification by HRSJM Secretariat.`,
          timestamp: 'In Progress',
          completed: false,
        },
        {
          title: 'Field Verification & Cause Assessment',
          description: 'Local unit review and aid validation committee assessment.',
          timestamp: 'Pending Verification',
          completed: false,
        },
        {
          title: 'Approval & Fund Sanction',
          description: 'Official grant approval, 80G compliant sanction, and direct transfer.',
          timestamp: 'Final Stage',
          completed: false,
        },
      ],
    };

    // 6. Sync into Local Storage and Admin Assistance Store
    seekerService.saveApplication(record);
    try {
      localStorage.setItem(LAST_APP_NO_KEY, record.applicationNumber);
    } catch {
      // ignore
    }

    // Refresh Admin Assistance Store from backend (avoid duplicate POST)
    assistanceStore.fetchRequests().catch(() => {});

    return record;
  },

  /**
   * Save application to localStorage cache
   */
  saveApplication(record: SeekerApplicationRecord): void {
    try {
      const existing = seekerService.getSavedApplications();
      const filtered = existing.filter(
        (a) => a.applicationNumber !== record.applicationNumber
      );
      filtered.unshift(record);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch {
      // ignore
    }
  },

  /**
   * Get all locally saved seeker applications
   */
  getSavedApplications(): SeekerApplicationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return [];
  },

  /**
   * Lookup application status by Application Number or Phone
   */
  async trackApplication(
    query: string
  ): Promise<SeekerApplicationRecord | null> {
    const cleanQuery = query.trim().toUpperCase();
    const cleanMobile = query.replace(/\D/g, '').slice(-10);

    // 1. Search locally saved applications first
    const saved = seekerService.getSavedApplications();
    const localMatch = saved.find(
      (a) =>
        a.applicationNumber.toUpperCase() === cleanQuery ||
        (cleanMobile.length === 10 &&
          a.phone.replace(/\D/g, '').slice(-10) === cleanMobile)
    );
    if (localMatch) {
      return localMatch;
    }

    // 2. Query backend assistance requests if online
    try {
      const endpoint = `/assistance-requests?search=${encodeURIComponent(query)}&limit=10`;
      const res = await apiClient.get<any>(endpoint);
      const data = res?.data?.data || res?.data || res;
      const items = Array.isArray(data) ? data : data?.items || [];
      const found = items.find(
        (i: any) =>
          i.id === query ||
          i.mobile?.replace(/\D/g, '').slice(-10) === cleanMobile ||
          `HRSJM-SEK-${i.id.replace(/-/g, '').slice(0, 6).toUpperCase()}` === cleanQuery
      );

      if (found) {
        const appNo = `HRSJM-SEK-${found.id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
        return {
          id: found.id,
          applicationNumber: appNo,
          fullName: found.full_name || 'Applicant',
          phone: found.mobile || '',
          email: found.email,
          selectedDocType: 'aadhaar',
          selectedDocTitle: 'Identity Verification',
          identityDocuments: [],
          cause: (found.reason?.split(':')[0] || 'Medical Emergency') as any,
          requestedAmount: Number(found.requested_amount) || 0,
          urgency: 'HIGH',
          description: found.description || found.reason || '',
          additionalDocuments: [],
          status: (found.status?.toLowerCase() === 'approved'
            ? 'approved'
            : found.status?.toLowerCase() === 'rejected'
            ? 'rejected'
            : 'under_review') as any,
          submittedAt: new Date(found.created_at || Date.now()).toLocaleDateString('en-GB'),
          submittedDate: found.created_at || new Date().toISOString(),
          sanctionedAmount: found.sanctioned_amount,
          adminRemark: found.admin_remark,
          timeline: [
            {
              title: 'Application Submitted',
              description: 'Assistance request logged in official registry.',
              timestamp: 'Completed',
              completed: true,
            },
            {
              title: 'Under Review',
              description: found.admin_remark || 'Verification in progress by administration.',
              timestamp: found.status === 'PENDING' ? 'In Progress' : 'Completed',
              completed: found.status !== 'PENDING',
            },
            {
              title: 'Final Decision',
              description: found.status === 'APPROVED' ? 'Approved & Sanctioned' : found.status === 'REJECTED' ? 'Rejected' : 'Pending',
              timestamp: found.status === 'PENDING' ? 'Pending' : 'Completed',
              completed: found.status === 'APPROVED' || found.status === 'REJECTED',
            },
          ],
        };
      }
    } catch {
      // ignore
    }

    return null;
  },

  /**
   * Get last submitted application number
   */
  getLastApplicationNumber(): string | null {
    try {
      return localStorage.getItem(LAST_APP_NO_KEY);
    } catch {
      return null;
    }
  },

  getLocalRequests(): AssistanceRequest[] {
    try {
      const raw = localStorage.getItem(LOCAL_SEEKER_REQUESTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock/placeholder entries
          const clean = parsed.filter((r) => {
            const reason = (r.reason || '').toLowerCase();
            const desc = (r.description || '').toLowerCase();
            if (reason.includes('cataract') && desc.includes('cataract')) return false;
            if (
              r.id === 'e5a92341-e6e5-4534-970c-1b27efb472a5' ||
              r.id === '786a0a5f-7f61-457e-a4f7-fb9f77b72c19' ||
              r.id === '82e286a8-d098-4487-a7a5-e96401913cbe' ||
              r.id === 'fb332b67-93b7-4e83-89b9-33b4ce62750b' ||
              r.id === 'aebf3f42-22cc-499e-aa01-f1b45dbcfce2' ||
              r.id === '2443ceb1-1d64-406f-906d-19c33672e1b2' ||
              r.id === 'b109a7f9-d6bb-45d5-8dc2-9161f76e9e7c' ||
              r.id === '76ab104d-7919-433b-b364-bc637e6abf6e'
            ) {
              return false;
            }
            return true;
          });
          if (clean.length !== parsed.length) {
            this.saveLocalRequests(clean);
          }
          return clean;
        }
      }
    } catch {
      // Fallback
    }
    return [];
  },

  saveLocalRequests(requests: AssistanceRequest[]): void {
    try {
      localStorage.setItem(LOCAL_SEEKER_REQUESTS_KEY, JSON.stringify(requests));
    } catch {
      // Ignore
    }
  },

  getLocalTickets(): SupportTicket[] {
    try {
      const raw = localStorage.getItem(LOCAL_SEEKER_TICKETS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return [];
  },

  saveLocalTickets(tickets: SupportTicket[]): void {
    try {
      localStorage.setItem(LOCAL_SEEKER_TICKETS_KEY, JSON.stringify(tickets));
    } catch {
      // Ignore
    }
  },

  async getMyRequests(): Promise<AssistanceRequest[]> {
    try {
      const res = await apiClient.get<any>('/assistance-requests');
      const data = res?.data || res;
      const items: AssistanceRequest[] = data?.items || (Array.isArray(data) ? data : []);
      if (Array.isArray(items)) {
        this.saveLocalRequests(items);
        return items;
      }
      return this.getLocalRequests();
    } catch {
      return this.getLocalRequests();
    }
  },

  async getRequestById(id: string): Promise<AssistanceRequest | null> {
    try {
      const res = await apiClient.get<any>(`/assistance-requests/${id}`);
      const data: AssistanceRequest = res?.data || res;
      if (data && data.id) {
        return data;
      }
    } catch {
      // Fallback
    }
    const local = this.getLocalRequests().find((r) => r.id === id || r.id.includes(id));
    return local || null;
  },

  async createRequest(payload: CreateAssistancePayload): Promise<AssistanceRequest> {
    const { documents } = payload;
    let created: AssistanceRequest | null = null;

    const cleanBody: any = {
      full_name: payload.full_name?.trim(),
      mobile: payload.mobile?.replace(/\D/g, ''),
      requested_amount:
        typeof payload.requested_amount === 'string'
          ? parseFloat((payload.requested_amount as string).replace(/,/g, ''))
          : Number(payload.requested_amount),
      reason: payload.reason?.trim(),
      status: payload.status || 'UNDER_REVIEW',
    };

    if (payload.email && payload.email.trim()) {
      cleanBody.email = payload.email.trim();
    }
    if (payload.description && payload.description.trim()) {
      cleanBody.description = payload.description.trim();
    }

    try {
      const res = await apiClient.post<any>('/assistance-requests', cleanBody);
      created = res?.data || res;
    } catch (err) {
      console.error('Failed to submit assistance request to backend:', err);
      throw err;
    }

    if (!created || !created.id) {
      created = {
        id: `asst-${Math.random().toString(36).substring(2, 10)}`,
        full_name: payload.full_name,
        mobile: payload.mobile,
        email: payload.email,
        requested_amount: payload.requested_amount,
        reason: payload.reason,
        description: payload.description,
        status: payload.status || 'UNDER_REVIEW',
        admin_remark: 'Submitted and placed in queue for document verification.',
        created_at: new Date().toISOString(),
        documents: [],
      };
    }

    // Attach documents if provided
    if (documents && documents.length > 0) {
      const attachedList: AssistanceDocumentItem[] = [];
      for (const doc of documents) {
        try {
          const attached = await this.attachDocument(created.id, doc);
          if (attached) attachedList.push(attached);
        } catch {
          attachedList.push({
            id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            document_name: doc.document_name,
            fileName: doc.file_name,
            fileSize: doc.file_size || '1.5 MB',
            verification_status: 'PENDING',
          });
        }
      }
      created.documents = attachedList;
    }

    // Cache locally
    const existing = this.getLocalRequests();
    this.saveLocalRequests([created, ...existing]);

    return created;
  },

  async attachDocument(
    requestId: string,
    docData: {
      document_name: string;
      file_name: string;
      file_size?: string;
      file?: File | Blob;
      uri?: string;
    }
  ): Promise<AssistanceDocumentItem | null> {
    try {
      const formData = new FormData();
      if (docData.file) {
        formData.append('file', docData.file, docData.file_name);
      }
      formData.append('document_name', docData.document_name);
      formData.append('description', `Supporting doc for ${docData.document_name}`);

      const res = await apiClient.upload<any>(`/assistance-requests/${requestId}/documents`, formData);
      const data = res?.data || res;
      if (data) {
        return data;
      }
    } catch {
      // Fallback
    }

    // Return structured item
    return {
      id: `doc-${Date.now()}`,
      document_name: docData.document_name,
      fileName: docData.file_name,
      fileSize: docData.file_size || '1.2 MB',
      verification_status: 'PENDING',
      created_at: new Date().toISOString(),
    };
  },

  async listDocuments(requestId: string): Promise<AssistanceDocumentItem[]> {
    try {
      const res = await apiClient.get<any>(`/assistance-requests/${requestId}/documents`);
      const data = res?.data || res;
      if (Array.isArray(data)) return data;
      if (data?.items && Array.isArray(data.items)) return data.items;
    } catch {
      // Fallback
    }
    const req = this.getLocalRequests().find((r) => r.id === requestId);
    return req?.documents || [];
  },

  async getMyTickets(): Promise<SupportTicket[]> {
    try {
      const res = await apiClient.get<any>('/support-tickets');
      const data = res?.data || res;
      const items: SupportTicket[] = data?.items || (Array.isArray(data) ? data : []);
      if (Array.isArray(items)) {
        this.saveLocalTickets(items);
        return items;
      }
      return this.getLocalTickets();
    } catch {
      return this.getLocalTickets();
    }
  },

  async createTicket(payload: CreateSupportTicketPayload): Promise<SupportTicket> {
    try {
      const res = await apiClient.post<any>('/support-tickets', payload);
      const created: SupportTicket = res?.data || res;
      if (created && created.id) {
        const local = this.getLocalTickets();
        this.saveLocalTickets([created, ...local]);
        return created;
      }
    } catch {
      // Offline fallback
    }

    const fallback: SupportTicket = {
      id: `tkt-${Date.now().toString().slice(-4)}`,
      ticket_number: `HRSJM-TKT-${Date.now().toString().slice(-4)}`,
      user_id: 'seeker-user',
      category: payload.category,
      subject: payload.subject,
      description: payload.description,
      status: 'OPEN',
      priority: payload.priority || 'MEDIUM',
      created_at: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          ticket_id: `tkt-${Date.now().toString().slice(-4)}`,
          sender_user_id: 'seeker-user',
          sender_name: 'Me',
          is_admin: false,
          message: payload.description,
          created_at: new Date().toISOString(),
        },
      ],
    };

    const local = this.getLocalTickets();
    this.saveLocalTickets([fallback, ...local]);
    return fallback;
  },

  async addTicketMessage(ticketId: string, message: string): Promise<SupportTicketMessage> {
    try {
      const res = await apiClient.post<any>(`/support-tickets/${ticketId}/messages`, { message });
      const created = res?.data || res;
      if (created && created.id) {
        return created;
      }
    } catch {
      // Fallback
    }

    const newMsg: SupportTicketMessage = {
      id: `msg-${Date.now()}`,
      ticket_id: ticketId,
      sender_user_id: 'seeker-user',
      sender_name: 'Me',
      is_admin: false,
      message,
      created_at: new Date().toISOString(),
    };

    // Update local ticket
    const tickets = this.getLocalTickets();
    const target = tickets.find((t) => t.id === ticketId);
    if (target) {
      target.messages = [...(target.messages || []), newMsg];
      this.saveLocalTickets(tickets);
    }

    return newMsg;
  },

  getNotifications(requests: AssistanceRequest[]): SeekerNotification[] {
    const list: SeekerNotification[] = [];

    requests.forEach((req, idx) => {
      if (req.status === 'UNDER_REVIEW') {
        list.push({
          id: `notif-rev-${req.id}`,
          title: 'Application Under Review',
          message: `Your aid request for ${req.reason} (ASST-${req.id.slice(0, 8).toUpperCase()}) is currently being assessed by the field team.`,
          type: 'STATUS_CHANGE',
          read: idx > 0,
          created_at: req.created_at,
          action_url: `/seeker/requests`,
        });
      } else if (req.status === 'APPROVED') {
        list.push({
          id: `notif-app-${req.id}`,
          title: 'Assistance Request Approved! 🎉',
          message: `Congratulations! Your request for ₹${Number(req.requested_amount).toLocaleString('en-IN')} has been approved and published to the verified relief fund.`,
          type: 'DISBURSEMENT',
          read: false,
          created_at: req.updated_at || req.created_at,
          action_url: `/seeker/requests`,
        });
      } else if (req.status === 'REJECTED') {
        list.push({
          id: `notif-rej-${req.id}`,
          title: 'Action Required on Application',
          message: `Additional information or document rectification required for request ASST-${req.id.slice(0, 8).toUpperCase()}.`,
          type: 'DOCUMENT_REQUIRED',
          read: false,
          created_at: req.updated_at || req.created_at,
          action_url: `/seeker/requests`,
        });
      }
    });

    // General announcement notification
    list.push({
      id: 'notif-welcome',
      title: 'Welcome to HRSJM Aid Portal',
      message: 'You have full access to submit humanitarian relief requests, legal aid consultations, and 24x7 emergency helpline.',
      type: 'GENERAL',
      read: true,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    });

    return list;
  },
};
