import React, { useState } from "react";
import { Search, Save, X, Info, ArrowUpDown, ChevronDown, ChevronRight, Plus } from "lucide-react";
import {
  getConfigs, getActiveConfig, isOpenEnded, parseDisplayDate, formatDisplayDateTime, formatConfigDate,
  formatTimeOnly, toIsoDate, fromIsoDate, addDays, addMinutes, startOfToday, endOfDay, isMidnight,
  coversToday, isFuture, minStartOnDate
} from "../utils/rewardConfigs";
import {
  FEE_HEAD_OPTIONS, PAYMENT_TYPES, getPaymentTypes, getFeeStructure, computeFirstPayments
} from "../utils/feeStructure";
import ConfigActionModal from "./ConfigActionModal";

const COLUMN_COUNT = 13;

// Column widths for the fixed table layout: the table always fits its container (no
// horizontal scroll) and columns don't reflow when the inline "New configuration"
// inputs appear inside a course's dropdown. The three First Payment columns show, per
// payment type, the referee discount and what's left payable on that first payment.
const COL = {
  course: { width: '10.5%' },
  type: { width: '5%' },
  cost: { width: '7%' },
  referrer: { width: '7%' },
  paymentType: { width: '7.5%' },
  feeHead: { width: '7.5%' },
  referee: { width: '6.5%' },
  firstPayment: { width: '8.5%' },
  dateFrom: { width: '8%' },
  dateTo: { width: '9.5%' },
  modified: { width: '6.5%' },
};

// Default Effective From for a new configuration: the instant right after the last one
// ends (same calendar day if it ended mid-day, e.g. a same-day Stop — the next day at
// midnight if it ran through end-of-day), or — when the last one is open-ended —
// tomorrow (but never on/before that config's own start). Only a date is actually used
// from this (the exact minute is re-derived from whichever date ends up picked, via
// minStartOnDate), so this just seeds a sensible starting suggestion.
function getDefaultFrom(configs) {
  const last = configs[configs.length - 1];
  if (!isOpenEnded(last.effectiveTo)) return addMinutes(parseDisplayDate(last.effectiveTo), 1);
  const tomorrow = addDays(startOfToday(), 1);
  const afterLastStart = addDays(parseDisplayDate(last.effectiveFrom) ?? startOfToday(), 1);
  return tomorrow > afterLastStart ? tomorrow : afterLastStart;
}

