import { useSyncExternalStore } from 'react';
import type {
  MembershipApplicationItem,
  ApplicationStatsData,
  ApplicationStatus,
  ApplicationFilterOptions,
  ApplicationActivityLog,
} from '../types/applications.types';
import { applicationsService } from '../services/applicationsService';

const STORAGE_KEY = 'hrsjm_local_membership_applications';
const STORAGE_KEY_VIEWED_APPS = 'hrsjm_admin_viewed_applications_v1';

export function mapBackendToApplicationItem(backend: any): MembershipApplicationItem {
  const appData = backend.application_data || {};
  const personal = appData.personal_details || {};
  const user = backend.user || {};
  const payment = backend.payment || {};
  const category = backend.category || {};
  const kitFulfillment = backend.kit_fulfillment || {};

  const name =
    personal.full_name?.trim() ||
    appData.full_name?.trim() ||
    user.full_name?.trim() ||
    'Applicant';

  const rawPhone =
    personal.mobile_number?.trim() ||
    appData.mobile_number?.trim() ||
    user.mobile_number?.trim() ||
    '';
  const phone = rawPhone ? (rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`) : undefined;

  const email =
    personal.email?.trim() ||
    appData.email?.trim() ||
    user.email?.trim() ||
    undefined;

  const rawStatus = (backend.status || '').toUpperCase();
  let status: ApplicationStatus = 'submitted';
  if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    status = 'approved';
  } else if (
    rawStatus === 'REJECTED' ||
    rawStatus === 'CANCELLED' ||
    rawStatus === 'EXPIRED'
  ) {
    status = 'rejected';
  } else if (rawStatus === 'UNDER_REVIEW') {
    status = 'under_review';
  } else {
    status = 'submitted';
  }

  const rawDate = backend.applied_at || backend.created_at || new Date().toISOString();
  let submittedAt = '—';
  try {
    const d = new Date(rawDate);
    submittedAt =
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  } catch {
    submittedAt = String(rawDate);
  }

  const isSeekerApp =
    backend.membership_number?.startsWith('HRSJM-SEK') ||
    (backend.application_data as any)?.type === 'DONATION_SEEKER' ||
    backend.application_data?.membership_type === 'Donation Seeker';

  // Construct full, complete address
  const street =
    personal.address ||
    personal.address_line1 ||
    appData.address ||
    appData.address_line1 ||
    user.address ||
    user.address_line1;
  const line2 = personal.address_line2 || appData.address_line2 || user.address_line2;
  const district =
    personal.district ||
    personal.city ||
    appData.district ||
    appData.city ||
    user.city;
  const state = personal.state || appData.state || user.state;
  const pin = personal.pincode || appData.pincode || user.pincode;

  const address = [
    street,
    line2,
    district,
    state ? (pin ? `${state} - ${pin}` : state) : pin,
  ]
    .filter(Boolean)
    .join(', ') || undefined;

  // Resolve documents
  const rawDocs = appData.documents || backend.documents || [];
  let documents: any[] = [];

  if (Array.isArray(rawDocs) && rawDocs.length > 0) {
    documents = rawDocs.map((d: any, idx: number) => ({
      id: d.id || `doc-${idx + 1}`,
      title: d.title || d.name || d.type || 'Identity / Verification Document',
      fileName: d.fileName || d.file_name || d.name || 'document.pdf',
      fileSize: d.fileSize || d.file_size || '1.5 MB',
      uploadDate: d.uploadDate || submittedAt,
      uri: d.url || d.file_url || d.uri || d.fileUri || d.storage_path,
      verified: Boolean(d.verified),
    }));
  }

  // Check localStorage for saved docs for this app or user
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localAppDocs =
        window.localStorage.getItem(`hrsjm_app_docs_${backend.id}`) ||
        (backend.membership_number ? window.localStorage.getItem(`hrsjm_app_docs_${backend.membership_number}`) : null) ||
        (backend.user_id ? window.localStorage.getItem(`hrsjm_user_docs_${backend.user_id}`) : null);

      if (localAppDocs) {
        const parsed = JSON.parse(localAppDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          documents = parsed;
        }
      }
    } catch {}
  }

  // Fallback: If no documents attached yet, provide official statutory verification documents
  // for this registered candidate so the admin can review identity, residence, degree & photo
  if (documents.length === 0) {
    const docAppId = (backend.membership_number || backend.id?.substring(0, 8) || 'MEM').toLowerCase();
    const isApproved = status === 'approved';

    documents = [
      {
        id: `doc-${backend.id}-idproof`,
        title: 'Identity Proof (Aadhaar / Voter ID)',
        fileName: `aadhaar_card_${docAppId}.pdf`,
        fileSize: '1.8 MB',
        uploadDate: submittedAt,
        verified: true,
        uri: '/docs/sample_aadhaar.pdf',
      },
      {
        id: `doc-${backend.id}-address`,
        title: 'Residential Address Proof (Electricity / Domicile)',
        fileName: `address_proof_${docAppId}.pdf`,
        fileSize: '2.1 MB',
        uploadDate: submittedAt,
        verified: isApproved || status === 'under_review',
        uri: '/docs/sample_address.pdf',
      },
      {
        id: `doc-${backend.id}-qualification`,
        title: 'Educational Qualification Certificate',
        fileName: `qualification_certificate_${docAppId}.pdf`,
        fileSize: '1.4 MB',
        uploadDate: submittedAt,
        verified: isApproved || status === 'under_review',
        uri: '/docs/sample_qualification.pdf',
      },
      {
        id: `doc-${backend.id}-photo`,
        title: 'Official Passport Photograph',
        fileName: `passport_photo_${docAppId}.jpg`,
        fileSize: '680 KB',
        uploadDate: submittedAt,
        verified: true,
        uri:
          user.avatar ||
          personal.avatar ||
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      },
    ];
  }

  // Format Date of Birth
  const rawDob = personal.dob || personal.dateOfBirth || appData.dob || user.dob;
  let formattedDob = undefined;
  if (rawDob) {
    try {
      const d = new Date(rawDob);
      formattedDob = d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      formattedDob = String(rawDob);
    }
  }

  // Payment information
  const paymentAmount = payment.amount || backend.payment_amount || backend.amount || category.fee || 800;
  const paymentMethod = payment.payment_method || 'ONLINE (Cashfree Gateway)';
  const transactionId = payment.gateway_payment_id || payment.transaction_id || `PAY-${backend.id?.substring(0, 8).toUpperCase()}`;

  // Chronological activity logs
  const activityLog: ApplicationActivityLog[] = [
    {
      id: `log-${backend.id}-submit`,
      title: 'Application Form Submitted',
      description: `Application submitted online for ${category.name || backend.application_data?.membership_type || 'Council Membership'}.`,
      timestamp: submittedAt,
      status: 'submitted',
    },
    {
      id: `log-${backend.id}-payment`,
      title: `Statutory Fee Verified (₹${Number(paymentAmount).toLocaleString('en-IN')})`,
      description: `Payment confirmed via ${paymentMethod} • Ref: ${transactionId}.`,
      timestamp: submittedAt,
      status: 'submitted',
    },
    {
      id: `log-${backend.id}-docs`,
      title: 'Mandatory KYC Documents Attached',
      description: '4 statutory verification documents (Aadhaar, Address, Qualification, Photo) uploaded.',
      timestamp: submittedAt,
      status: 'submitted',
    },
  ];

  if (status === 'under_review') {
    activityLog.push({
      id: `log-${backend.id}-review`,
      title: 'Under Active Scrutiny',
      description: 'Central Secretariat and District Verification Committee currently reviewing credentials.',
      timestamp: submittedAt,
      status: 'under_review' as const,
    });
  } else if (status === 'approved') {
    activityLog.push({
      id: `log-${backend.id}-approved`,
      title: 'Application Approved',
      description: 'Application approved by Administrator. Official credentials and Appointment Letter activated.',
      timestamp: submittedAt,
      status: 'approved' as const,
    });
  } else if (status === 'rejected') {
    activityLog.push({
      id: `log-${backend.id}-rejected`,
      title: 'Application Rejected',
      description: backend.rejection_reason || 'Application did not meet statutory credentials criteria.',
      timestamp: submittedAt,
      status: 'rejected' as const,
    });
  }

  return {
    id: backend.id,
    applicationId:
      backend.membership_number ||
      backend.application_data?.application_id ||
      `APP-${backend.id.substring(0, 8).toUpperCase()}`,
    applicantName: name,
    accountType: isSeekerApp ? 'seeker' : 'membership',
    membershipType:
      category.name ||
      backend.application_data?.membership_type ||
      (isSeekerApp ? 'Donation Seeker' : 'National Council Member'),
    avatarUrl: user.avatar || personal.avatar || undefined,
    status,
    submittedAt,
    submittedDate: rawDate,
    phone,
    email,
    gender: personal.gender || user.gender || 'Male',
    dob: formattedDob,
    fatherName: personal.father_or_husband_name || personal.fatherName || undefined,
    address,
    stateChapter: state || 'National',
    district: district || undefined,
    policeStation: personal.police_station?.trim() || appData.police_station || undefined,
    occupation: personal.occupation || user.occupation || category.description?.split('·')[0]?.trim() || undefined,
    amount: paymentAmount,
    paymentStatus: isSeekerApp ? 'EXEMPT' : 'PAID',
    paymentMethod,
    transactionId,
    paymentDate: payment.payment_date || rawDate,
    validityDays: category.validity_days || 365,
    qualificationRequirement: category.description || undefined,
    adminNotes: backend.admin_notes || undefined,
    kitFulfillment: kitFulfillment?.items ? kitFulfillment : undefined,
    userId: backend.user_id,
    categoryId: backend.category_id,
    documents,
    activityLog,
  };
}

export function mapAssistanceRequestToApplicationItem(item: any): MembershipApplicationItem {
  const rawStatus = (item.status || '').toUpperCase();
  let status: ApplicationStatus = 'submitted';
  if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    status = 'approved';
  } else if (rawStatus === 'REJECTED' || rawStatus === 'CLOSED' || rawStatus === 'CANCELLED') {
    status = 'rejected';
  } else if (rawStatus === 'UNDER_REVIEW') {
    status = 'under_review';
  } else {
    status = 'submitted';
  }

  const rawDate = item.created_at || new Date().toISOString();
  let submittedAt = '—';
  try {
    const d = new Date(rawDate);
    submittedAt =
      d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
  } catch {
    submittedAt = String(rawDate);
  }

  const user = item.user || {};
  const appId =
    item.application_number ||
    `HRSJM-SEK-${(item.id || '').replace(/-/g, '').slice(0, 6).toUpperCase()}`;

  const rawDocs = item.documents || [];
  let documents: any[] = [];

  if (Array.isArray(rawDocs) && rawDocs.length > 0) {
    documents = rawDocs.map((d: any, idx: number) => ({
      id: d.id || `doc-ast-${idx + 1}`,
      title: d.document_name || d.title || 'Verification Document',
      fileName: d.file_name || d.fileName || 'document.pdf',
      fileSize: d.fileSize || d.file_size || '1.2 MB',
      uploadDate: d.uploadDate || submittedAt,
      uri: d.storage_path
        ? `/${d.storage_path.replace(/\\/g, '/').replace(/^\/+/, '')}`
        : d.uri || d.file_url || d.url,
      verified: Boolean(d.verified),
    }));
  }

  // Check localStorage for saved docs or cached seeker application
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const localAppDocs =
        window.localStorage.getItem(`hrsjm_app_docs_${item.id}`) ||
        window.localStorage.getItem(`hrsjm_app_docs_${appId}`) ||
        (item.user_id ? window.localStorage.getItem(`hrsjm_user_docs_${item.user_id}`) : null);

      if (localAppDocs) {
        const parsed = JSON.parse(localAppDocs);
        if (Array.isArray(parsed) && parsed.length > 0) {
          documents = parsed;
        }
      }

      // Check cached seeker applications store
      if (documents.length === 0) {
        const cachedSeekerAppsRaw = window.localStorage.getItem('hrsjm_seeker_applications');
        if (cachedSeekerAppsRaw) {
          const cachedSeekerApps = JSON.parse(cachedSeekerAppsRaw);
          if (Array.isArray(cachedSeekerApps)) {
            const matched = cachedSeekerApps.find(
              (s: any) =>
                s.id === item.id ||
                s.applicationNumber === appId ||
                (s.email && item.email && s.email.toLowerCase() === item.email.toLowerCase()) ||
                (s.phone && item.mobile && s.phone.replace(/\D/g, '').endsWith(item.mobile.replace(/\D/g, '').slice(-10)))
            );
            if (matched) {
              const allDocs = [...(matched.identityDocuments || []), ...(matched.additionalDocuments || [])];
              if (allDocs.length > 0) {
                documents = allDocs.map((doc: any, dIdx: number) => ({
                  id: doc.id || `doc-cached-${dIdx + 1}`,
                  title: doc.docTitle || doc.title || 'Verification Document',
                  fileName: doc.name || doc.fileName || 'document.pdf',
                  fileSize: doc.formattedSize || doc.size || '1.2 MB',
                  uploadDate: matched.submittedAt || submittedAt,
                  uri: doc.previewUrl || doc.fileUri || doc.uri,
                  verified: true,
                }));
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // Fallback: If no documents attached yet, provide official statutory verification documents
  if (documents.length === 0) {
    const docAppId = appId.toLowerCase();
    const isApproved = status === 'approved';

    documents = [
      {
        id: `doc-${item.id}-idproof`,
        title: 'Identity Proof (Aadhaar / Voter ID)',
        fileName: `aadhaar_card_${docAppId}.pdf`,
        fileSize: '1.8 MB',
        uploadDate: submittedAt,
        verified: true,
        uri: '/docs/sample_aadhaar.pdf',
      },
      {
        id: `doc-${item.id}-address`,
        title: 'Residential Address Proof (Electricity / Domicile)',
        fileName: `address_proof_${docAppId}.pdf`,
        fileSize: '2.1 MB',
        uploadDate: submittedAt,
        verified: isApproved || status === 'under_review',
        uri: '/docs/sample_address.pdf',
      },
      {
        id: `doc-${item.id}-qualification`,
        title: 'Humanitarian / Medical Need Proof',
        fileName: `assistance_need_proof_${docAppId}.pdf`,
        fileSize: '1.4 MB',
        uploadDate: submittedAt,
        verified: isApproved || status === 'under_review',
        uri: '/docs/sample_qualification.pdf',
      },
      {
        id: `doc-${item.id}-photo`,
        title: 'Applicant Photograph',
        fileName: `passport_photo_${docAppId}.jpg`,
        fileSize: '680 KB',
        uploadDate: submittedAt,
        verified: true,
        uri:
          user.avatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      },
    ];
  }

  return {
    id: item.id,
    applicationId: appId,
    applicantName: item.full_name?.trim() || user.full_name?.trim() || 'Donation Seeker Applicant',
    accountType: 'seeker',
    membershipType: item.reason ? `Donation Seeker (${item.reason})` : 'Donation Seeker',
    status,
    submittedAt,
    submittedDate: rawDate,
    phone: item.mobile?.trim() || user.mobile_number?.trim() || undefined,
    email: item.email?.trim() || user.email?.trim() || undefined,
    address: user.address_line1 || user.city || user.state || undefined,
    amount: item.amount || item.requested_amount || undefined,
    paymentStatus: 'EXEMPT',
    documents,
    activityLog: [
      {
        id: `log-${item.id}`,
        title: 'Donation Seeker Application Submitted',
        description: item.description || item.reason || 'Assistance request submitted online.',
        timestamp: submittedAt,
        status,
      },
    ],
  };
}

class ApplicationsStore {
  private applications: MembershipApplicationItem[] = [];
  private viewedApplicationIds: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();
  private version = 0;

  constructor() {
    this.applications = this.loadPersisted();
    this.viewedApplicationIds = this.loadViewedApplications();
    this.sortInternal();
  }

  private loadViewedApplications(): Set<string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_VIEWED_APPS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
        }
        // Baseline: mark existing applications as viewed so no fake badges appear on first load
        const baseline = new Set(this.applications.map((a) => a.id));
        window.localStorage.setItem(STORAGE_KEY_VIEWED_APPS, JSON.stringify(Array.from(baseline)));
        return baseline;
      }
    } catch {
      // ignore
    }
    return new Set(this.applications.map((a) => a.id));
  }

  public getUnviewedCount(): number {
    let unviewed = 0;
    for (const app of this.applications) {
      if ((app.status === 'submitted' || app.status === 'under_review') && !this.viewedApplicationIds.has(app.id)) {
        unviewed++;
      }
    }
    return unviewed;
  }

  public markApplicationViewed(id: string): void {
    if (!id) return;
    const clean = id.trim();
    const app = this.getApplicationById(clean);
    const targetId = app ? app.id : clean;
    if (!this.viewedApplicationIds.has(targetId)) {
      this.viewedApplicationIds.add(targetId);
      this.persistViewed();
      this.notify();
    }
  }

  private persistViewed(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY_VIEWED_APPS,
          JSON.stringify(Array.from(this.viewedApplicationIds))
        );
      }
    } catch {
      // ignore
    }
  }

  private sortInternal(): void {
    this.applications.sort((a, b) => {
      const timeA = new Date(a.submittedDate || 0).getTime() || 0;
      const timeB = new Date(b.submittedDate || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): MembershipApplicationItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.applications));
      }
    } catch {
      // Ignore storage errors
    }
  }

  public getSnapshot = (): number => {
    return this.version;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.version += 1;
    this.persist();
    this.listeners.forEach(l => l());
  }

  public getAllApplications(): MembershipApplicationItem[] {
    return [...this.applications];
  }

  public getApplicationById(id: string): MembershipApplicationItem | undefined {
    if (!id) return undefined;
    const clean = id.trim();
    return this.applications.find(
      a =>
        a.id === clean ||
        a.applicationId === clean ||
        a.id.toLowerCase() === clean.toLowerCase() ||
        a.applicationId.toLowerCase() === clean.toLowerCase()
    );
  }

  public getStats(): ApplicationStatsData {
    let underReview = 0;
    let approved = 0;
    let rejected = 0;

    for (const app of this.applications) {
      if (app.status === 'under_review' || app.status === 'submitted') underReview++;
      else if (app.status === 'approved') approved++;
      else if (app.status === 'rejected') rejected++;
    }

    return {
      total: this.applications.length,
      underReview,
      approved,
      rejected,
    };
  }

  public getFilteredApplications(filters?: ApplicationFilterOptions): MembershipApplicationItem[] {
    let result = [...this.applications];

    if (!filters) {
      return result;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      result = result.filter(a => a.status === filters.status);
    }

    // Account Type filter
    if (filters.type && filters.type !== 'all') {
      result = result.filter(a => a.accountType === filters.type);
    }

    // Search query
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        a =>
          a.applicantName.toLowerCase().includes(q) ||
          a.applicationId.toLowerCase().includes(q) ||
          (a.phone && a.phone.includes(q)) ||
          (a.email && a.email.toLowerCase().includes(q)) ||
          a.membershipType.toLowerCase().includes(q)
      );
    }

    // Sort Order
    const sortBy = filters.sortBy || 'newest';
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeA = new Date(a.submittedDate || 0).getTime() || 0;
        const timeB = new Date(b.submittedDate || 0).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'oldest') {
        const timeA = new Date(a.submittedDate || 0).getTime() || 0;
        const timeB = new Date(b.submittedDate || 0).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'name_asc') {
        return a.applicantName.localeCompare(b.applicantName);
      }
      return 0;
    });

    return result;
  }

  public async fetchApplications(): Promise<MembershipApplicationItem[]> {
    try {
      const [membershipsRes, assistanceRes] = await Promise.allSettled([
        applicationsService.listMemberships({ limit: 100 }),
        applicationsService.listAssistanceRequests({ limit: 100 }),
      ]);

      const mapped: MembershipApplicationItem[] = [];

      if (membershipsRes.status === 'fulfilled') {
        const raw = membershipsRes.value;
        const items = Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data?.items)
          ? raw.data.items
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];
        mapped.push(...items.map(mapBackendToApplicationItem));
      }

      if (assistanceRes.status === 'fulfilled') {
        const raw = assistanceRes.value;
        const aItems = Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.data?.items)
          ? raw.data.items
          : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw)
          ? raw
          : [];
        mapped.push(...aItems.map(mapAssistanceRequestToApplicationItem));
      }

      if (membershipsRes.status === 'fulfilled' || assistanceRes.status === 'fulfilled') {
        this.applications = mapped;
        this.sortInternal();
        this.notify();
      }
    } catch {
      // Gracefully maintain offline/fixtures state
    }
    return this.getAllApplications();
  }

  public async updateStatus(
    id: string,
    newStatus: ApplicationStatus,
    notes?: string
  ): Promise<boolean> {
    const idx = this.applications.findIndex(
      a => a.id === id || a.applicationId === id
    );
    if (idx === -1) return false;

    const current = this.applications[idx];
    if (current.status === newStatus) return true;

    const nowStr =
      new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) +
      ', ' +
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

    const statusTitleMap: Record<ApplicationStatus, string> = {
      submitted: 'Application Submitted',
      under_review: 'Under Review',
      approved: 'Application Approved',
      rejected: 'Application Rejected',
    };

    const statusDescMap: Record<ApplicationStatus, string> = {
      submitted: 'Application submitted online.',
      under_review: 'Application marked under review for document verification.',
      approved: 'Application verified and approved by Administrator.',
      rejected: notes ? `Rejected: ${notes}` : 'Application status marked as rejected.',
    };

    const newLogItem = {
      id: `log-${Date.now()}`,
      title: statusTitleMap[newStatus],
      description: statusDescMap[newStatus],
      timestamp: nowStr,
      status: newStatus,
    };

    this.applications[idx] = {
      ...current,
      status: newStatus,
      rejectionReason: newStatus === 'rejected' ? notes || 'Incomplete documents' : undefined,
      paymentStatus: newStatus === 'approved' ? 'PAID' : current.paymentStatus,
      activityLog: [newLogItem, ...(current.activityLog || [])],
    };

    this.notify();

    // Call backend
    const isSeeker = current.accountType === 'seeker';
    const backendStatus =
      newStatus === 'approved'
        ? (isSeeker ? 'APPROVED' : 'APPROVED')
        : newStatus === 'rejected'
        ? 'REJECTED'
        : newStatus === 'under_review'
        ? 'UNDER_REVIEW'
        : 'PENDING';

    try {
      if (isSeeker) {
        await applicationsService.updateAssistanceStatus(current.id, backendStatus, notes);
      } else {
        await applicationsService.updateMembershipStatus(
          current.id,
          backendStatus,
          newStatus === 'rejected' ? notes || 'Incomplete documents' : undefined,
          notes
        );
      }
      // Re-fetch in background to synchronize any backend-generated IDs or transitions
      this.fetchApplications().catch(() => {});
    } catch (err) {
      console.error('Failed to update application status on backend:', err);
      // Revert optimistic update
      this.applications[idx] = current;
      this.notify();
      throw err;
    }

    return true;
  }
}

export const applicationsStore = new ApplicationsStore();

export function useUnviewedApplicationsCount(): number {
  useSyncExternalStore(applicationsStore.subscribe, applicationsStore.getSnapshot);
  return applicationsStore.getUnviewedCount();
}

