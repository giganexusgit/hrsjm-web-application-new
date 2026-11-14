import type {
  AssistanceRequest,
  AssistanceStatus,
  AssistanceSummaryStats,
  CreateAssistanceRequestPayload,
} from '../types/assistance.types';
import { assistanceService } from '../services/assistanceService';

const STORAGE_KEY = 'hrsjm_local_assistance_v1';

class AssistanceStore {
  private requests: AssistanceRequest[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { requests: AssistanceRequest[]; version: number };

  constructor() {
    this.requests = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      requests: this.requests,
      version: this.version,
    };
  }

  private sortInternal(): void {
    this.requests.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime() || 0;
      const timeB = new Date(b.created_at || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): AssistanceRequest[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.requests));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      requests: [...this.requests],
      version: this.version,
    };
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): { requests: AssistanceRequest[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAllRequests(): AssistanceRequest[] {
    return [...this.requests];
  }

  public getById(id: string): AssistanceRequest | undefined {
    return this.requests.find((r) => r.id === id);
  }

  public getStats(): AssistanceSummaryStats {
    let underReview = 0;
    let approved = 0;
    let rejected = 0;
    let closed = 0;
    let totalAmount = 0;

    for (const r of this.requests) {
      if (r.status === 'UNDER_REVIEW' || r.status === 'PENDING') {
        underReview++;
      } else if (r.status === 'APPROVED') {
        approved++;
        totalAmount += Number(r.raised_amount || r.requested_amount || 0);
      } else if (r.status === 'REJECTED') {
        rejected++;
      } else if (r.status === 'CLOSED') {
        closed++;
        totalAmount += Number(r.raised_amount || r.requested_amount || 0);
      }
    }

    return {
      total: this.requests.length,
      underReview,
      approved,
      rejected,
      closed,
      totalAmount,
    };
  }

  public async fetchRequests(): Promise<void> {
    const res = await assistanceService.list({ limit: 100 });
    const remoteItems = Array.isArray(res?.items) ? res.items : [];
    const existingMap = new Map<string, AssistanceRequest>();
    this.requests.forEach((r) => existingMap.set(r.id, r));

    this.requests = remoteItems.map((remote) => {
      const existing = existingMap.get(remote.id);
      return {
        ...remote,
        age: remote.age ?? existing?.age,
        city: remote.city ?? existing?.city,
        state: remote.state ?? existing?.state,
        urgency: remote.urgency ?? existing?.urgency,
        documents: remote.documents && remote.documents.length > 0 ? remote.documents : existing?.documents,
      };
    });
    this.sortInternal();
    this.notify();
  }

  public async createRequest(payload: CreateAssistanceRequestPayload): Promise<AssistanceRequest> {
    const created = await assistanceService.create(payload);
    const enriched: AssistanceRequest = {
      ...created,
      age: created.age ?? payload.age,
      city: created.city ?? payload.city,
      state: created.state ?? payload.state,
      urgency: created.urgency ?? payload.urgency ?? 'NORMAL',
    };

    this.requests = [enriched, ...this.requests.filter((r) => r.id !== enriched.id)];
    this.sortInternal();
    this.notify();
    return enriched;
  }

  public async updateStatus(
    id: string,
    newStatus: AssistanceStatus,
    adminRemark?: string
  ): Promise<boolean> {
    const updated = await assistanceService.updateStatus(id, {
      status: newStatus,
      admin_remark: adminRemark,
    });

    const idx = this.requests.findIndex((r) => r.id === id);
    const nowIso = new Date().toISOString();
    if (idx !== -1) {
      const current = this.requests[idx];
      this.requests[idx] = {
        ...current,
        ...(updated && typeof updated === 'object' ? updated : {}),
        status: updated?.status || newStatus,
        admin_remark: adminRemark !== undefined ? adminRemark : (updated?.admin_remark ?? current.admin_remark),
        reviewed_at: updated?.reviewed_at || nowIso,
        updated_at: updated?.updated_at || nowIso,
      };
      this.notify();
    } else {
      await this.fetchRequests();
    }

    return true;
  }

  public toggleDocumentVerified(requestId: string, docId: string): void {
    const req = this.requests.find((r) => r.id === requestId);
    if (!req || !req.documents) return;

    const doc = req.documents.find((d) => d.id === docId);
    if (doc) {
      doc.verified = !doc.verified;
      this.notify();
    }
  }

  public resetToFixtures(): void {
    this.requests = [];
    this.notify();
  }
}

export const assistanceStore = new AssistanceStore();

