import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface UsersSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilterClick: () => void;
  activeFilterCount?: number;
}

export const UsersSearchBar: React.FC<UsersSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeFilterCount = 0,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '8px',
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {/* Search Input Box */}
      <div
        style={{
          flex: '1 1 240px',
          minWidth: 0,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Search
          size={18}
          color="#718096"
          style={{
            position: 'absolute',
            left: '14px',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search by name, email, phone, member ID, application no..."
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '11px 40px 11px 42px',
            fontSize: '14px',
            borderRadius: '10px',
            border: '1px solid #DBE5EE',
            backgroundColor: '#FFFFFF',
            color: '#011F39',
            outline: 'none',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#718096',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onFilterClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '11px 18px',
          borderRadius: '10px',
          border: activeFilterCount > 0 ? '1px solid #011F39' : '1px solid #DBE5EE',
          backgroundColor: activeFilterCount > 0 ? '#FAF7F0' : '#FFFFFF',
          color: '#011F39',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
        }}
      >
        <SlidersHorizontal size={17} color="#011F39" />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#011F39',
              color: '#FAD465',
              fontSize: '11px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
};

