import React, { useState, useRef, useEffect } from 'react';
import { FiCalendar, FiChevronDown, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './DateRangeFilter.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function buildCalendarGrid(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const cells = [];

  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  return cells;
}

function formatDate(d) {
  if (!d) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DateRangeFilter({ onDateRangeChange }) {
  const today = new Date();
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRange, setSelectedRange] = useState('last-month');

  // Calendar state
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Range selection state
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  // pickingSecond = true while we're waiting for the user's second click
  const [pickingSecond, setPickingSecond] = useState(false);

  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
        // If user abandons mid-selection, reset
        if (pickingSecond) {
          setPickingSecond(false);
          setRangeStart(null);
          setHoverDate(null);
        }
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [pickingSecond]);

  // ── Preset helpers ──────────────────────────────
  const getPresetRange = (range) => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    switch (range) {
      case 'last-month':
        return {
          label: 'Last Month',
          startDate: new Date(t.getFullYear(), t.getMonth() - 1, t.getDate()),
          endDate: t,
        };
      case 'last-3-months':
        return {
          label: 'Last 3 Months',
          startDate: new Date(t.getFullYear(), t.getMonth() - 3, t.getDate()),
          endDate: t,
        };
      case 'last-6-months':
        return {
          label: 'Last 6 Months',
          startDate: new Date(t.getFullYear(), t.getMonth() - 6, t.getDate()),
          endDate: t,
        };
      case 'last-year':
        return {
          label: 'Last Year',
          startDate: new Date(t.getFullYear() - 1, t.getMonth(), t.getDate()),
          endDate: t,
        };
      default:
        return { label: 'Select Range', startDate: null, endDate: null };
    }
  };

  const handlePreset = (range) => {
    setSelectedRange(range);
    const { startDate, endDate } = getPresetRange(range);
    onDateRangeChange({ startDate, endDate });
    // reset any pending custom selection
    setRangeStart(null);
    setRangeEnd(null);
    setPickingSecond(false);
    setHoverDate(null);
    setShowDropdown(false);
  };

  // ── Calendar navigation ─────────────────────────
  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  // ── Calendar click ──────────────────────────────
  const handleDayClick = (date) => {
    if (!date) return;
    const d = startOfDay(date);

    if (!pickingSecond) {
      // First click — anchor the start
      setRangeStart(d);
      setRangeEnd(null);
      setPickingSecond(true);
      setHoverDate(d);
    } else {
      // Second click — finalise the range
      const start = rangeStart < d ? rangeStart : d;
      const end   = rangeStart < d ? d : rangeStart;
      setRangeStart(start);
      setRangeEnd(end);
      setPickingSecond(false);
      setHoverDate(null);
      setSelectedRange('custom');
      onDateRangeChange({ startDate: start, endDate: end });
      setShowDropdown(false);
    }
  };

  const handleDayHover = (date) => {
    if (pickingSecond && date) setHoverDate(startOfDay(date));
  };

  // ── Day cell class logic ────────────────────────
  const getDayClass = (date) => {
    if (!date) return 'cal-cell empty';

    const d = startOfDay(date);
    const effectiveEnd = pickingSecond && hoverDate ? hoverDate : rangeEnd;
    const lo = rangeStart && effectiveEnd ? (rangeStart < effectiveEnd ? rangeStart : effectiveEnd) : null;
    const hi = rangeStart && effectiveEnd ? (rangeStart < effectiveEnd ? effectiveEnd : rangeStart) : null;

    let cls = 'cal-cell';

    if (isSameDay(d, rangeStart) || isSameDay(d, effectiveEnd)) {
      cls += ' selected';
      if (lo && hi) {
        if (isSameDay(d, lo)) cls += ' range-start';
        if (isSameDay(d, hi)) cls += ' range-end';
      }
    } else if (lo && hi && d > lo && d < hi) {
      cls += ' in-range';
    }

    if (isSameDay(d, today)) cls += ' today';

    return cls;
  };

  // ── Display label ───────────────────────────────
  const formatDisplay = () => {
    if (selectedRange === 'custom' && rangeStart && rangeEnd) {
      return `${formatDate(rangeStart)} – ${formatDate(rangeEnd)}`;
    }
    return getPresetRange(selectedRange).label;
  };

  const cells = buildCalendarGrid(calYear, calMonth);

  return (
    <div className="date-range-filter" ref={wrapperRef}>
      <div className="filter-button-wrapper">
        <button
          className="date-range-button"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <FiCalendar size={16} />
          <span>{formatDisplay()}</span>
          <FiChevronDown size={16} />
        </button>

        {showDropdown && (
          <div className="date-dropdown">
            {/* Presets */}
            <div className="preset-ranges">
              <h4>Quick Select</h4>
              {['last-month', 'last-3-months', 'last-6-months', 'last-year'].map((r) => (
                <button
                  key={r}
                  className={`preset-btn ${selectedRange === r ? 'active' : ''}`}
                  onClick={() => handlePreset(r)}
                >
                  {getPresetRange(r).label}
                </button>
              ))}
            </div>

            <div className="divider" />

            {/* Calendar */}
            <div className="custom-date-section">
              <h4>
                Custom Range
                {pickingSecond && (
                  <span className="pick-hint"> — click end date</span>
                )}
                {!pickingSecond && rangeStart && rangeEnd && (
                  <span className="pick-hint"> — click to change</span>
                )}
              </h4>

              <div className="calendar">
                {/* Month header */}
                <div className="cal-header">
                  <button className="cal-nav" onClick={prevMonth}>
                    <FiChevronLeft size={16} />
                  </button>
                  <span className="cal-month-label">
                    {MONTHS[calMonth]} {calYear}
                  </span>
                  <button className="cal-nav" onClick={nextMonth}>
                    <FiChevronRight size={16} />
                  </button>
                </div>

                {/* Day-of-week headers */}
                <div className="cal-grid">
                  {DAYS.map((d) => (
                    <div key={d} className="cal-dow">{d}</div>
                  ))}

                  {/* Day cells */}
                  {cells.map((date, i) => (
                    <div
                      key={i}
                      className={getDayClass(date)}
                      onClick={() => handleDayClick(date)}
                      onMouseEnter={() => handleDayHover(date)}
                      onMouseLeave={() => pickingSecond && setHoverDate(null)}
                    >
                      {date ? date.getDate() : ''}
                    </div>
                  ))}
                </div>

                {/* Selected range label */}
                {rangeStart && (
                  <div className="cal-range-label">
                    {formatDate(rangeStart)}
                    {' '}—{' '}
                    {pickingSecond
                      ? (hoverDate ? formatDate(hoverDate) : '…')
                      : (rangeEnd ? formatDate(rangeEnd) : '…')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DateRangeFilter;
