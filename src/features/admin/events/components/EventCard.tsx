import type React from 'react';
import { Clock, MapPin, Users, Globe, ExternalLink, Trash2, Calendar, HeartHandshake } from 'lucide-react';
import type { EventListItem } from '../types/events.types';

interface EventCardProps {
  event: EventListItem;
  onPress: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onPress, onDelete }) => {
  const formatDate = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatTime = (isoStr: string): string => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return '';
    }
  };

  const getStatusConfig = () => {
    switch (event.status) {
      case 'UPCOMING':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-800',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
          label: 'UPCOMING',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-800',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
          label: 'COMPLETED',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-800',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
          label: 'CANCELLED',
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-800',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
          label: 'DRAFT',
        };
    }
  };

  const statusCfg = getStatusConfig();
  const capacity = event.capacity || 200;
  const registrationPct = Math.min(100, Math.round((event.registrations / capacity) * 100));

  return (
    <div
      onClick={() => onPress(event.id)}
      className="group bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
      role="button"
      tabIndex={0}
    >
      {/* Cover Image Header */}
      <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100 shrink-0">
        {event.coverImageUrl ? (
          <img
            src={event.coverImageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-[#EDF2F7] flex flex-col items-center justify-center gap-1.5 text-[#011F39]">
            <Calendar size={32} className="text-[#011F39]/60" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              {event.category}
            </span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-2xs backdrop-blur-xs ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>

          {/* Right Tags */}
          <div className="flex items-center gap-1.5">
            {event.targetAudience &&
              event.targetAudience !== 'ALL' &&
              event.targetAudience !== 'Open to All' && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAD465] text-[#011F39] shadow-2xs">
                  {event.targetAudience === 'MEMBERS'
                    ? 'Members'
                    : event.targetAudience === 'SEEKERS'
                    ? 'Seekers'
                    : event.targetAudience}
                </span>
              )}

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#011F39]/90 text-white shadow-2xs">
              {event.category}
            </span>

            {event.isDonationEnabled && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF9E6] text-[#B45309] border border-[#FDE68A] shadow-2xs">
                <HeartHandshake size={11} className="text-[#D97706]" />
                <span>Donation</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-base sm:text-lg text-[#011F39] group-hover:text-[#B45309] transition-colors leading-snug line-clamp-1 mb-1.5">
          {event.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {event.shortInformation || event.description}
        </p>

        {/* Event Meta Details */}
        <div className="space-y-2 text-xs text-slate-600 mb-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-slate-400 shrink-0" />
            <span className="truncate">
              {formatDate(event.startAt)} · {formatTime(event.startAt)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {event.eventType === 'ONLINE' ? (
              <Globe size={13} className="text-slate-400 shrink-0" />
            ) : (
              <MapPin size={13} className="text-slate-400 shrink-0" />
            )}
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Users size={13} className="text-slate-400 shrink-0" />
              <span>
                <strong className="text-slate-900">{event.registrations}</strong> / {capacity}{' '}
                registered
              </span>
            </div>
            <span className="text-slate-400 font-semibold">{registrationPct}%</span>
          </div>

          {/* Registration Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                registrationPct >= 90
                  ? 'bg-rose-500'
                  : registrationPct >= 60
                  ? 'bg-amber-500'
                  : 'bg-[#011F39]'
              }`}
              style={{ width: `${registrationPct}%` }}
            />
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 mt-auto flex items-center justify-between gap-2">
          <span className="text-[11px] text-slate-500 truncate">
            By: <strong className="text-slate-700">{event.organizer || 'HRSJM Central'}</strong>
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(event.id);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                title="Delete event"
              >
                <Trash2 size={14} />
              </button>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPress(event.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#011F39] hover:bg-[#06294D] text-white shadow-2xs transition-colors"
            >
              <span>View Details</span>
              <ExternalLink size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
