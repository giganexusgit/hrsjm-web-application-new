import type React from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import { eventsStore } from '@/features/admin/events/store/eventsStore';

export const UpcomingEventsCard: React.FC = () => {
  const snapshot = useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);
  const events = snapshot.events || [];

  useEffect(() => {
    eventsStore.fetchEvents();
  }, []);

  const upcomingEvents = events
    .filter((e) => e.status === 'UPCOMING' || !e.status)
    .slice(0, 3);

  const formatEventDate = (isoStr?: string) => {
    if (!isoStr) return { day: '--', month: '---' };
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return { day: '--', month: '---' };
      const day = d.getDate().toString().padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' });
      return { day, month };
    } catch {
      return { day: '--', month: '---' };
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <Calendar size={18} color="#C9971A" />
          </div>
          <div>
            <h4 style={styles.title}>Upcoming Events & Conclaves</h4>
            <p style={styles.subtitle}>Scheduled human rights drives & workshops</p>
          </div>
        </div>

        <Link to="/admin/events" style={styles.viewAllLink}>
          <span>All Events</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={styles.list}>
        {upcomingEvents.length === 0 ? (
          <div style={styles.emptyContainer}>
            <p style={styles.emptyText}>No upcoming events scheduled.</p>
            <Link to="/admin/events" style={styles.createEventLink}>
              View All Events
            </Link>
          </div>
        ) : (
          upcomingEvents.map((event) => {
            const { day, month } = formatEventDate(event.startAt);
            return (
              <div key={event.id} style={styles.eventItem}>
                {/* Calendar Date Badge */}
                <div style={styles.dateBadge}>
                  <span style={styles.dateDay}>{day}</span>
                  <span style={styles.dateMonth}>{month}</span>
                </div>

                {/* Event Info */}
                <div style={styles.eventInfo}>
                  <div style={styles.categoryBadge}>{event.category || 'EVENT'}</div>
                  <h5 style={styles.eventTitle}>{event.title}</h5>
                  <div style={styles.metaRow}>
                    <div style={styles.metaItem}>
                      <MapPin size={12} color="#718096" />
                      <span>{event.location || 'Online / Venue'}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Users size={12} color="#718096" />
                      <span>{event.registrations || 0} Registered</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 2px 8px -2px rgba(1, 31, 57, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#FFF9E6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#C9971A',
    textDecoration: 'none',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    flex: 1,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '28px 16px',
    textAlign: 'center',
    gap: '8px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px dashed #CBD5E1',
    flex: 1,
  },
  emptyText: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  createEventLink: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#174A78',
    textDecoration: 'none',
  },
  eventItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '12px',
    backgroundColor: '#FAF7F0',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
  },
  dateBadge: {
    width: '46px',
    height: '46px',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    lineHeight: 1,
  },
  dateDay: {
    fontSize: '16px',
    fontWeight: 800,
    color: '#FAD465',
  },
  dateMonth: {
    fontSize: '10px',
    fontWeight: 600,
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  eventInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    flex: 1,
  },
  categoryBadge: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#174A78',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  eventTitle: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#0B2F52',
    margin: 0,
    lineHeight: 1.3,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '11.5px',
    color: '#718096',
    marginTop: '4px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
};
