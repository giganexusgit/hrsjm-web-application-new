/**
 * HRSJM Admin Web Application — Events & Drives Service
 * Connects with backend endpoints (/api/v1/events)
 * and normalizes entity representations.
 */
import { apiClient, ENDPOINTS } from '@/api';
import type { EventListItem, CreateEventFormState } from '../types/events.types';

export function mapBackendEventToUi(item: any): EventListItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category || 'Seminar',
    eventType: item.event_type || item.eventType || 'IN_PERSON',
    location: item.location || '',
    address: item.address,
    coverImageUrl: item.cover_image_url || item.coverImageUrl,
    startAt: item.start_at || item.startAt || new Date().toISOString(),
    endAt: item.end_at || item.endAt || null,
    allDay: item.all_day ?? item.allDay ?? false,
    organizer: item.organized_by || item.organizer || 'HRSJM Mission',
    description: item.description || '',
    shortInformation: item.short_information || item.shortInformation,
    registrations: item.registrations ?? 0,
    capacity: item.capacity,
    perPersonLimit: item.per_person_limit ?? item.perPersonLimit,
    targetAudience: item.target_audience || item.targetAudience,
    language: item.language,
    tags: item.tags || [],
    status: item.status || 'UPCOMING',
    isDonationEnabled: item.is_donation_enabled ?? item.isDonationEnabled ?? false,
    donationMessage: item.donation_message ?? item.donationMessage ?? '',
    createdBy: item.created_by ?? item.createdBy ?? null,
    created_at: item.created_at,
    updated_at: item.updated_at,
  };
}

/**
 * Returns true only for events created via the Admin module (excludes DB-seeded fixtures).
 */
export function isAdminCreatedEvent(event: EventListItem): boolean {
  const idStr = String(event.id || '');
  if (idStr.startsWith('10000000-') || idStr.startsWith('evt-')) return false;
  return Boolean(event.createdBy);
}

export const eventsService = {
  async list(params: { status?: string; category?: string; search?: string } = {}): Promise<EventListItem[]> {
    try {
      const data = await apiClient.get<any>(ENDPOINTS.events.list, {
        params: {
          status: params.status && params.status !== 'ALL' ? params.status : undefined,
          category: params.category && params.category !== 'ALL' ? params.category : undefined,
          search: params.search?.trim() || undefined,
        },
      });

      if (Array.isArray(data)) return data.map(mapBackendEventToUi);
      if (data && Array.isArray(data.items)) return data.items.map(mapBackendEventToUi);
      return [];
    } catch (err) {
      console.warn('Backend events fetch failed, falling back:', err);
      throw err;
    }
  },

  async getById(id: string): Promise<EventListItem> {
    const data = await apiClient.get<any>(ENDPOINTS.events.getById(id));
    return mapBackendEventToUi(data);
  },

  async create(form: CreateEventFormState): Promise<EventListItem> {
    const startAt = form.eventDate && form.startTime
      ? new Date(`${form.eventDate}T${form.startTime}:00`).toISOString()
      : new Date().toISOString();

    const endDateStr = form.endDate || form.eventDate;
    const endAt = endDateStr && form.endTime
      ? new Date(`${endDateStr}T${form.endTime}:00`).toISOString()
      : undefined;

    const capacityNum = form.totalSeats ? parseInt(form.totalSeats, 10) : undefined;
    const perPersonNum = form.perPersonLimit ? parseInt(form.perPersonLimit, 10) : undefined;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      short_information: form.shortInformation?.trim() || undefined,
      category: form.category || 'Seminar',
      event_type: form.eventType || 'IN_PERSON',
      cover_image_url: form.coverImageUri || undefined,
      start_at: startAt,
      end_at: endAt,
      all_day: form.allDay,
      location: form.location.trim(),
      address: form.address?.trim() || undefined,
      organized_by: form.organizedBy?.trim() || 'HRSJM Mission',
      registration_required: form.registrationRequired,
      capacity: Number.isFinite(capacityNum) && capacityNum! > 0 ? capacityNum : undefined,
      per_person_limit: Number.isFinite(perPersonNum) && perPersonNum! > 0 ? perPersonNum : undefined,
      target_audience: form.targetAudience?.trim() || undefined,
      language: form.language?.trim() || undefined,
      tags: form.tags,
      status: form.status === 'PUBLISH' ? 'UPCOMING' : 'DRAFT',
      is_donation_enabled: Boolean(form.isDonationEnabled),
      donation_message: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
    };

    const data = await apiClient.post<any>(ENDPOINTS.events.create, payload);
    return mapBackendEventToUi(data);
  },

  async update(id: string, form: Partial<CreateEventFormState> | Partial<EventListItem>): Promise<EventListItem> {
    const payload: Record<string, unknown> = {};
    if (form.title !== undefined) payload.title = form.title.trim();
    if (form.description !== undefined) payload.description = form.description.trim();
    if ('shortInformation' in form && form.shortInformation !== undefined) {
      payload.short_information = form.shortInformation ? form.shortInformation.trim() : undefined;
    }
    if (form.category !== undefined) payload.category = form.category;
    if ('eventType' in form && form.eventType !== undefined) payload.event_type = form.eventType;
    if ('coverImageUri' in form && form.coverImageUri !== undefined) payload.cover_image_url = form.coverImageUri;
    if ('coverImageUrl' in form && form.coverImageUrl !== undefined) payload.cover_image_url = form.coverImageUrl;
    if (form.location !== undefined) payload.location = form.location.trim();
    if (form.address !== undefined) payload.address = form.address.trim();
    if ('organizedBy' in form && form.organizedBy !== undefined) payload.organized_by = form.organizedBy.trim();
    if ('organizer' in form && form.organizer !== undefined) payload.organized_by = form.organizer.trim();
    if ('registrationRequired' in form && form.registrationRequired !== undefined) {
      payload.registration_required = form.registrationRequired;
    }
    if ('totalSeats' in form && form.totalSeats !== undefined) {
      const parsed = parseInt(form.totalSeats, 10);
      if (Number.isFinite(parsed)) payload.capacity = parsed;
    }
    if ('capacity' in form && form.capacity !== undefined) payload.capacity = form.capacity;
    if ('perPersonLimit' in form && form.perPersonLimit !== undefined) {
      const parsed = typeof form.perPersonLimit === 'string' ? parseInt(form.perPersonLimit, 10) : form.perPersonLimit;
      if (Number.isFinite(parsed)) payload.per_person_limit = parsed;
    }
    if ('targetAudience' in form && form.targetAudience !== undefined) payload.target_audience = form.targetAudience.trim();
    if ('language' in form && form.language !== undefined) payload.language = form.language.trim();
    if (form.tags !== undefined) payload.tags = form.tags;
    if ('status' in form && form.status !== undefined) payload.status = form.status;
    if ('isDonationEnabled' in form) {
      payload.is_donation_enabled = Boolean(form.isDonationEnabled);
    }
    if ('donationMessage' in form) {
      payload.donation_message = form.donationMessage ? form.donationMessage.trim() : null;
    }

    const data = await apiClient.patch<any>(ENDPOINTS.events.update(id), payload);
    return mapBackendEventToUi(data);
  },

  async delete(id: string): Promise<{ success: boolean }> {
    await apiClient.delete(ENDPOINTS.events.delete(id));
    return { success: true };
  },
};
