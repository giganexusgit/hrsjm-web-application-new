import { useSyncExternalStore } from 'react';
import type {
  CreateTicketBody,
  SupportTicket,
  SupportTicketMessage,
  TicketStatsData,
  TicketStatus,
} from '../types/support.types';
import { supportService } from '../services/supportService';

const STORAGE_KEY_TICKETS = 'hrsjm_local_support_tickets_v1';
const STORAGE_KEY_MESSAGES = 'hrsjm_local_support_messages_v1';
const STORAGE_KEY_VIEWED_TICKETS = 'hrsjm_admin_viewed_tickets_v1';
const STORAGE_KEY_VIEWED_MESSAGES = 'hrsjm_admin_viewed_messages_v1';

class SupportStore {
  private tickets: SupportTicket[] = [];
  private messagesByTicket: Record<string, SupportTicketMessage[]> = {};
  private viewedTicketIds: Set<string> = new Set();
  private viewedMessageIds: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: {
    tickets: SupportTicket[];
    messagesByTicket: Record<string, SupportTicketMessage[]>;
    unviewedCount: number;
    version: number;
  };

  constructor() {
    this.tickets = this.loadPersistedTickets();
    this.messagesByTicket = this.loadPersistedMessages();
    this.viewedTicketIds = this.loadViewedTickets();
    this.viewedMessageIds = this.loadViewedMessages();
    this.sortInternal();
    this.cachedSnapshot = {
      tickets: this.tickets,
      messagesByTicket: this.messagesByTicket,
      unviewedCount: this.getUnviewedCount(),
      version: this.version,
    };
  }

