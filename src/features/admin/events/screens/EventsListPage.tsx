import type React from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Calendar, Plus, Sparkles } from 'lucide-react';
import { eventsStore } from '../store/eventsStore';
import { EventsStatsCards } from '../components/EventsStatsCards';
import { EventsFilterBar } from '../components/EventsFilterBar';
import { EventCard } from '../components/EventCard';
import { CreateEventModal } from '../components/CreateEventModal';
import type { EventStatusFilter, CreateEventFormState } from '../types/events.types';

export const EventsListPage: React.FC = () => {
  const navigate = useNavigate();
  const snapshot = useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);
  const events = snapshot.events;
  const stats = eventsStore.getStats();

  const [selectedStatus, setSelectedStatus] = useState<EventStatusFilter>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFormat, setSelectedFormat] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    eventsStore.fetchEvents().catch(() => {});
  }, []);

  // Filter events
  const filteredEvents = events.filter((e) => {
    // Status
    if (selectedStatus !== 'ALL' && e.status !== selectedStatus) {
      return false;
    }
    // Category
    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) {
      return false;
    }
    // Format
    if (selectedFormat !== 'ALL' && e.eventType !== selectedFormat) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = e.title.toLowerCase().includes(q);
      const inLoc = e.location.toLowerCase().includes(q);
      const inDesc = (e.description || '').toLowerCase().includes(q);
      if (!inTitle && !inLoc && !inDesc) {
        return false;
      }
    }
    return true;
  });

  const handleCreateSubmit = (form: CreateEventFormState) => {
    eventsStore.createEvent(form);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      eventsStore.deleteEvent(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Breadcrumb & Header */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="hover:text-[#011F39] font-medium transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-900 font-semibold">Events Management</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#011F39] border border-[#FDE68A] mb-2 tracking-wide uppercase">
              <Sparkles size={12} className="text-[#B45309]" />
              <span>Outreach & Community Conclaves</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#011F39]">
              Events & Conclaves
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Organize human rights conclaves, legal awareness workshops, and track delegate attendance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Create New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards (Balanced 4-column grid) */}
      <EventsStatsCards
        stats={stats}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
      />

      {/* Filter Bar */}
      <EventsFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedFormat={selectedFormat}
        onFormatChange={setSelectedFormat}
        totalFilteredCount={filteredEvents.length}
      />

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <Calendar size={28} className="text-slate-400" />
          </div>
          <h3 className="font-serif font-bold text-lg text-slate-800 mb-1">
            No Events Found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
            No events match your current filters. Try resetting search criteria or create a new event.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] transition-colors cursor-pointer shadow-xs"
          >
            <Plus size={15} strokeWidth={2.5} />
            <span>Create Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onPress={(id) => navigate(`/admin/events/${id}`)}
              onDelete={handleDeleteEvent}
            />
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />
    </div>
  );
};
