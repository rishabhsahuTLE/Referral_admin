import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import './SortBy.css';

function SortBy({ onSortChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSort, setSelectedSort] = useState('date-newest');

  const sortOptions = [
    { value: 'date-newest', label: 'Date (Newest First)' },
    { value: 'date-oldest', label: 'Date (Oldest First)' },
    { value: 'amount-high', label: 'Amount (High to Low)' },
    { value: 'amount-low', label: 'Amount (Low to High)' },
    { value: 'name-asc', label: 'Student Name (A-Z)' },
    { value: 'name-desc', label: 'Student Name (Z-A)' },
    { value: 'status', label: 'Status' },
  ];

  const handleSortSelect = (value) => {
    setSelectedSort(value);
    onSortChange(value);
    setShowDropdown(false);
  };

  const getSelectedLabel = () => {
    const selected = sortOptions.find((opt) => opt.value === selectedSort);
    return selected ? selected.label : 'Sort By';
  };

  return (
    <div className="sort-by">
      <div className="sort-wrapper">
        <button
          className="sort-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>Sort By: {getSelectedLabel()}</span>
          <FiChevronDown size={16} />
        </button>

        {showDropdown && (
          <div className="sort-dropdown">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                className={`sort-option ${selectedSort === option.value ? 'active' : ''}`}
                onClick={() => handleSortSelect(option.value)}
              >
                <span className="radio-circle">
                  {selectedSort === option.value && <span className="radio-dot"></span>}
                </span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SortBy;
