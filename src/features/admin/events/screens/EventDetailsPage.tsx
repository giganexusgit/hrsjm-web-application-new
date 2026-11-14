import React, { useState, useSyncExternalStore } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Building,
  Globe,
  Tag,
  Share2,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileEdit,
  Check,
  HeartHandshake,
  Eye,
} from 'lucide-react';
import { eventsStore } from '../store/eventsStore';
import type { EventUiStatus, CreateEventFormState } from '../types/events.types';
import { EditEventModal } from '../components/CreateEventModal';
import { EventDetailsView } from '../components/EventDetailsView';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);

  const event = id ? eventsStore.getEventById(id) : undefined;
  const [copied, setCopied] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Event Not Found</h2>
        <p className="text-slate-500 mb-6">
          The event you are looking for ({id}) does not exist or may have been deleted.
        </p>
        <button
          onClick={() => navigate('/admin/events')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#011F39] text-[#FAD465] font-semibold rounded-lg hover:bg-[#022b50] transition shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Events
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStatusChange = async (newStatus: EventUiStatus) => {
    setStatusUpdating(true);
    try {
      await eventsStore.updateStatus(event.id, newStatus);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await eventsStore.deleteEvent(event.id);
      navigate('/admin/events');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEditSubmit = async (form: CreateEventFormState, eventId: string) => {
    const startAt = form.eventDate && form.startTime
      ? new Date(`${form.eventDate}T${form.startTime}:00`).toISOString()
      : event.startAt;

    const endDateStr = form.endDate || form.eventDate;
    const endAt = endDateStr && form.endTime
      ? new Date(`${endDateStr}T${form.endTime}:00`).toISOString()
      : undefined;

    await eventsStore.updateEvent(eventId, {
      title: form.title.trim(),
      description: form.description.trim(),
      shortInformation: form.shortInformation?.trim() || null,
      category: form.category,
      eventType: form.eventType,
      coverImageUrl: form.coverImageUri,
      startAt,
      endAt,
      allDay: form.allDay,
      location: form.location.trim(),
      address: form.address?.trim() || undefined,
      organizer: form.organizedBy?.trim() || event.organizer,
      capacity: form.totalSeats ? parseInt(form.totalSeats, 10) : event.capacity,
      perPersonLimit: form.perPersonLimit ? parseInt(form.perPersonLimit, 10) : event.perPersonLimit,
      targetAudience: form.targetAudience,
      language: form.language,
      tags: form.tags,
      status: form.status === 'DRAFT' ? 'DRAFT' : 'UPCOMING',
      isDonationEnabled: Boolean(form.isDonationEnabled),
      donationMessage: form.isDonationEnabled && form.donationMessage ? form.donationMessage.trim() : null,
    });
  };

  const formattedDate = event.startAt
    ? new Date(event.startAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Date TBD';

  const startTime = event.startAt
    ? new Date(event.startAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const endTime = event.endAt
    ? new Date(event.endAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const timeDisplay = event.allDay
    ? 'All Day Event'
    : startTime && endTime
    ? `${startTime} – ${endTime}`
    : startTime || 'Time TBD';

  const capacity = event.capacity || 100;
  const registrations = event.registrations || 0;
  const fillPercent = Math.min(100, Math.round((registrations / capacity) * 100));

  const statusColors: Record<EventUiStatus, { bg: string; text: string; label: string; icon: any }> = {
    UPCOMING: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'text-emerald-700', label: 'Upcoming', icon: CheckCircle },
    COMPLETED: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'text-blue-700', label: 'Completed', icon: CheckCircle },
    CANCELLED: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', label: 'Cancelled', icon: XCircle },
    DRAFT: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', label: 'Draft', icon: FileEdit },
  };

  const currentStatus = statusColors[event.status] || statusColors.UPCOMING;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            onClick={() => navigate('/admin/events')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-[#011F39] transition mb-2"
          >
            <ArrowLeft size={16} /> Back to Events Management
          </button>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${currentStatus.bg}`}
            >
              <StatusIcon size={13} />
              {currentStatus.label}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {event.category}
            </span>
            {event.eventType && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#011F39]/10 text-[#011F39]">
                {event.eventType === 'IN_PERSON' ? '📍 In-Person' : event.eventType === 'ONLINE' ? '🌐 Online' : '🔄 Hybrid'}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex rounded-lg shadow-sm border border-slate-300 overflow-hidden bg-white">
            <select
              value={event.targetAudience === 'MEMBERS' || event.targetAudience === 'SEEKERS' || event.targetAudience === 'USERS' ? event.targetAudience : 'ALL'}
              onChange={(e) => eventsStore.updateEvent(event.id, { targetAudience: e.target.value })}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Visibility: All Portals</option>
              <option value="MEMBERS">Visibility: Members Only</option>
              <option value="SEEKERS">Visibility: Seekers Only</option>
              <option value="USERS">Visibility: General Users Only</option>
            </select>
          </div>

          <div className="inline-flex rounded-lg shadow-sm border border-slate-300 overflow-hidden bg-white">
            <select
              value={event.status}
              disabled={statusUpdating}
              onChange={(e) => handleStatusChange(e.target.value as EventUiStatus)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="UPCOMING">Status: Upcoming (Published)</option>
              <option value="COMPLETED">Status: Completed</option>
              <option value="CANCELLED">Status: Cancelled</option>
              <option value="DRAFT">Status: Draft (Admin Only)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#011F39] bg-white border border-[#011F39] rounded-lg hover:bg-slate-50 transition shadow-sm cursor-pointer"
            title="Preview how users see this event"
          >
            <Eye size={14} /> Preview User View
          </button>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#011F39] bg-[#FAD465] hover:bg-[#E9B82E] border border-[#E9B82E] rounded-lg transition shadow-sm cursor-pointer"
          >
            <FileEdit size={14} /> Edit Event
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            {copied ? 'Link Copied' : 'Share'}
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition shadow-sm"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Hero Cover Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {event.coverImageUrl ? (
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={event.coverImageUrl}
              alt={event.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex flex-col justify-end p-6 sm:p-8">
              <span className="text-xs font-bold text-[#FAD465] tracking-wider uppercase mb-1">
                {event.category} • {event.eventType || 'Event'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight drop-shadow-sm">
                {event.title}
              </h1>
              {event.shortInformation && (
                <p className="text-slate-200 text-sm sm:text-base mt-2 line-clamp-2 max-w-3xl">
                  {event.shortInformation}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6 sm:p-8 bg-gradient-to-br from-[#011F39] to-[#043b6c] text-white">
            <span className="text-xs font-bold text-[#FAD465] tracking-wider uppercase mb-1 block">
              {event.category} • {event.eventType || 'Event'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {event.title}
            </h1>
            {event.shortInformation && (
              <p className="text-slate-200 text-sm sm:text-base mt-2 max-w-3xl">
                {event.shortInformation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Main Grid: Details (Left) + Logistics Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Schedule & Venue Quick Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#011F39]/5 text-[#011F39]">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{formattedDate}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5">
                  <Clock size={13} className="text-slate-400" />
                  <span>{timeDisplay}</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-[#011F39]/5 text-[#011F39]">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Venue Location</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{event.location}</p>
                {event.address && (
                  <p className="text-xs text-slate-600 mt-0.5 leading-snug">{event.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* About / Description */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
              About This Event
            </h3>
            <div className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {event.description || 'No detailed description provided.'}
            </div>

            {/* Target Audience & Language info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-[#011F39]" />
                <div>
                  <span className="text-xs text-slate-500 block">Target Audience:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {event.targetAudience || 'General Public'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Globe size={16} className="text-[#011F39]" />
                <div>
                  <span className="text-xs text-slate-500 block">Languages:</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {event.language || 'English, Hindi'}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                  <Tag size={13} /> Event Tags:
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attendance & Organizer Sidecard */}
        <div className="space-y-6">
          {/* Delegate Capacity & Registrations Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
              <span>Registrations</span>
              <span className="text-xs font-bold text-slate-500">
                {registrations} / {capacity} seats
              </span>
            </h3>

            {/* Capacity Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-[#011F39] h-full rounded-full transition-all duration-500"
                  style={{ width: `${fillPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-500 font-medium">
                <span>{fillPercent}% Booked</span>
                <span>{Math.max(0, capacity - registrations)} remaining</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Registration Type</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Free Admission
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Per-Person Limit</span>
                <span className="font-semibold text-slate-700">
                  {event.perPersonLimit || 1} seat(s)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Format</span>
                <span className="font-semibold text-slate-700">
                  {event.eventType === 'IN_PERSON' ? 'In-Person' : event.eventType === 'ONLINE' ? 'Virtual' : 'Hybrid'}
                </span>
              </div>
            </div>
          </div>

          {/* Voluntary Donations Configuration Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HeartHandshake size={18} className="text-[#011F39]" />
                <h3 className="text-base font-bold text-slate-900">Voluntary Donations</h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  event.isDonationEnabled
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {event.isDonationEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              {event.isDonationEnabled
                ? 'Citizens and members can make voluntary contributions for this event via Cashfree gateway.'
                : 'Voluntary donations are disabled for this event. No contribution button is displayed.'}
            </p>

            {event.isDonationEnabled && event.donationMessage && (
              <div className="p-3 bg-[#FAF7F0] border border-[#FDE68A] rounded-lg text-xs">
                <span className="font-bold text-[#011F39] block text-[11px] uppercase tracking-wider mb-1">
                  Appeal Message:
                </span>
                <p className="text-slate-700 italic">"{event.donationMessage}"</p>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  await eventsStore.updateEvent(event.id, {
                    isDonationEnabled: !event.isDonationEnabled,
                  });
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                  event.isDonationEnabled
                    ? 'text-rose-700 bg-rose-50 border-rose-200 hover:bg-rose-100'
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {event.isDonationEnabled ? 'Turn Donations OFF' : 'Turn Donations ON'}
              </button>

              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-semibold text-[#011F39] hover:underline cursor-pointer"
              >
                Configure Details →
              </button>
            </div>
          </div>

          {/* Organizer Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900">Organizer Information</h3>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-10 h-10 rounded-full bg-[#011F39] text-[#FAD465] font-bold flex items-center justify-center text-sm shadow-sm">
                <Building size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{event.organizer || 'HRSJM Central Command'}</p>
                <p className="text-xs text-slate-500">Human Rights Sanrakshan Sansthan</p>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <div>
                <span className="font-medium text-slate-600">Created on:</span>{' '}
                {event.created_at ? new Date(event.created_at).toLocaleDateString('en-IN') : 'Recently'}
              </div>
              <div>
                <span className="font-medium text-slate-600">Event ID:</span>{' '}
                <code className="text-[11px] text-slate-700 bg-slate-100 px-1 py-0.5 rounded">{event.id}</code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 size={24} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-900">Delete Event?</h3>
              <p className="text-sm text-slate-500 mt-1">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{event.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition shadow-sm"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={isEditModalOpen}
        event={event}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
      />

      {/* User View Preview Modal (matches Images 1, 2, 3) */}
      {isPreviewOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-0 sm:p-4 animate-in fade-in"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div
            className="relative w-full max-w-xl min-h-screen sm:min-h-0 sm:max-h-[92vh] sm:rounded-3xl overflow-y-auto shadow-2xl bg-[#FAF7F0]"
            onClick={(e) => e.stopPropagation()}
          >
            <EventDetailsView
              event={event}
              onBack={() => setIsPreviewOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
