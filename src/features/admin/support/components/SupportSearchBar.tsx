import type React from 'react';
import { Search, Filter, Plus, X, RotateCcw } from 'lucide-react';
import { TICKET_CATEGORIES } from '../types/support.types';

interface SupportSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedSource: string;
  onSourceChange: (source: string) => void;
  activeFilterCount: number;
  onOpenFilterModal: () => void;
  onOpenCreateModal?: () => void;
  onResetFilters?: () => void;
}

export const SupportSearchBar: React.FC<SupportSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedSource,
  onSourceChange,
  activeFilterCount,
  onOpenFilterModal,
  onOpenCreateModal,
  onResetFilters,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== 'ALL' ||
    selectedSource !== 'ALL' ||
    activeFilterCount > 0;

  return (
    <div style={styles.container}>
      {/* Search Input Box */}
      <div style={styles.searchWrapper}>
        <Search size={17} color="#64748B" style={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by Ticket ID, subject, citizen name, phone or email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={styles.searchInput}
          className="support-search-input"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={styles.clearBtn}
            title="Clear search text"
            aria-label="Clear search text"
          >
            <X size={14} color="#64748B" />
          </button>
        )}
      </div>

      {/* Filter Selects & Controls Group */}
      <div style={styles.controlsGroup}>
        {/* Category Dropdown */}
        <div style={styles.selectWrapper}>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={styles.select}
            aria-label="Filter by grievance category"
          >
            <option value="ALL">All Categories</option>
            {TICKET_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Channel / Source Dropdown */}
        <div style={styles.selectWrapper}>
          <select
            value={selectedSource}
            onChange={(e) => onSourceChange(e.target.value)}
            style={styles.select}
            aria-label="Filter by ticket intake channel"
          >
            <option value="ALL">All Channels</option>
            <option value="website">🌐 Website Portal</option>
            <option value="app">📱 Mobile Application</option>
            <option value="web">💻 Admin / Internal Desk</option>
          </select>
        </div>

        {/* Advanced Filters Button */}
        <button
          type="button"
          onClick={onOpenFilterModal}
          style={{
            ...styles.filterBtn,
            borderColor: activeFilterCount > 0 ? '#011F39' : '#DCE4EC',
            backgroundColor: activeFilterCount > 0 ? '#EDF2F7' : '#FFFFFF',
          }}
          title="Open advanced filtering options"
        >
          <Filter size={15} color="#011F39" />
          <span style={styles.filterBtnText}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={styles.filterCountBadge}>{activeFilterCount}</span>
          )}
        </button>

        {/* Clear Filters Reset Button */}
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            style={styles.resetBtn}
            title="Reset all active search and filter constraints"
          >
            <RotateCcw size={13} color="#64748B" />
            <span>Reset</span>
          </button>
        )}

        {/* Quick New Ticket button (rendered if onOpenCreateModal is supplied and on desktop) */}
        {onOpenCreateModal && (
          <button
            type="button"
            onClick={onOpenCreateModal}
            style={styles.createBtn}
            title="Register new support grievance"
            className="support-create-btn-search"
          >
            <Plus size={16} color="#011F39" />
            <span>New Ticket</span>
          </button>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  searchWrapper: {
    position: 'relative',
    flex: '1 1 320px',
    display: 'flex',
    alignItems: 'center',
    minWidth: '260px',
  },
  searchIcon: {
    position: 'absolute',
    left: '14px',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: '42px',
    padding: '0 38px 0 40px',
    borderRadius: '10px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    fontSize: '13.5px',
    color: '#011F39',
    outline: 'none',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s ease',
  },
  clearBtn: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
  },
  controlsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    height: '42px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    fontSize: '13px',
    color: '#34516D',
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'border-color 0.2s ease',
  },
  filterBtn: {
    height: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '0 16px',
    borderRadius: '10px',
    border: '1px solid #DCE4EC',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '13px',
    color: '#011F39',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
  },
  filterBtnText: {
    fontSize: '13px',
  },
  filterCountBadge: {
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
    borderRadius: '10px',
    padding: '1px 6px',
    lineHeight: 1.2,
  },
  resetBtn: {
    height: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '0 12px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#F8FAFC',
    color: '#64748B',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  createBtn: {
    height: '42px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '0 18px',
    borderRadius: '10px',
    border: '1px solid #E9B82E',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontWeight: 700,
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.35)',
    transition: 'all 0.15s ease',
  },
};
