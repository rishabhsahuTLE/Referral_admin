import React from "react";
import { 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  IndianRupee, 
  Users, 
  TrendingUp, 
  User, 
  ArrowRight, 
  AlertOctagon,
  Copy,
  FileText,
  UserCheck
} from "lucide-react";

export default function Dashboard({ 
  data, 
  setView, 
  activeDuplicateIndex, 
  setActiveDuplicateIndex 
}) {
  const { stats, programs, referrers, duplicateLeads, reports } = data;

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

  // Handle duplicate leads carousel navigation
  const handlePrevDuplicate = (e) => {
    e.stopPropagation();
    if (duplicateLeads.length === 0) return;
    setActiveDuplicateIndex((prev) => (prev === 0 ? duplicateLeads.length - 1 : prev - 1));
  };

  const handleNextDuplicate = (e) => {
    e.stopPropagation();
    if (duplicateLeads.length === 0) return;
    setActiveDuplicateIndex((prev) => (prev === duplicateLeads.length - 1 ? 0 : prev + 1));
  };

  const currentDup = duplicateLeads[activeDuplicateIndex] || duplicateLeads[0];

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

        {/* Tile 3: Info Cards (4cols) */}
        <div className="dashboard-card col-4-lg">
          <div className="card-header">
            <div className="card-title">Info Overview</div>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="info-row">
                <div className="info-label"><IndianRupee size={16} /> Total Rewards Paid</div>
                <div className="info-val">{formatCurrency(stats.rewardsPaid)}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><Users size={16} /> Total Leads</div>
                <div className="info-val">{stats.leadsGenerated}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><UserCheck size={16} /> Enrolled</div>
                <div className="info-val">{stats.admissionsConverted}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><AlertTriangle size={16} style={{ color: 'var(--danger)' }} /> Dropped</div>
                <div className="info-val">{stats.dropOffs}</div>
              </div>
              <div className="info-row">
                <div className="info-label"><FileText size={16} /> In Progress</div>
                <div className="info-val">{stats.inProgress}</div>
              </div>
            </div>
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

        {/* Tile 5: Duplicate Leads Mini-Review (4cols - Cycles & Click to Tab) */}
        <div 
          className="dashboard-card col-4-lg card-clickable" 
          onClick={() => setView("duplicate_leads")}
        >
          <div className="card-header">
            <div className="card-title">Duplicate Leads Review</div>
            <div className="carousel-arrows">
              <button className="carousel-arrow-btn" onClick={handlePrevDuplicate} aria-label="Previous">
                <ChevronLeft size={16} />
              </button>
              <button className="carousel-arrow-btn" onClick={handleNextDuplicate} aria-label="Next">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="card-body" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentDup ? (
              <div className="mini-review-container">
                <div className="mini-review-header">
                  <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>
                    Review: {currentDup.name}
                  </span>
                  <span className={`badge badge-${currentDup.status.toLowerCase()}`}>
                    {currentDup.status}
                  </span>
                </div>
                
                <div className="mini-comparison-grid">
                  {/* Referral details */}
                  <div className="mini-comparison-box">
                    <div className="box-header-purple">
                      <User size={12} /> New Referral
                    </div>
                    <div className="box-content-mini">
                      <div className="mini-info-row">
                        <span className="mini-info-label">Name</span>
                        <span className="mini-info-val">{currentDup.name}</span>
                      </div>
                      <div className="mini-info-row">
                        <span className="mini-info-label">Course</span>
                        <span className="mini-info-val">{currentDup.course}</span>
                      </div>
                      <div className="mini-info-row">
                        <span className="mini-info-label">By</span>
                        <span className="mini-info-val">{currentDup.referredBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* CRM details */}
                  <div className="mini-comparison-box">
                    <div className="box-header-red">
                      <FileText size={12} /> {currentDup.crmMatchText}
                    </div>
                    <div className="box-content-mini">
                      <div className="mini-info-row">
                        <span className="mini-info-label">CRM Status</span>
                        <span className="mini-info-val">{currentDup.crmStatus}</span>
                      </div>
                      <div className="mini-info-row">
                        <span className="mini-info-label">First Seen</span>
                        <span className="mini-info-val">{currentDup.crmFirstSeen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                No duplicate leads pending
              </div>
            )}
            
            <div style={{ marginTop: 'auto', textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              Click to open full Duplicate Leads Tab
            </div>
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
