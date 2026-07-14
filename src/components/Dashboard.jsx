import React from "react";
import {
  TrendingUp,
  ArrowRight,
  AlertOctagon,
  Copy
} from "lucide-react";

export default function Dashboard({ data, setView }) {
  const { stats, programs, referrers, reports } = data;

  // Calculate overall conversion rate
  const totalConverted = programs.reduce((acc, curr) => acc + curr.converted, 0);
  const totalLeads = programs.reduce((acc, curr) => acc + curr.leads, 0);
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

  // Calculate total cost of referral across all programmes
  const calculateTotalReferralCost = () => {
    let totalReferralCost = 0;
    let totalCourseRevenue = 0;

    programs.forEach(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      totalReferralCost += referralCostPerConversion * p.converted;
      totalCourseRevenue += p.cost * p.converted;
    });

    return {
      totalReferralCost,
      totalCourseRevenue,
      percentage: totalCourseRevenue > 0 ? (totalReferralCost / totalCourseRevenue * 100).toFixed(1) : 0
    };
  };

  const totalReferralData = calculateTotalReferralCost();

  // Render "Cost of Referral" tile
  const renderReferralCostTile = () => {
    const courseReferralCosts = programs.map(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      const totalReferralCost = referralCostPerConversion * p.converted;
      const totalCourseCost = p.cost * p.converted;
      const percentage = totalCourseCost > 0 ? (totalReferralCost / totalCourseCost * 100).toFixed(1) : 0;
      return { name: p.name, referralCost: totalReferralCost, percentage };
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Cost of Referral</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{totalReferralData.percentage}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ₹{totalReferralData.totalReferralCost.toLocaleString()} / ₹{totalReferralData.totalCourseRevenue.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courseReferralCosts.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render "Referral Cost Ratio by Course" pie chart
  const renderReferralCostPieChart = () => {
    const data = programs.map(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      const totalReferralCost = referralCostPerConversion * p.converted;
      return { name: p.name, value: totalReferralCost };
    }).filter(d => d.value > 0);

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
                onClick={() => setView("reports")}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => setView("reports")}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>(₹{(item.value / 1000).toFixed(0)}K - {Math.round((item.value / totalVal) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top 3 Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Leads Generated</div>
          <div className="stat-val">{stats.leadsGenerated}</div>
          <div className="stat-trend trend-up">
            <TrendingUp size={14} /> {stats.leadsGrowth}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admissions Converted</div>
          <div className="stat-val">{stats.admissionsConverted}</div>
          <div className="stat-trend trend-up">
            <TrendingUp size={14} /> {stats.conversionsGrowth}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drop-offs</div>
          <div className="stat-val">{stats.dropOffs}</div>
          <div className="stat-trend trend-up" style={{ color: 'var(--danger)' }}>
            <TrendingUp size={14} /> {stats.dropOffsGrowth}
          </div>
        </div>
      </div>

      {/* Main 6-Tile Grid */}
      <div className="dashboard-grid">
        
        {/* Tile 1: Conversion by Program (Large - 8cols) */}
        <div className="dashboard-card col-8-lg" style={{ minHeight: '420px' }}>
          <div className="card-header">
            <div className="card-title">Conversion by Programme</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Overall Conversion Rate:</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>{overallConversionRate}%</span>
            </div>
          </div>
          <div className="card-body">
            <div className="program-conversion-list">
              {programs.map((prog, idx) => {
                const rate = prog.leads > 0 ? Math.round((prog.converted / prog.leads) * 100) : 0;
                // Assign a color based on rate
                let barColor = 'var(--danger)'; // < 50%
                if (rate >= 70) barColor = 'var(--success)';
                else if (rate >= 50) barColor = 'var(--warning)';

                return (
                  <div key={idx} className="program-conversion-row">
                    <div className="prog-name" title={prog.name}>{prog.name}</div>
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

        {/* Tile 2: Notifications (4cols) */}
        <div className="dashboard-card col-4-lg">
          <div className="card-header">
            <div className="card-title">Notifications</div>
            <span className="sidebar-badge" style={{ padding: '2px 8px' }}>Active</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="notif-item" onClick={() => setView("fraud_monitor")}>
              <div className="notif-icon-box">
                <AlertOctagon size={20} />
              </div>
              <div className="notif-details">
                <div className="notif-text">{data.notifications?.fraudFlags || 2} Fraud Flags</div>
                <div className="notif-subtext">Requires immediate resolution</div>
              </div>
            </div>
            
            <div className="notif-item" onClick={() => setView("duplicate_leads")}>
              <div className="notif-icon-box">
                <Copy size={20} style={{ transform: 'rotate(180deg)' }} />
              </div>
              <div className="notif-details">
                <div className="notif-text">{data.notifications?.duplicateLeads || 3} Duplicate Leads</div>
                <div className="notif-subtext">Review matching student records</div>
              </div>
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                className="portal-btn" 
                onClick={() => setView("notification_log")}
                style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
              >
                View Notification Log <ArrowRight size={14} />
              </button>
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

        {/* Tile 4: High Volume Referrers (4cols - Click to Fraud Monitor) */}
        <div 
          className="dashboard-card col-4-lg card-clickable" 
          onClick={() => setView("fraud_monitor")}
        >
          <div className="card-header">
            <div className="card-title">High Volume Referrers</div>
            <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '600' }}>Monitor</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="referrer-list" style={{ flexGrow: 1 }}>
              {referrers.slice(0, 4).map((ref, idx) => (
                <div key={idx} className="referrer-row">
                  <div>
                    <div className="referrer-name">{ref.name}</div>
                    <div className="referrer-count">{ref.count} referrals ({ref.converted} converted)</div>
                  </div>
                  <button 
                    className="resolve-btn" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setView("fraud_monitor");
                    }}
                  >
                    Resolve
                  </button>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              Click anywhere in this tile to view Fraud Monitor
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
