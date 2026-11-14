import React, { useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Tag,
  Heart,
  Link2,
  Check,
} from 'lucide-react';
import { eventsStore } from '../store/eventsStore';
import type { EventListItem } from '../types/events.types';
import { EventDonationModal } from './EventDonationModal';
import { useAuth } from '@/features/auth/store/authStore';

export interface EventDetailsViewProps {
  event?: EventListItem | null;
  eventId?: string;
  onBack?: () => void;
  onDonateClick?: (event: EventListItem) => void;
  onRegister?: (event: EventListItem) => void;
  isRegistered?: boolean;
  showBack?: boolean;
  className?: string;
}

const DEFAULT_COVER = '/assets/images/event-legal-awareness.jpg';

export const EventDetailsView: React.FC<EventDetailsViewProps> = ({
  event: propEvent,
  eventId,
  onBack,
  onDonateClick,
  onRegister,
  isRegistered = false,
  showBack = true,
  className = '',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);

  const event = propEvent || (eventId ? eventsStore.getEventById(eventId) : null);
  const [coverFailed, setCoverFailed] = useState(false);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!event) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-[#FAF7F0]">
        <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
          <Calendar size={28} />
        </div>
        <h3 className="text-lg font-bold text-[#011F39]">Event Not Found</h3>
        <p className="text-sm text-slate-500 mt-1 mb-4">
          The requested event could not be loaded or may have been removed.
        </p>
        <button
          type="button"
          onClick={() => (onBack ? onBack() : navigate(-1))}
          className="px-4 py-2 bg-[#011F39] text-[#FAD465] text-xs font-bold rounded-xl cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Format date: e.g. "17 Nov 2026"
  const formatEventDate = (isoString?: string): string => {
    if (!isoString) return 'Date TBD';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const day = d.getDate();
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format time: e.g. "01:30 AM"
  const formatEventTime = (isoString?: string): string => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Format time range: e.g. "01:30 AM - 02:00 AM"
  const formatEventTimeRange = (startAt?: string, endAt?: string, allDay?: boolean): string => {
    if (allDay) return 'All Day';
    if (!startAt) return 'Time TBD';
    const start = formatEventTime(startAt);
    if (!endAt) return start;
    const end = formatEventTime(endAt);
    return `${start} - ${end}`;
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleDonateOpen = () => {
    if (onDonateClick) {
      onDonateClick(event);
    } else {
      setIsDonationModalOpen(true);
    }
  };

  const handleShareEvent = async () => {
    const formattedDate = formatEventDate(event.startAt);
    const location = event.location || event.address || 'HRSJM Headquarters';
    const organizer = event.organizer || 'HRSJM Mission';
    const shareTitle = event.title;
    const shareText = `Join "${shareTitle}" on ${formattedDate} at ${location}. Organized by ${organizer}.`;
    const shareUrl = window.location.href;

    try {
      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ title: shareTitle, text: shareText, url: shareUrl })) {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(`${shareTitle}\n${shareText}\n${shareUrl}`);
      setToastMessage('Event link copied to clipboard!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage('Link copied!');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const formattedDate = formatEventDate(event.startAt);
  const formattedTimeRange = formatEventTimeRange(
    event.startAt,
    event.endAt ?? undefined,
    event.allDay
  );
  const locationText = (event.location || event.address || 'HRSJM Mission').trim();
  const categoryLabel = (event.category || 'COMMUNITY').toUpperCase();
  const statusLabel =
    event.status === 'COMPLETED'
      ? 'Completed'
      : event.status === 'CANCELLED'
      ? 'Cancelled'
      : 'Upcoming';

  const isCompleted = event.status === 'COMPLETED';
  const isCancelled = event.status === 'CANCELLED';

  const statusDesc = isCompleted
    ? 'This event has finished. Thank you to everyone who participated.'
    : isCancelled
    ? 'This event was cancelled and is no longer open for registration.'
    : 'This event is scheduled and open for registration.';

  return (
    <div className={`w-full bg-[#FAF7F0] min-h-screen text-[#011F39] flex flex-col ${className}`}>
      {/* Top Header Bar (matches images 1, 2, 3) */}
      <header className="sticky top-0 z-30 bg-[#FAF7F0]/95 backdrop-blur-xs border-b border-slate-200/80 px-4 py-3 sm:py-3.5 select-none">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="p-1.5 -ml-1.5 rounded-full hover:bg-slate-200/60 active:scale-95 transition text-[#011F39] cursor-pointer"
              aria-label="Go Back"
            >
              <ArrowLeft size={20} strokeWidth={2.4} />
            </button>
          ) : (
            <div className="w-8" />
          )}

          <h1 className="text-base sm:text-lg font-bold text-[#011F39] tracking-tight">
            Event Details
          </h1>

          {/* Right placeholder to keep header title balanced and centered */}
          <div className="w-8" />
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 py-4 sm:py-5 space-y-5">
        {/* Event Cover Image (matches Image 2) */}
        <div className="w-full aspect-16/9 sm:h-64 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-200 shadow-2xs border border-slate-200/60">
          <img
            src={coverFailed || !event.coverImageUrl ? DEFAULT_COVER : event.coverImageUrl}
            alt={event.title}
            onError={() => setCoverFailed(true)}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title & Badges (matches Image 2) */}
        <div className="space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-[#011F39] tracking-tight leading-tight">
            {event.title}
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Pill (Green) */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase bg-[#ECFDF5] text-[#10B981]">
              {categoryLabel}
            </span>

            {/* Status Pill (Orange) */}
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#FFFBEB] text-[#D97706]">
              {statusLabel}
            </span>
          </div>
        </div>

        {/* Schedule & Location Card (matches Image 2) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3">
          {/* Date Row */}
          <div className="flex items-center gap-3 text-slate-800">
            <Calendar size={18} className="text-[#011F39] shrink-0" strokeWidth={2.2} />
            <span className="text-sm sm:text-base font-semibold">{formattedDate}</span>
          </div>

          {/* Time Row */}
          <div className="flex items-center gap-3 text-slate-800">
            <Clock size={18} className="text-[#011F39] shrink-0" strokeWidth={2.2} />
            <span className="text-sm sm:text-base font-semibold">{formattedTimeRange}</span>
          </div>

          {/* Location Row */}
          {locationText && (
            <div className="flex items-center gap-3 text-slate-800">
              <MapPin size={18} className="text-[#011F39] shrink-0" strokeWidth={2.2} />
              <span className="text-sm sm:text-base font-semibold truncate">{locationText}</span>
            </div>
          )}
        </div>

        {/* Description Section (matches Image 1 & 2) */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-[#011F39]">
            Description
          </h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
            {event.description || 'No description available for this event.'}
          </p>
        </div>

        {/* Additional Information Section (matches Image 1 & 3) */}
        <div className="space-y-2.5">
          <h3 className="text-base sm:text-lg font-bold text-[#011F39]">
            Additional Information
          </h3>

          <div className="space-y-2.5">
            {/* Organized By Card */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] flex items-center justify-center shrink-0">
                <Building2 size={20} className="text-slate-600" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold text-[#011F39]">Organized By</span>
                <span className="block text-xs sm:text-sm text-slate-500 truncate">
                  {event.organizer || 'HRSJM Mission'}
                </span>
              </div>
            </div>

            {/* Event Type Card */}
            <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] flex items-center justify-center shrink-0">
                <Tag size={20} className="text-amber-500" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <span className="block text-sm font-bold text-[#011F39]">Event Type</span>
                <span className="block text-xs sm:text-sm text-slate-500 truncate">
                  {event.category || 'Community'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section (matches Image 1 & 3) */}
        <div className="space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-[#011F39]">
            Status
          </h3>

          <div className="bg-[#FEF7EC] rounded-2xl p-4 border border-[#FDE68A]/60 flex items-start justify-between gap-3.5">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white border border-amber-100 flex items-center justify-center shrink-0 shadow-2xs">
                <Clock size={19} className="text-amber-600" strokeWidth={2.4} />
              </div>
              <div className="space-y-0.5">
                <span className="block text-sm sm:text-base font-bold text-[#D97706]">
                  {statusLabel}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-snug">
                  {statusDesc}
                </p>
              </div>
            </div>
            {onRegister && event.status === 'UPCOMING' && (
              <button
                type="button"
                onClick={() => onRegister(event)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                  isRegistered
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    : 'bg-[#011F39] text-[#FAD465] hover:bg-[#022b50]'
                }`}
              >
                {isRegistered ? 'Registered' : 'Register Free'}
              </button>
            )}
          </div>
        </div>

        {/* Support This Event Section (matches Image 3 — ONLY when isDonationEnabled is TRUE) */}
        {event.isDonationEnabled && (
          <div className="space-y-2 pt-1 animate-in fade-in duration-200">
            <h3 className="text-base sm:text-lg font-bold text-[#011F39]">
              Support This Event
            </h3>

            <div className="bg-[#FFFDF5] rounded-2xl p-4 sm:p-5 border border-[#FDE68A] shadow-xs space-y-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Heart size={20} className="text-amber-600 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <span className="block text-sm sm:text-base font-bold text-[#011F39]">
                    Voluntary Donations Accepted
                  </span>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {event.donationMessage ||
                      'Allow users to support this event with a voluntary donation.'}
                  </p>
                </div>
              </div>

              {/* In-Card Donate Now Button */}
              <button
                type="button"
                onClick={handleDonateOpen}
                className="w-full py-3 px-4 rounded-xl text-sm sm:text-base font-bold text-[#011F39] bg-[#FAD465] hover:bg-[#E9B82E] active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart size={16} className="fill-[#011F39] text-[#011F39]" />
                <span>Donate Now</span>
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions Row (matches Image 1 & 3) */}
        <div className="pt-2 pb-6">
          {event.isDonationEnabled ? (
            /* Image 3 Layout: Donate Now + Share Event side-by-side */
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDonateOpen}
                className="py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-[#011F39] bg-[#FAD465] hover:bg-[#E9B82E] active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Heart size={16} className="fill-[#011F39] text-[#011F39]" />
                <span>Donate Now</span>
              </button>

              <button
                type="button"
                onClick={handleShareEvent}
                className="py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold text-[#011F39] bg-white border border-[#011F39] hover:bg-slate-50 active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Link2 size={16} className="text-[#011F39]" />
                <span>Share Event</span>
              </button>
            </div>
          ) : (
            /* Image 1 Layout: Full-width Share Event button */
            <button
              type="button"
              onClick={handleShareEvent}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#011F39] bg-white border border-[#011F39] hover:bg-slate-50 active:scale-[0.99] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Link2 size={16} className="text-[#011F39]" />
              <span>Share Event</span>
            </button>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#011F39] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} className="text-[#FAD465]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Dedicated Voluntary Donation Modal */}
      <EventDonationModal
        event={event}
        isOpen={isDonationModalOpen}
        onClose={() => setIsDonationModalOpen(false)}
        defaultDonorName={user?.full_name || ''}
        defaultDonorEmail={user?.email || ''}
        defaultDonorMobile={user?.mobile_number || ''}
      />
    </div>
  );
};
