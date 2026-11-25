import {
  type EventListItem,
  type EventStatsSummary,
  type EventUiStatus,
  type CreateEventFormState,
  isEventFeatured,
} from '../types/events.types';
import { eventsService } from '../services/eventsService';

const STORAGE_KEY = 'hrsjm_local_events_v1';

class EventsStore {
  private events: EventListItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { events: EventListItem[]; version: number };

  constructor() {
    this.events = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      events: this.events,
      version: this.version,
    };
  }

  private sortInternal(): void {
    this.events.sort((a, b) => {
      const timeA = new Date(a.startAt || 0).getTime() || 0;
      const timeB = new Date(b.startAt || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): EventListItem[] {
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
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      events: [...this.events],
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

  public getSnapshot = (): { events: EventListItem[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAllEvents(): EventListItem[] {
    return [...this.events];
  }

  public getEventById(id: string): EventListItem | undefined {
    return this.events.find((e) => e.id === id);
  }

  public getStats(): EventStatsSummary {
    let upcoming = 0;
    let completed = 0;
    let cancelled = 0;
    let drafts = 0;

    for (const e of this.events) {
      if (e.status === 'UPCOMING') upcoming++;
      else if (e.status === 'COMPLETED') completed++;
      else if (e.status === 'CANCELLED') cancelled++;
      else if (e.status === 'DRAFT') drafts++;
    }

    return {
      total: this.events.length,
      upcoming,
      completed,
      cancelled,
      drafts,
    };
  }

  public async fetchEvents(): Promise<void> {
    try {
      const items = await eventsService.list();
      if (Array.isArray(items)) {
        this.events = items;
        this.sortInternal();
        this.notify();
      }
    } catch {
      // Offline fallback: keep local data
    }
  }

  public async createEvent(form: CreateEventFormState): Promise<EventListItem> {
    // If newly created event is featured, unfeature any other existing featured events
    if (form.isFeatured || isEventFeatured(form.tags)) {
      const otherFeatured = this.events.filter((e) => isEventFeatured(e.tags));
      for (const other of otherFeatured) {
        const strippedTags = (other.tags || []).filter(
          (t) => t.trim().toLowerCase() !== 'featured' && t.trim().toLowerCase() !== 'featured event'
        );
        eventsService.update(other.id, { tags: strippedTags }).catch(() => {});
        const oIdx = this.events.findIndex((e) => e.id === other.id);
        if (oIdx !== -1) {
          this.events[oIdx] = {
            ...this.events[oIdx],
            tags: strippedTags,
            isFeatured: false,
          };
        }
      }
    }

    let newEvent: EventListItem;
    try {
      newEvent = await eventsService.create(form);
    } catch {
      // Offline mock fallback
      const startAt = form.eventDate && form.startTime
        ? new Date(`${form.eventDate}T${form.startTime}:00`).toISOString()
        : new Date().toISOString();

      const endDateStr = form.endDate || form.eventDate;
      const endAt = endDateStr && form.endTime
        ? new Date(`${endDateStr}T${form.endTime}:00`).toISOString()
        : undefined;

      newEvent = {
        id: `e-${Date.now().toString(36)}`,
        title: form.title.trim(),
        description: form.description.trim(),
        shortInformation: form.shortInformation.trim() || null,
        category: form.category || 'Seminar',
        eventType: form.eventType || 'IN_PERSON',
        coverImageUrl: form.coverImageUri || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
        startAt,
        endAt,
        allDay: form.allDay || false,
        location: form.location.trim(),
        address: form.address.trim() || undefined,
        organizer: form.organizedBy.trim() || 'HRSJM Mission',
        registrations: 0,
        capacity: form.totalSeats ? parseInt(form.totalSeats, 10) : 100,
        perPersonLimit: form.perPersonLimit ? parseInt(form.perPersonLimit, 10) : 1,
        targetAudience: form.targetAudience || 'Open to All',
        language: form.language || 'English, Hindi',
        tags: form.tags,
        status: form.status === 'DRAFT' ? 'DRAFT' : 'UPCOMING',
        isDonationEnabled: Boolean(form.isDonationEnabled),
        donationMessage: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    this.events.unshift(newEvent);
    this.sortInternal();
    this.notify();
    return newEvent;
  }

  public async updateEvent(
    id: string,
    updates: Partial<EventListItem>
  ): Promise<EventListItem | undefined> {
    // If updating tags and the new tags contain 'Featured', automatically unfeature other events
    if (updates.tags && isEventFeatured(updates.tags)) {
      const otherFeatured = this.events.filter(
        (e) => e.id !== id && isEventFeatured(e.tags)
      );
      for (const other of otherFeatured) {
        const strippedTags = (other.tags || []).filter(
          (t) => t.trim().toLowerCase() !== 'featured' && t.trim().toLowerCase() !== 'featured event'
        );
        eventsService.update(other.id, { tags: strippedTags }).catch(() => {});
        const oIdx = this.events.findIndex((e) => e.id === other.id);
        if (oIdx !== -1) {
          this.events[oIdx] = {
            ...this.events[oIdx],
            tags: strippedTags,
            isFeatured: false,
          };
        }
      }
    }

    try {
      await eventsService.update(id, updates);
    } catch {
      // Offline mock fallback
    }

    const index = this.events.findIndex((e) => e.id === id);
    if (index !== -1) {
      const updated: EventListItem = {
        ...this.events[index],
        ...updates,
        isFeatured: updates.tags !== undefined ? isEventFeatured(updates.tags) : this.events[index].isFeatured,
        updated_at: new Date().toISOString(),
      };
      this.events[index] = updated;
      this.sortInternal();
      this.notify();
      return updated;
    }
    return undefined;
  }

  /**
   * Set an event as the sole Featured Event (or unfeature it).
   * Ensures strictly only ONE event is featured across the entire system.
   */
  public async setFeaturedEvent(targetId: string, shouldBeFeatured: boolean): Promise<boolean> {
    const target = this.events.find((e) => e.id === targetId);
    if (!target) return false;

    try {
      if (shouldBeFeatured) {
        // 1. Unfeature any OTHER event that is currently featured
        const otherFeaturedEvents = this.events.filter(
          (e) => e.id !== targetId && isEventFeatured(e.tags)
        );

        for (const other of otherFeaturedEvents) {
          const strippedTags = (other.tags || []).filter(
            (t) => t.trim().toLowerCase() !== 'featured' && t.trim().toLowerCase() !== 'featured event'
          );
          try {
            await eventsService.update(other.id, { tags: strippedTags });
          } catch (e) {
            console.warn(`Failed to unfeature event ${other.id}:`, e);
          }
          const idx = this.events.findIndex((e) => e.id === other.id);
          if (idx !== -1) {
            this.events[idx] = {
              ...this.events[idx],
              tags: strippedTags,
              isFeatured: false,
              updated_at: new Date().toISOString(),
            };
          }
        }

        // 2. Feature the target event
        const cleanTags = (target.tags || []).filter(
          (t) => t.trim().toLowerCase() !== 'featured' && t.trim().toLowerCase() !== 'featured event'
        );
        cleanTags.unshift('Featured');

        try {
          await eventsService.update(targetId, { tags: cleanTags });
        } catch (e) {
          console.warn(`Failed to feature event ${targetId}:`, e);
        }

        const targetIdx = this.events.findIndex((e) => e.id === targetId);
        if (targetIdx !== -1) {
          this.events[targetIdx] = {
            ...this.events[targetIdx],
            tags: cleanTags,
            isFeatured: true,
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        // Unfeature this target event
        const strippedTags = (target.tags || []).filter(
          (t) => t.trim().toLowerCase() !== 'featured' && t.trim().toLowerCase() !== 'featured event'
        );
        try {
          await eventsService.update(targetId, { tags: strippedTags });
        } catch (e) {
          console.warn(`Failed to unfeature event ${targetId}:`, e);
        }

        const targetIdx = this.events.findIndex((e) => e.id === targetId);
        if (targetIdx !== -1) {
          this.events[targetIdx] = {
            ...this.events[targetIdx],
            tags: strippedTags,
            isFeatured: false,
            updated_at: new Date().toISOString(),
          };
        }
      }

      this.sortInternal();
      this.notify();
      return true;
    } catch (err) {
      console.error('Failed to set featured event:', err);
      this.notify();
      return false;
    }
  }

  public async updateStatus(id: string, status: EventUiStatus): Promise<boolean> {
    const updated = await this.updateEvent(id, { status });
    return Boolean(updated);
  }

  public async deleteEvent(id: string): Promise<boolean> {
    try {
      await eventsService.delete(id);
    } catch {
      // Offline fallback
    }

    this.events = this.events.filter((e) => e.id !== id);
    this.notify();
    return true;
  }
}

export const eventsStore = new EventsStore();

