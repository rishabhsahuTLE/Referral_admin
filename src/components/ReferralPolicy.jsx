import React, { useState } from "react";
import { Search, Save, X, Info, ArrowUpDown, ChevronDown, ChevronRight, Plus } from "lucide-react";
import {
  getConfigs, getActiveConfig, isOpenEnded, parseDisplayDate, formatDisplayDate,
  toIsoDate, fromIsoDate, addDays, startOfToday
} from "../utils/rewardConfigs";

const FEE_HEAD_OPTIONS = ["Tuition Fees", "Examination Fees", "Registration Fee"];
const COLUMN_COUNT = 10;

// Column widths for the fixed table layout: the table always fits its container (no
// horizontal scroll) and columns don't reflow when the inline "New configuration"
// inputs appear inside a course's dropdown.
const COL = {
  course: { width: '15%' },
  type: { width: '6%' },
  cost: { width: '9%' },
  referrer: { width: '10%' },
  referee: { width: '11%' },
  date: { width: '12%' },
  feeHead: { width: '10%' },
  modified: { width: '7.5%' },
};

// Default Effective From for a new configuration: the day after the last one ends, or —
// when the last one is open-ended — tomorrow (but never on/before that config's own start).
function getDefaultFrom(configs) {
  const last = configs[configs.length - 1];
  if (!isOpenEnded(last.effectiveTo)) return addDays(parseDisplayDate(last.effectiveTo), 1);
  const tomorrow = addDays(startOfToday(), 1);
  const afterLastStart = addDays(parseDisplayDate(last.effectiveFrom) ?? startOfToday(), 1);
  return tomorrow > afterLastStart ? tomorrow : afterLastStart;
}

export default function ReferralPolicy({ data, onAddConfig }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState(() => new Set());

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
  const [addError, setAddError] = useState("");

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
    const from = fromIsoDate(newFrom);
    const to = fromIsoDate(newTo);
    if (to < from) {
      setAddError("Effective To must be on or after Effective From.");
      return;
    }

    // Reject any overlap. The open-ended latest config gets closed the day before `from`,
    // so it only conflicts when the new config starts on or before its own start date.
    const configs = getConfigs(prog);
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
      setAddError(`Overlaps ${clash.effectiveFrom} – ${isOpenEnded(clash.effectiveTo) ? "open" : clash.effectiveTo}.`);
      return;
    }

    onAddConfig(prog.name, {
      cost: getActiveConfig(configs).cost, // course cost comes from UMS, not editable here
      referrerIncentive: parseFloat(newReferrer) || 0,
      refereeDiscount: parseFloat(newReferee) || 0, // saved as percentage
      effectiveFrom: formatDisplayDate(from),
      effectiveTo: formatDisplayDate(to),
      feeHead: newFeeHead,
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

  // Read-only cells for one configuration (cost → last modified on)
  const renderConfigCells = (c) => (
    <>
      <td>{formatCurrency(c.cost)}</td>
      <td>{formatCurrency(c.referrerIncentive)}</td>
      <td>{`${c.refereeDiscount}% (${formatCurrency(Math.round((c.cost * c.refereeDiscount) / 100))})`}</td>
      <td>{c.effectiveFrom}</td>
      <td>{c.effectiveTo ?? "-"}</td>
      <td>{c.feeHead ?? "-"}</td>
      <td style={{ color: 'var(--text-muted)' }}>{c.lastModifiedBy ?? "-"}</td>
      <td style={{ color: 'var(--text-muted)' }}>{c.lastModifiedOn ?? "-"}</td>
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Information Banner */}
      <div className="policy-banner">
        <Info className="policy-icon" size={18} />
        <div>
          <strong>Reward Settings Control.</strong> Expand a course to see all of its reward configurations, and use + to add a new dated configuration (date ranges cannot overlap). Click column headers or use the sort dropdown to organize records by cost or effective dates.
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
                <th style={COL.course}>Course</th>
                <th style={COL.type}>Type</th>

                {/* Clickable sort headers */}
                <th onClick={() => handleHeaderClick("cost")} style={{ ...COL.cost, cursor: 'pointer', userSelect: 'none' }}>
                  Course Cost {renderSortIndicator("cost")}
                </th>
                <th style={COL.referrer}>Referrer Incentive (₹)</th>
                <th style={COL.referee}>Referee Discount (% of cost)</th>
                <th onClick={() => handleHeaderClick("effectiveFrom")} style={{ ...COL.date, cursor: 'pointer', userSelect: 'none' }}>
                  Effective From {renderSortIndicator("effectiveFrom")}
                </th>
                <th style={COL.date}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    Effective To
                    <span title="All referral activity — from the initial referral to the referee's enrollment — must be completed within this date.">
                      <Info size={12} style={{ opacity: 0.6, cursor: 'help' }} />
                    </span>
                  </span>
                </th>
                <th style={COL.feeHead}>Fee Head</th>
                <th style={COL.modified}>Last Modified By</th>
                <th style={COL.modified}>Last Modified On</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrograms.map((prog) => {
                const configs = getConfigs(prog);
                const active = getActiveConfig(configs);
                const isExpanded = expandedCourses.has(prog.name);
                const isAdding = addingFor === prog.name;
                const lastConfig = configs[configs.length - 1];

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
                      {renderConfigCells(active)}
                    </tr>

                    {isExpanded && configs.map((c, i) => {
                      const isActive = c === active;
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
                          <td></td>
                          {renderConfigCells(c)}
                        </tr>
                      );
                    })}

                    {isExpanded && !isAdding && (
                      <tr className="config-subrow config-subrow-footer">
                        <td colSpan={COLUMN_COUNT}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                          <span title="Course cost is fetched from UMS and can't be edited here.">
                            {formatCurrency(active.cost)}
                          </span>
                        </td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            className="inline-edit-input"
                            placeholder="e.g. 5000"
                            value={newReferrer}
                            onChange={(e) => setNewReferrer(e.target.value)}
                            style={{ width: '100%' }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              ({formatCurrency(Math.round((active.cost * (parseFloat(newReferee || 0)) / 100)))})
                            </span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input
                              type="date"
                              className="inline-edit-input"
                              value={newFrom}
                              onChange={(e) => { setNewFrom(e.target.value); setAddError(""); }}
                              style={{ width: '100%', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--danger-text)', lineHeight: '1.3' }}>
                              {addError || (isOpenEnded(lastConfig.effectiveTo)
                                ? (newFrom ? `Current config will end on ${formatDisplayDate(addDays(fromIsoDate(newFrom), -1))}` : "Pick a start date")
                                : `Last config ends ${lastConfig.effectiveTo}`)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="date"
                            className="inline-edit-input"
                            value={newTo}
                            min={newFrom || undefined}
                            onChange={(e) => { setNewTo(e.target.value); setAddError(""); }}
                            style={{ width: '100%', cursor: 'pointer' }}
                          />
                        </td>
                        <td>
                          <select
                            className="inline-edit-input"
                            value={newFeeHead}
                            onChange={(e) => setNewFeeHead(e.target.value)}
                            style={{ width: '100%', cursor: 'pointer' }}
                          >
                            {FEE_HEAD_OPTIONS.map(fh => <option key={fh} value={fh}>{fh}</option>)}
                          </select>
                        </td>
                        <td></td>
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

    </div>
  );
}