export default function ReferralPolicy({ data, onAddConfig, onStopConfig, onRemoveConfig }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState(() => new Set());
  const [confirmAction, setConfirmAction] = useState(null); // { mode: 'stop' | 'remove', course, config }

  // Sorting state
  const [sortField, setSortField] = useState("none"); // none, cost, effectiveFrom
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // "Add configuration" form state — only one course's form is open at a time
  const [addingFor, setAddingFor] = useState(null);
  const [newReferrer, setNewReferrer] = useState("");
  const [newReferee, setNewReferee] = useState("");
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newFeeHead, setNewFeeHead] = useState(FEE_HEAD_OPTIONS[0]);
  const [newPaymentTypes, setNewPaymentTypes] = useState([]);
  const [addError, setAddError] = useState("");

  // Courses whose semester-wise fee structure panel is open
  const [feeStructureOpen, setFeeStructureOpen] = useState(() => new Set());

  const { programs } = data;

  // Filter programs based on search term
  const filteredPrograms = programs.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting function
  const sortedPrograms = [...filteredPrograms].sort((a, b) => {
    if (sortField === "none") return 0;

    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === "effectiveFrom") {
      valA = parseDisplayDate(valA)?.getTime() || 0;
      valB = parseDisplayDate(valB)?.getTime() || 0;
    } else {
      valA = parseFloat(valA) || 0;
      valB = parseFloat(valB) || 0;
    }

    if (sortOrder === "asc") {
      return valA - valB;
    } else {
      return valB - valA;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const toggleFeeStructure = (name) => {
    setFeeStructureOpen(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const togglePaymentType = (key) => {
    setNewPaymentTypes(prev => prev.includes(key) ? prev.filter(k => k !== key) : PAYMENT_TYPES.map(p => p.key).filter(k => k === key || prev.includes(k)));
    setAddError("");
  };

  const toggleExpanded = (name) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name); else next.add(name);
      return next;
    });
  };

  const startAdd = (prog) => {
    const configs = getConfigs(prog);
    const active = getActiveConfig(configs);
    setAddingFor(prog.name);
    setExpandedCourses(prev => new Set(prev).add(prog.name));
    setNewReferrer("");
    setNewReferee("");
    setNewFrom(toIsoDate(getDefaultFrom(configs)));
    setNewTo("");
    setNewFeeHead(active.feeHead && FEE_HEAD_OPTIONS.includes(active.feeHead) ? active.feeHead : FEE_HEAD_OPTIONS[0]);
    setNewPaymentTypes(getPaymentTypes(active));
    setAddError("");
  };

  const cancelAdd = () => {
    setAddingFor(null);
    setAddError("");
  };

  const saveAdd = (prog) => {
    if (newReferrer === "" || newReferee === "" || !newFrom || !newTo) {
      setAddError("All fields are required.");
      return;
    }
    if (newPaymentTypes.length === 0) {
      setAddError("Select at least one payment type.");
      return;
    }
    const configs = getConfigs(prog);
    // Effective From defaults to midnight on the picked date, except when that would
    // overlap an existing configuration ending later the same day (e.g. right after a
    // same-day Stop) — then it's the minute right after that configuration ends.
    // Effective To always runs through end-of-day on the picked date.
    const from = minStartOnDate(fromIsoDate(newFrom), configs);
    const to = endOfDay(fromIsoDate(newTo));
    if (to < from) {
      setAddError("Effective To must be on or after Effective From.");
      return;
    }

    // Reject any overlap. The open-ended latest config gets closed the day before `from`,
    // so it only conflicts when the new config starts on or before its own start date.
    const clash = configs.find((c, i) => {
      const cFrom = parseDisplayDate(c.effectiveFrom);
      if (!cFrom) return false;
      if (isOpenEnded(c.effectiveTo)) {
        return i === configs.length - 1 ? from <= cFrom : to >= cFrom;
      }
      const cTo = parseDisplayDate(c.effectiveTo);
      return from <= cTo && to >= cFrom;
    });
    if (clash) {
      setAddError(`Overlaps ${formatConfigDate(clash.effectiveFrom)} – ${isOpenEnded(clash.effectiveTo) ? "open" : formatConfigDate(clash.effectiveTo)}.`);
      return;
    }

    onAddConfig(prog.name, {
      cost: getActiveConfig(configs).cost, // course cost comes from UMS, not editable here
      referrerIncentive: parseFloat(newReferrer) || 0,
      refereeDiscount: parseFloat(newReferee) || 0, // saved as % of the fee head
      effectiveFrom: formatDisplayDateTime(from),
      effectiveTo: formatDisplayDateTime(to),
      feeHead: newFeeHead,
      paymentTypes: newPaymentTypes,
    });
    setAddingFor(null);
    setAddError("");
  };

  const handleHeaderClick = (field) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIndicator = (field) => {
    if (sortField !== field) return <ArrowUpDown size={12} style={{ opacity: 0.4, marginLeft: '6px' }} />;
    return sortOrder === "asc" ? " ▲" : " ▼";
  };

  // One First Payment cell: the referee discount on that payment type's first payment
  // (₹0 when the type isn't enabled) and what remains payable after it.
  const renderFirstPaymentCell = (fp, typeLabel, feeHead, pct) => (
    <td key={typeLabel}>
      <div
        className={`first-payment-cell${fp.selected ? '' : ' not-selected'}`}
        title={fp.selected
          ? `${typeLabel} first payment ${formatCurrency(fp.gross)}\n${feeHead} in it: ${formatCurrency(fp.feeHeadAmount)} × ${pct}% = ${formatCurrency(fp.discount)} discount\nPayable: ${formatCurrency(fp.payable)}`
          : `${typeLabel} isn't enabled on this configuration — no discount.\nPayable: ${formatCurrency(fp.payable)}`}
      >
        <span className="fp-discount">{fp.discount > 0 ? `− ${formatCurrency(fp.discount)}` : formatCurrency(0)}</span>
        <span className="fp-payable">{formatCurrency(fp.payable)}</span>
      </div>
    </td>
  );

  const renderFirstPaymentCells = (prog, c) => {
    const fps = computeFirstPayments(prog, c);
    return PAYMENT_TYPES.map(({ key, firstPayment }) =>
      renderFirstPaymentCell(fps[key], firstPayment, c.feeHead ?? FEE_HEAD_OPTIONS[0], parseFloat(c.refereeDiscount) || 0)
    );
  };

  const renderPaymentTypeChips = (types) => (
    <div className="payment-type-chips">
      {PAYMENT_TYPES.filter(p => types.includes(p.key)).map(p => (
        <span key={p.key} className="payment-type-chip">{p.label}</span>
      ))}
    </div>
  );

  // Read-only cells for one configuration (cost → config added)
  const renderConfigCells = (prog, c) => (
    <>
      <td>{formatCurrency(c.cost)}</td>
      <td>{formatCurrency(c.referrerIncentive)}</td>
      <td>{renderPaymentTypeChips(getPaymentTypes(c))}</td>
      <td>{c.feeHead ?? "-"}</td>
      <td>{`${c.refereeDiscount}%`}</td>
      {renderFirstPaymentCells(prog, c)}
      <td>{formatConfigDate(c.effectiveFrom)}</td>
      <td className="effective-to-cell">
        {formatConfigDate(c.effectiveTo)}
        {c.cancelled && <span className="config-cancelled-tag">(Config Cancelled)</span>}
      </td>
      <td style={{ color: 'var(--text-muted)' }}>
        {c.lastModifiedBy ?? "-"}
        <span style={{ display: 'block', fontSize: '10px' }}>{c.lastModifiedOn ?? ""}</span>
      </td>
    </>
  );

  // Semester × fee head breakdown for a course at a given cost
  const renderFeeStructure = (prog, cost) => {
    const structure = getFeeStructure(prog, cost);
    const headTotals = FEE_HEAD_OPTIONS.map(fh => structure.reduce((a, s) => a + (s.heads[fh] ?? 0), 0));
    return (
      <table className="fee-structure-table">
        <thead>
          <tr>
            <th>Fee Head</th>
            {structure.map(s => <th key={s.semester}>Sem {s.semester}</th>)}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {FEE_HEAD_OPTIONS.map((fh, i) => (
            <tr key={fh}>
              <td>{fh}</td>
              {structure.map(s => <td key={s.semester}>{formatCurrency(s.heads[fh] ?? 0)}</td>)}
              <td>{formatCurrency(headTotals[i])}</td>
            </tr>
          ))}
          <tr className="fee-structure-total">
            <td>Semester Total</td>
            {structure.map(s => <td key={s.semester}>{formatCurrency(s.total)}</td>)}
            <td>{formatCurrency(structure.reduce((a, s) => a + s.total, 0))}</td>
          </tr>
        </tbody>
      </table>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Information Banner */}
      <div className="policy-banner">
        <Info className="policy-icon" size={18} />
        <div>
          <strong>Reward Settings Control.</strong> Expand a course to see all of its reward configurations, and use + to add a new dated configuration (date ranges cannot overlap). The referee discount is a % of the selected fee head and is applied only to the referee's first payment — Semester 1 (Sem-wise), Year 1 (Yearly) or the full course fee (Lumpsum); payment types not enabled get ₹0. Click column headers or use the sort dropdown to organize records by cost or effective dates.
        </div>
      </div>

      {/* Top Configuration Stats Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">REWARD TRIGGER</div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>100% first-term fee payment (BR-4)</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">MAX ACTIVE REFERRALS</div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>10 [New + In Progress combined]</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">REWARD PAYOUT WINDOW</div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>30 days after enrollment confirmation</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-label">ELIGIBLE STUDENT</div>
          <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '4px' }}>Enrolled students only (BR-1)</div>
        </div>
      </div>

      {/* Search, Sort and Table section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
            Reward Master — by Course
          </h2>

          {/* Search bar & Sort Dropdown */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar-container" style={{ marginBottom: 0 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                className="search-input"
                style={{ paddingRight: '32px', minWidth: '180px', cursor: 'pointer', backgroundColor: '#ffffff' }}
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field);
                  setSortOrder(order);
                }}
              >
                <option value="none-asc">Sort: Default</option>
                <option value="cost-asc">Cost: Lowest First</option>
                <option value="cost-desc">Cost: Highest First</option>
                <option value="effectiveFrom-asc">Effective Date: Lowest First</option>
                <option value="effectiveFrom-desc">Effective Date: Highest First</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table reward-master-table">
            <thead>
              <tr>
                <th rowSpan={2} style={COL.course}>Course</th>
                <th rowSpan={2} style={COL.type}>Type</th>

                {/* Clickable sort headers */}
                <th rowSpan={2} onClick={() => handleHeaderClick("cost")} style={{ ...COL.cost, cursor: 'pointer', userSelect: 'none' }}>
                  Course Cost {renderSortIndicator("cost")}
                </th>
                <th rowSpan={2} style={COL.referrer}>Referrer Incentive (₹)</th>
                <th rowSpan={2} style={COL.paymentType}>Payment Type</th>
                <th rowSpan={2} style={COL.feeHead}>Discount Fee Head</th>
                <th rowSpan={2} style={COL.referee}>Discount % (of fee head)</th>
                <th colSpan={3} className="first-payment-group-header">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    First Payment — Discount / Payable
                    <span title="The referee discount applies only to the first payment. Top: discount (₹0 if the payment type isn't enabled). Bottom: amount payable after the discount.">
                      <Info size={12} style={{ opacity: 0.6, cursor: 'help' }} />
                    </span>
                  </span>
                </th>
                <th rowSpan={2} onClick={() => handleHeaderClick("effectiveFrom")} style={{ ...COL.dateFrom, cursor: 'pointer', userSelect: 'none' }}>
                  Effective From {renderSortIndicator("effectiveFrom")}
                </th>
                <th rowSpan={2} style={COL.dateTo}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    Effective To
                    <span title="All referral activity — from the initial referral to the referee's enrollment — must be completed within this date.">
                      <Info size={12} style={{ opacity: 0.6, cursor: 'help' }} />
                    </span>
                  </span>
                </th>
                <th rowSpan={2} style={COL.modified}>Config Added</th>
              </tr>
              <tr>
                {PAYMENT_TYPES.map(p => (
                  <th key={p.key} style={COL.firstPayment} className="first-payment-sub-header">{p.firstPayment}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedPrograms.map((prog) => {
                const configs = getConfigs(prog);
                const active = getActiveConfig(configs);
                const isExpanded = expandedCourses.has(prog.name);
                const isAdding = addingFor === prog.name;
                const lastConfig = configs[configs.length - 1];
                // The actual Effective From instant the current date picker value would
                // save with — computed live so the hint can explain a same-day start time.
                const candidateFrom = isAdding && newFrom ? minStartOnDate(fromIsoDate(newFrom), configs) : null;

                return (
                  <React.Fragment key={prog.name}>
                    <tr className="course-row" onClick={() => toggleExpanded(prog.name)}>
                      <td style={{ fontWeight: '600' }}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          title={isExpanded ? "Hide configurations" : "Show all configurations"}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none',
                            border: 'none', padding: 0, cursor: 'pointer', font: 'inherit', color: 'inherit', textAlign: 'left'
                          }}
                        >
                          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          <span>
                            {prog.name}
                            <span style={{ display: 'block', fontSize: '10px', fontWeight: '500', color: 'var(--text-muted)' }}>
                              {configs.length} configuration{configs.length === 1 ? "" : "s"}
                            </span>
                          </span>
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${prog.type === 'UG' ? 'badge-applicant' : 'badge-enrolled'}`}>
                          {prog.type}
                        </span>
                      </td>
                      {renderConfigCells(prog, active)}
                    </tr>

                    {isExpanded && configs.map((c, i) => {
                      const isActive = c === active && coversToday(c) && !c.cancelled;
                      const isPending = isFuture(c);
                      return (
                        <tr
                          key={`${prog.name}-cfg-${i}`}
                          className={`config-subrow${isActive ? ' active' : ''}`}
                        >
                          <td className="config-subrow-label">
                            Config {i + 1}
                            {isActive && (
                              <span className="badge badge-clear" style={{ marginLeft: '6px', fontSize: '9px', padding: '1px 6px' }}>Active</span>
                            )}
                          </td>
                          <td>
                            {isActive && !isAdding && (
                              <button
                                type="button"
                                className="config-row-action-btn"
                                title="Stop this configuration"
                                aria-label="Stop this configuration"
                                onClick={() => setConfirmAction({ mode: 'stop', course: prog, config: c })}
                              >
                                STOP
                              </button>
                            )}
                            {isPending && !isAdding && (
                              <button
                                type="button"
                                className="config-row-action-btn"
                                title="Remove this configuration — it hasn't started yet"
                                aria-label="Remove this configuration"
                                onClick={() => setConfirmAction({ mode: 'remove', course: prog, config: c })}
                              >
                                REMOVE
                              </button>
                            )}
                          </td>
                          {renderConfigCells(prog, c)}
                        </tr>
                      );
                    })}

                    {isExpanded && feeStructureOpen.has(prog.name) && (
                      <tr className="config-subrow config-subrow-fee-structure">
                        <td colSpan={COLUMN_COUNT}>
                          <div className="fee-structure-title">
                            Semester-wise fee structure — {prog.name} ({formatCurrency(active.cost)}, from UMS)
                          </div>
                          {renderFeeStructure(prog, active.cost)}
                        </td>
                      </tr>
                    )}

                    {isExpanded && !isAdding && (
                      <tr className="config-subrow config-subrow-footer">
                        <td colSpan={COLUMN_COUNT}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button type="button" className="config-btn" onClick={() => toggleFeeStructure(prog.name)}>
                              {feeStructureOpen.has(prog.name) ? "Hide Fee Structure" : "View Fee Structure"}
                            </button>
                            <button type="button" className="config-btn config-btn-primary" onClick={() => startAdd(prog)}>
                              <Plus size={12} /> Add New Configuration
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}

                    {isExpanded && isAdding && (
                      <tr className="config-subrow config-subrow-form">
                        <td className="config-subrow-label">New configuration</td>
                        <td></td>
                        <td>
                          <div className="config-form-field">
                            <span title="Course cost is fetched from UMS and can't be edited here.">
                              {formatCurrency(active.cost)}
                            </span>
                            <span className="config-form-hint"></span>
                          </div>
                        </td>
                        <td>
                          <div className="config-form-field">
                            <input
                              type="number"
                              min="0"
                              className="inline-edit-input"
                              placeholder="e.g. 5000"
                              value={newReferrer}
                              onChange={(e) => setNewReferrer(e.target.value)}
                              style={{ width: '100%' }}
                            />
                            <span className="config-form-hint"></span>
                          </div>
                        </td>
                        <td>
                          <div className="config-form-field">
                            <div className="payment-type-options">
                              {PAYMENT_TYPES.map(p => (
                                <label key={p.key} className="payment-type-option">
                                  <input
                                    type="checkbox"
                                    checked={newPaymentTypes.includes(p.key)}
                                    onChange={() => togglePaymentType(p.key)}
                                  />
                                  {p.label}
                                </label>
                              ))}
                            </div>
                            <span className="config-form-hint"></span>
                          </div>
                        </td>
                        <td>
                          <div className="config-form-field">
                            <select
                              className="inline-edit-input"
                              value={newFeeHead}
                              onChange={(e) => setNewFeeHead(e.target.value)}
                              style={{ width: '100%', cursor: 'pointer' }}
                            >
                              {FEE_HEAD_OPTIONS.map(fh => <option key={fh} value={fh}>{fh}</option>)}
                            </select>
                            <span className="config-form-hint"></span>
                          </div>
                        </td>
                        <td>
                          <div className="config-form-field">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                className="inline-edit-input"
                                placeholder="e.g. 10"
                                value={newReferee}
                                onChange={(e) => setNewReferee(e.target.value)}
                                style={{ width: '100%', minWidth: 0 }}
                              />
                              <span style={{ fontSize: '11px', fontWeight: '600' }}>%</span>
                            </div>
                            <span className="config-form-hint">of {newFeeHead}</span>
                          </div>
                        </td>
                        {renderFirstPaymentCells(prog, {
                          cost: active.cost,
                          refereeDiscount: parseFloat(newReferee) || 0,
                          feeHead: newFeeHead,
                          paymentTypes: newPaymentTypes,
                        })}
                        <td>
                          <div className="config-form-field">
                            <input
                              type="date"
                              className="inline-edit-input"
                              value={newFrom}
                              onChange={(e) => { setNewFrom(e.target.value); setAddError(""); }}
                              style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <span className={`config-form-hint${addError ? ' error' : ''}`}>
                              {addError || (isOpenEnded(lastConfig.effectiveTo)
                                ? (newFrom ? `Current config will end on ${formatConfigDate(endOfDay(addDays(fromIsoDate(newFrom), -1)))}` : "Pick a start date")
                                : (candidateFrom && !isMidnight(candidateFrom)
                                    ? `Starts at ${formatTimeOnly(candidateFrom)} — right after the previous configuration ends`
                                    : `Last config ends ${formatConfigDate(lastConfig.effectiveTo)}`))}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="config-form-field">
                            <input
                              type="date"
                              className="inline-edit-input"
                              value={newTo}
                              min={newFrom || undefined}
                              onChange={(e) => { setNewTo(e.target.value); setAddError(""); }}
                              style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <span className="config-form-hint"></span>
                          </div>
                        </td>
                        <td></td>
                      </tr>
                    )}

                    {isExpanded && isAdding && (
                      <tr className="config-subrow config-subrow-form config-subrow-footer">
                        <td colSpan={COLUMN_COUNT}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button type="button" className="config-btn" onClick={cancelAdd}>
                              <X size={12} /> Cancel
                            </button>
                            <button type="button" className="config-btn config-btn-primary" onClick={() => saveAdd(prog)}>
                              <Save size={12} /> Save
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {sortedPrograms.length === 0 && (
                <tr>
                  <td colSpan={COLUMN_COUNT} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                    No policy configurations found matching "{searchTerm}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfigActionModal
        action={confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction.mode === 'stop') {
            onStopConfig(confirmAction.course.name);
          } else {
            onRemoveConfig(confirmAction.course.name, confirmAction.config.effectiveFrom);
          }
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
