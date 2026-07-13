import React, { useState } from "react";
import { Search, Edit, Save, X, Info, ArrowUpDown, ChevronDown } from "lucide-react";

export default function ReferralPolicy({ data, onUpdatePolicy }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRowIdx, setEditingRowIdx] = useState(null);
  
  // Sorting state
  const [sortField, setSortField] = useState("none"); // none, cost, referralPercent, effectiveFrom
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc

  // Local state for inline edits
  const [editCost, setEditCost] = useState("");
  const [editPercent, setEditPercent] = useState("");
  const [editReferrer, setEditReferrer] = useState("");
  const [editReferee, setEditReferee] = useState("");
  const [editEffective, setEditEffective] = useState("");

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
      // Parse date e.g. "01 Jun 2026"
      valA = new Date(valA).getTime() || 0;
      valB = new Date(valB).getTime() || 0;
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

  const startEdit = (idx, prog) => {
    setEditingRowIdx(idx);
    setEditCost(prog.cost);
    setEditPercent(prog.referralPercent);
    setEditReferrer(prog.referrerIncentive);
    setEditReferee(prog.refereeDiscount); // This is a percentage e.g. 10
    setEditEffective(prog.effectiveFrom);
  };

  const cancelEdit = () => {
    setEditingRowIdx(null);
  };

  const handleCostChange = (val) => {
    const cost = parseFloat(val) || 0;
    setEditCost(val);
    // Recalculate default incentives if we have a percent
    const pct = parseFloat(editPercent) || 0;
    const totalReward = (cost * pct) / 100;
    setEditReferrer(Math.round(totalReward / 2));
    
    // Also suggest referee discount percentage if needed, but referee is edited as percentage now.
    // Let's keep referee discount percentage default (e.g. 10%) or recalculate if desired.
  };

  const handlePercentChange = (val) => {
    const pct = parseFloat(val) || 0;
    setEditPercent(val);
    const cost = parseFloat(editCost) || 0;
    const totalReward = (cost * pct) / 100;
    setEditReferrer(Math.round(totalReward / 2));
  };

  const saveEdit = (progName) => {
    const updatedProg = {
      name: progName,
      cost: parseFloat(editCost) || 0,
      referralPercent: parseFloat(editPercent) || 0,
      referrerIncentive: parseFloat(editReferrer) || 0,
      refereeDiscount: parseFloat(editReferee) || 0, // saved as percentage
      effectiveFrom: editEffective
    };
    onUpdatePolicy(updatedProg);
    setEditingRowIdx(null);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Information Banner */}
      <div className="policy-banner">
        <Info className="policy-icon" size={18} />
        <div>
          <strong>Reward Settings Control.</strong> You can search and edit program costs, referrer incentives, and referee discounts. Click column headers or use the sort dropdown to organize records by cost, referral percentage, or effective dates.
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
            Reward Master — by Programme
          </h2>
          
          {/* Search bar & Sort Dropdown */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="search-bar-container" style={{ marginBottom: 0 }}>
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search program..." 
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
                <option value="referralPercent-asc">Referral %: Lowest First</option>
                <option value="referralPercent-desc">Referral %: Highest First</option>
                <option value="effectiveFrom-asc">Effective Date: Lowest First</option>
                <option value="effectiveFrom-desc">Effective Date: Highest First</option>
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Type</th>
                
                {/* Clickable sort headers */}
                <th onClick={() => handleHeaderClick("cost")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Program Cost {renderSortIndicator("cost")}
                </th>
                <th onClick={() => handleHeaderClick("referralPercent")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Referral % of Cost {renderSortIndicator("referralPercent")}
                </th>
                <th>Referrer Incentive (₹)</th>
                <th>Referee Discount (% of cost)</th>
                <th onClick={() => handleHeaderClick("effectiveFrom")} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  Effective From {renderSortIndicator("effectiveFrom")}
                </th>
                <th style={{ width: '100px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPrograms.map((prog, idx) => {
                const isEditing = editingRowIdx === idx;
                // Find matching index in unfiltered programs list to save
                const programOriginalIdx = programs.findIndex(p => p.name === prog.name);

                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600' }}>{prog.name}</td>
                    <td>
                      <span className={`badge ${prog.type === 'UG' ? 'badge-applicant' : 'badge-enrolled'}`}>
                        {prog.type}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="inline-edit-input" 
                          value={editCost} 
                          onChange={(e) => handleCostChange(e.target.value)} 
                          style={{ width: '100px' }}
                        />
                      ) : (
                        formatCurrency(prog.cost)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.01"
                          className="inline-edit-input" 
                          value={editPercent} 
                          onChange={(e) => handlePercentChange(e.target.value)} 
                          style={{ width: '70px' }}
                        />
                      ) : (
                        `${prog.referralPercent}%`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="inline-edit-input" 
                          value={editReferrer} 
                          onChange={(e) => setEditReferrer(e.target.value)} 
                          style={{ width: '95px' }}
                        />
                      ) : (
                        formatCurrency(prog.referrerIncentive)
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input 
                              type="number" 
                              className="inline-edit-input" 
                              value={editReferee} 
                              onChange={(e) => setEditReferee(e.target.value)} 
                              style={{ width: '60px' }}
                            />
                            <span style={{ fontSize: '13px', fontWeight: '600' }}>%</span>
                          </div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            ({formatCurrency(Math.round((parseFloat(editCost || 0) * (parseFloat(editReferee || 0)) / 100)))})
                          </span>
                        </div>
                      ) : (
                        `${prog.refereeDiscount}% (${formatCurrency(Math.round((prog.cost * prog.refereeDiscount) / 100))})`
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <input 
                          type="text" 
                          className="inline-edit-input" 
                          value={editEffective} 
                          onChange={(e) => setEditEffective(e.target.value)} 
                          style={{ width: '110px' }}
                        />
                      ) : (
                        prog.effectiveFrom
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        {isEditing ? (
                          <>
                            <button 
                              className="action-icon-btn save" 
                              onClick={() => saveEdit(prog.name)}
                              title="Save Policy Changes"
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              className="action-icon-btn" 
                              onClick={cancelEdit}
                              title="Cancel Edit"
                              style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="action-icon-btn" 
                            onClick={() => startEdit(programOriginalIdx, prog)}
                            title="Edit Referral Policy Row"
                          >
                            <Edit size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {sortedPrograms.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
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
