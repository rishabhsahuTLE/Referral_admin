import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown
} from "lucide-react";
import DateRangeFilter from "./DateRangeFilter";
import { computeDashboardMetrics } from "../utils/dashboardMetrics";

export default function Dashboard({ uniData, payoutRecordsByUni, selectedUni, onSelectUni, setView, onNavigateToRefereeReport, onFlagReferrer, onResolveReferrer, onRemoveReferrer }) {
  // Filters: a specific university (kept in sync with the sidebar selector) or all of
  // them, and a date range (All Time by default).
  const [allUnis, setAllUnis] = useState(false);
  const [dateRange, setDateRange] = useState(null);

  const unis = allUnis ? Object.values(uniData) : [uniData[selectedUni]];
  const metrics = computeDashboardMetrics(
    unis.map(uni => ({ uni, payouts: payoutRecordsByUni[uni.id] || [] })),
    dateRange
  );
  const programs = metrics.courses;

  // Referrer-level lists, tagged with their university so Flag/Resolve/Remove act on the
  // right one when viewing all universities.
  const referrers = unis
    .flatMap(uni => (uni.referrers || []).map(r => ({ ...r, uniId: uni.id, uniName: uni.name })))
    .sort((a, b) => b.count - a.count);
  const reports = unis.flatMap(uni => (uni.reports || []).map(r => ({ ...r, uniId: uni.id })));

  const periodLabel = dateRange?.startDate
    ? `${dateRange.startDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} – ${dateRange.endDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`
    : "All time";
  const scopeLabel = `${allUnis ? "All universities" : uniData[selectedUni].name} · ${periodLabel}`;

  const courseLabel = (c) => allUnis ? `${c.name} (${c.uniName})` : c.name;

  const goToRefereeReport = (c) => {
    if (c.uniId !== selectedUni) onSelectUni(c.uniId);
    onNavigateToRefereeReport(c.name);
  };

  // Calculate overall conversion rate
  const totalConverted = metrics.converted;
  const totalLeads = metrics.leads;
  const overallConversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Math helper to build SVG pie chart slices (moved here from Reports.jsx's Visual Charts tab)
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Render "Cost of Referral" tile — based on amounts actually paid: referrer payouts
  // marked Payment Done + first-payment discounts referees actually got, as a share of
  // the first-payment fees those referees actually paid.
  const renderReferralCostTile = () => {
    const courseReferralCosts = programs.filter(c => c.referralCost > 0 || c.feesCollected > 0);
    const breakdown = [
      ["Referrer payouts paid", metrics.payoutsPaid],
      ["Referee discounts given", metrics.discountsGiven],
      ["Fees collected (first payment)", metrics.feesCollected],
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Cost of Referral</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{metrics.costPercentage}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {formatCurrency(metrics.referralCost)} / {formatCurrency(metrics.feesCollected)}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
          {breakdown.map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <span style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{formatCurrency(value)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courseReferralCosts.length === 0 && (
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No payments in this period</div>
          )}
          {courseReferralCosts.map((item) => (
            <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
              title={`Payouts ${formatCurrency(item.payoutsPaid)} + discounts ${formatCurrency(item.discountsGiven)} on ${formatCurrency(item.feesCollected)} collected`}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>{courseLabel(item)}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{item.costPercentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render "Referral Cost Ratio by Course" pie chart
  const renderReferralCostPieChart = () => {
    const data = programs
      .map(p => ({ ...p, label: courseLabel(p), value: p.referralCost }))
      .filter(d => d.value > 0);

    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#514697", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];

    if (totalVal === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center', width: '100%', flexWrap: 'wrap' }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '150px', height: '150px', transform: 'rotate(-90deg)', flexShrink: 0 }}>
          {data.map((item, index) => {
            const percent = item.value / totalVal;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');

            return (
              <path
                key={index}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="#ffffff"
                strokeWidth="0.02"
                onClick={() => goToRefereeReport(item)}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {data.map((item, index) => (
            <button
              key={index}
              onClick={() => goToRefereeReport(item)}
              className="report-link-btn"
              title={`View referees enrolled in ${item.name}`}
              style={{ justifyContent: 'flex-start', gap: '8px', fontSize: '12px' }}
            >
              <span style={{ width: '10px', height: '10px', flexShrink: 0, backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></span>
              <span style={{ fontWeight: '600' }}>{item.label}</span>
              <span>(₹{(item.value / 1000).toFixed(0)}K - {Math.round((item.value / totalVal) * 100)}%)</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{scopeLabel}</strong>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              className="search-input"
              aria-label="Filter by university"
              style={{ paddingRight: '32px', paddingLeft: '12px', minWidth: '200px', cursor: 'pointer', backgroundColor: '#ffffff' }}
              value={allUnis ? "__all__" : selectedUni}
              onChange={(e) => {
                if (e.target.value === "__all__") { setAllUnis(true); return; }
                setAllUnis(false);
                onSelectUni(e.target.value);
              }}
            >
              <option value="__all__">All Universities</option>
              {Object.values(uniData).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: 'var(--text-muted)' }} />
          </div>
          <DateRangeFilter onDateRangeChange={setDateRange} includeAllTime defaultRange="all-time" />
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Leads Generated</div>
          <div className="stat-val">{metrics.leads}</div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>{periodLabel}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admissions Converted</div>
          <div className="stat-val">{metrics.converted}</div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>{periodLabel}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drop-offs</div>
          <div className="stat-val">{metrics.dropOffs}</div>
          <div className="stat-trend" style={{ color: 'var(--text-muted)' }}>{periodLabel}</div>
        </div>
      </div>

      {/* Main 6-Tile Grid */}
      <div className="dashboard-grid">
        
        {/* Tile 1: Conversion by Program (Large - full width) */}
        <div className="dashboard-card col-12-lg" style={{ minHeight: '420px' }}>
          <div className="card-header">
            <div className="card-title">Conversion by Course</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Conversion Rate:</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{overallConversionRate}%</span>
            </div>
          </div>
          <div className="card-body">
            <div className="program-conversion-list">
              {programs.length === 0 && (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '24px' }}>No courses</div>
              )}
              {programs.map((prog, idx) => {
                const rate = prog.leads > 0 ? Math.round((prog.converted / prog.leads) * 100) : 0;
                // Assign a color based on rate
                let barColor = 'var(--danger)'; // < 50%
                if (rate >= 70) barColor = 'var(--success)';
                else if (rate >= 50) barColor = 'var(--warning)';

                return (
                  <div key={idx} className="program-conversion-row">
                    <div className="prog-name" title={courseLabel(prog)}>{courseLabel(prog)}</div>
                    <div className="prog-progress-container">
                      <div 
                        className="prog-progress-bar" 
                        style={{ width: `${rate}%`, backgroundColor: barColor }}
                      ></div>
                    </div>
                    <div className="prog-rate-badge" style={{ color: barColor }}>{rate}%</div>
                    <div className="prog-ratio">{prog.converted} / {prog.leads}</div>
                    <div className="prog-cost" title="Cost per conversion due to referral">
                      {formatCurrency(prog.referrerIncentive)} cost
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Scroll for more programs
              </span>
            </div>
          </div>
        </div>

        {/* Tile 3: Cost of Referral (4cols) — moved here from Reports > Visual Charts */}
        <div className="dashboard-card col-4-lg">
          <div className="card-header">
            <div className="card-title">Cost of Referral</div>
          </div>
          <div className="card-body">
            {renderReferralCostTile()}
          </div>
        </div>

        {/* Tile 4: High Volume Referrers (4cols) */}
        <div className="dashboard-card col-4-lg">
          <div className="card-header">
            <div className="card-title">High Volume Referrers</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="referrer-list" style={{ flexGrow: 1 }}>
              {referrers.slice(0, 4).map((ref) => {
                const referrerReport = reports.find(r => r.student === ref.name && r.uniId === ref.uniId);
                const isFlagged = referrerReport?.status === 'Flagged';
                return (
                  <div key={`${ref.uniId}-${ref.name}`} className="referrer-row">
                    <div>
                      <div className="referrer-name">{ref.name}</div>
                      {allUnis && <div className="referrer-count">{ref.uniName}</div>}
                      <div className="referrer-count">{ref.count} referrals ({ref.converted} converted)</div>
                    </div>
                    {isFlagged ? (
                      <button
                        className="resolve-btn"
                        onClick={() => onResolveReferrer(ref.name, ref.uniId)}
                      >
                        Resolve
                      </button>
                    ) : (
                      <div className="referrer-actions">
                        <button
                          className="resolve-btn"
                          onClick={() => onFlagReferrer(ref.name, ref.uniId)}
                        >
                          Flag
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => onRemoveReferrer(ref.name, ref.uniId)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tile 5: Referral Cost Ratio by Course (4cols) — moved here from Reports > Visual Charts */}
        <div className="dashboard-card col-4-lg">
          <div className="card-header">
            <div className="card-title">Referral Cost Ratio by Course</div>
          </div>
          <div className="card-body">
            {renderReferralCostPieChart()}
          </div>
        </div>

        {/* Tile 6: Reports Mini-Preview (12cols - Full Width on bottom) */}
        <div 
          className="dashboard-card col-12-lg card-clickable" 
          onClick={() => setView("reports")}
          style={{ minHeight: '260px' }}
        >
          <div className="card-header">
            <div className="card-title">Reports Preview</div>
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Full Reports Tab <ArrowRight size={14} />
            </span>
          </div>
          <div className="card-body" style={{ padding: '0' }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 20px' }}>Student</th>
                  <th style={{ padding: '12px 20px' }}>Enrollment No</th>
                  <th style={{ padding: '12px 20px' }}>Submitted</th>
                  <th style={{ padding: '12px 20px' }}>Converted</th>
                  <th style={{ padding: '12px 20px' }}>Conversion Rate</th>
                  <th style={{ padding: '12px 20px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 3).map((rep, idx) => {
                  const rate = rep.submitted > 0 ? Math.round((rep.converted / rep.submitted) * 100) : 0;
                  let barColor = 'var(--danger)';
                  if (rate >= 70) barColor = 'var(--success)';
                  else if (rate >= 50) barColor = 'var(--warning)';

                  return (
                    <tr key={idx}>
                      <td style={{ padding: '12px 20px' }}>
                        <div className="student-name">{rep.student}</div>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'var(--text-muted)' }}>{rep.enrollmentNo}</td>
                      <td style={{ padding: '12px 20px', fontWeight: '600' }}>{rep.submitted}</td>
                      <td style={{ padding: '12px 20px', fontWeight: '600' }}>{rep.converted}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="prog-progress-container" style={{ width: '80px', marginBottom: '0' }}>
                            <div className="prog-progress-bar" style={{ width: `${rate}%`, backgroundColor: barColor }}></div>
                          </div>
                          <span style={{ fontWeight: '600', color: barColor }}>{rate}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                        {rep.status === 'Flagged' ? (
                          <span className="btn-flagged">Flagged</span>
                        ) : (
                          <span className="btn-clear">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