  private loadViewedTickets(): Set<string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_VIEWED_TICKETS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
        }
        // Baseline for initial seed tickets: mark them as viewed so they don't produce fake notification badges
        const baseline = new Set(this.tickets.map((t) => t.id));
        window.localStorage.setItem(STORAGE_KEY_VIEWED_TICKETS, JSON.stringify(Array.from(baseline)));
        return baseline;
      }
    } catch {
      // ignore
    }
    return new Set(this.tickets.map((t) => t.id));
  }

  private loadViewedMessages(): Set<string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_VIEWED_MESSAGES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
        }
        const allMsgIds: string[] = [];
        Object.values(this.messagesByTicket).forEach((msgs) => {
          msgs.forEach((m) => allMsgIds.push(m.id));
        });
        const baseline = new Set(allMsgIds);
        window.localStorage.setItem(STORAGE_KEY_VIEWED_MESSAGES, JSON.stringify(Array.from(baseline)));
        return baseline;
      }
    } catch {
      // ignore
    }
    return new Set();
  }

  public getUnviewedCount(): number {
    let unviewedTickets = 0;
    // Count open/submitted tickets not yet viewed by admin
    for (const t of this.tickets) {
      if ((t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW') && !this.viewedTicketIds.has(t.id)) {
        unviewedTickets++;
      }
    }

    // Count incoming messages from citizens not yet viewed by admin
    let unviewedMessages = 0;
    for (const ticketId in this.messagesByTicket) {
      const msgs = this.messagesByTicket[ticketId] || [];
      for (const m of msgs) {
        const isCitizenMsg = m.author_id !== 'admin-001' && !m.author?.roles?.includes('ADMIN');
        if (isCitizenMsg && !this.viewedMessageIds.has(m.id)) {
          unviewedMessages++;
        }
      }
    }

    return unviewedTickets + unviewedMessages;
  }

  public isTicketViewed(ticketId: string): boolean {
    return this.viewedTicketIds.has(ticketId);
  }

  public markTicketViewed(ticketId: string): void {
    if (!ticketId) return;
    let changed = false;
    if (!this.viewedTicketIds.has(ticketId)) {
      this.viewedTicketIds.add(ticketId);
      changed = true;
    }
    const msgs = this.messagesByTicket[ticketId] || [];
    for (const m of msgs) {
      if (!this.viewedMessageIds.has(m.id)) {
        this.viewedMessageIds.add(m.id);
        changed = true;
      }
    }
    if (changed) {
      this.persistViewed();
      this.notify();
    }
  }

  public markMessageViewed(messageId: string): void {
    if (!messageId) return;
    if (!this.viewedMessageIds.has(messageId)) {
      this.viewedMessageIds.add(messageId);
      this.persistViewed();
      this.notify();
    }
  }

  private persistViewed(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY_VIEWED_TICKETS,
          JSON.stringify(Array.from(this.viewedTicketIds))
        );
        window.localStorage.setItem(
          STORAGE_KEY_VIEWED_MESSAGES,
          JSON.stringify(Array.from(this.viewedMessageIds))
        );
      }
    } catch {
      // ignore
    }
  }

  private sortInternal(): void {
    this.tickets.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime() || 0;
      const timeB = new Date(b.created_at || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersistedTickets(): SupportTicket[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_TICKETS);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.filter((t: any) => t.id && !t.id.startsWith('tkt-00'));
          }
        }
      }
    } catch {
      // Fallback
    }
    return [];
  }

  private loadPersistedMessages(): Record<string, SupportTicketMessage[]> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY_MESSAGES);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return {};
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(this.tickets));
        window.localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(this.messagesByTicket));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      tickets: [...this.tickets],
      messagesByTicket: { ...this.messagesByTicket },
      unviewedCount: this.getUnviewedCount(),
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

  public getSnapshot = (): {
    tickets: SupportTicket[];
    messagesByTicket: Record<string, SupportTicketMessage[]>;
    unviewedCount: number;
    version: number;
  } => {
    return this.cachedSnapshot;
  };

  public getAllTickets(): SupportTicket[] {
    return [...this.tickets];
  }

  public getTicketById(id: string): SupportTicket | undefined {
    return this.tickets.find((t) => t.id === id);
  }

  public getMessagesForTicket(ticketId: string): SupportTicketMessage[] {
    return this.messagesByTicket[ticketId] ? [...this.messagesByTicket[ticketId]] : [];
  }

  public getStats(): TicketStatsData {
    let open = 0;
    let inProgress = 0;
    let resolved = 0;
    let closed = 0;

    for (const t of this.tickets) {
      if (t.status === 'SUBMITTED') open++;
      else if (t.status === 'UNDER_REVIEW') inProgress++;
      else if (t.status === 'RESOLVED') resolved++;
      else if (t.status === 'CLOSED') closed++;
    }

    return {
      total: this.tickets.length,
      open,
      inProgress,
      resolved,
      closed,
    };
  }

  public async fetchTickets(): Promise<void> {
    try {
      const res = await supportService.list({ limit: 100 });
      const items = res?.items || (Array.isArray(res) ? res : []);
      if (Array.isArray(items)) {
        this.tickets = items;
        this.sortInternal();
        this.notify();
      }
    } catch {
      // In offline mode, retain real local items only
    }
  }

  public async createTicket(body: CreateTicketBody): Promise<SupportTicket> {
    let newTicket: SupportTicket;
    try {
      newTicket = await supportService.create(body);
    } catch {
      // Offline fallback creation
      const id = `tkt-${Date.now().toString(36)}`;
      newTicket = {
        id,
        user_id: 'usr-admin-current',
        user: {
          id: 'usr-admin-current',
          full_name: 'Administrator',
          email: 'admin@hrsjm.org',
          roles: ['ADMIN'],
        },
        subject: body.subject,
        description: body.description,
        status: 'SUBMITTED',
        category: body.category || 'General',
        priority: body.priority || 'NORMAL',
        source: body.source || 'web',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        documents: body.attachments || [],
      };
    }

    this.tickets.unshift(newTicket);
    this.sortInternal();
    this.notify();
    return newTicket;
  }

  public async updateStatus(
    id: string,
    status: TicketStatus,
    note?: string
  ): Promise<SupportTicket | undefined> {
    try {
      await supportService.updateStatus(id, { status, note });
    } catch {
      // Offline mock fallback
    }

    const index = this.tickets.findIndex((t) => t.id === id);
    if (index !== -1) {
      const existing = this.tickets[index];
      const updated: SupportTicket = {
        ...existing,
        status,
        resolution_note: note || existing.resolution_note,
        resolved_at: status === 'RESOLVED' ? new Date().toISOString() : existing.resolved_at,
        resolved_by: status === 'RESOLVED' || status === 'CLOSED' ? 'admin-001' : existing.resolved_by,
        resolved_by_user:
          status === 'RESOLVED' || status === 'CLOSED'
            ? { id: 'admin-001', full_name: 'Administrator', email: 'admin@hrsjm.org' }
            : existing.resolved_by_user,
        updated_at: new Date().toISOString(),
      };
      this.tickets[index] = updated;

      // Also add an audit system message in chat
      if (note) {
        this.appendLocalMessage(id, {
          id: `msg-${Date.now()}`,
          ticket_id: id,
          author_id: 'admin-001',
          author: { id: 'admin-001', full_name: 'Administrator · Admin', roles: ['ADMIN'] },
          body: `[Status Updated to ${status}]: ${note}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      this.notify();
      return updated;
    }
    return undefined;
  }

  public async addMessage(ticketId: string, bodyText: string): Promise<SupportTicketMessage> {
    let msg: SupportTicketMessage;
    try {
      msg = await supportService.addMessage(ticketId, { body: bodyText });
    } catch {
      // Offline mock fallback
      msg = {
        id: `msg-${Date.now()}`,
        ticket_id: ticketId,
        author_id: 'admin-001',
        author: {
          id: 'admin-001',
          full_name: 'Administrator · Support',
          email: 'admin@hrsjm.org',
          roles: ['ADMIN'],
        },
        body: bodyText,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    this.appendLocalMessage(ticketId, msg);
    return msg;
  }

  private appendLocalMessage(ticketId: string, msg: SupportTicketMessage): void {
    if (!this.messagesByTicket[ticketId]) {
      this.messagesByTicket[ticketId] = [];
    }
    this.messagesByTicket[ticketId].push(msg);
    this.notify();
  }
}

export const supportStore = new SupportStore();

export function useUnviewedSupportCount(): number {
  const snapshot = useSyncExternalStore(supportStore.subscribe, supportStore.getSnapshot);
  return snapshot.unviewedCount;
}

