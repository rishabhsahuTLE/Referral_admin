import React, { useState, useEffect } from "react";
import { Search, Download, TrendingUp } from "lucide-react";
import { downloadCSV } from "../utils/csv";

export default function Reports({ data, initialRefereeCourse, onConsumeDeepLink }) {
  const [activeSubTab, setActiveSubTab] = useState("referrer_report");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");

  // Referee report state
  const [refereeSearchTerm, setRefereeSearchTerm] = useState("");
  const [selectedRefereeCourse, setSelectedRefereeCourse] = useState("All");
  // Set only via clicks elsewhere (referrer name/count/enrolled/in-progress/dropped cells,
  // column headers, or the Dashboard's course chart) — there's no manual control for these,
  // just the filter-chip bar that lets the admin clear them.
  const [refereeReferrerFilter, setRefereeReferrerFilter] = useState(null);
  const [refereeStatusFilter, setRefereeStatusFilter] = useState("All");

  const { reports, refereeReports = [], programs, stats } = data;

  // Derive unique course list from programs for the dropdown
  const courseOptions = ["All", ...programs.map(p => p.name)];

  // Build a referrer → courses mapping from duplicateLeads
  const referrerCourseMap = {};
  (data.duplicateLeads || []).forEach(dl => {
    if (!referrerCourseMap[dl.referredBy]) referrerCourseMap[dl.referredBy] = new Set();
    referrerCourseMap[dl.referredBy].add(dl.course);
  });

  // Consume a one-shot deep link from the Dashboard's "Referral Cost Ratio by Course"
  // chart: jump straight to Referee Report with that course pre-selected, then tell the
  // parent to clear it so a later, unrelated visit to Reports doesn't replay it.
  useEffect(() => {
    if (initialRefereeCourse) {
      setSelectedRefereeCourse(initialRefereeCourse);
      setActiveSubTab("referee_report");
      onConsumeDeepLink?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to Referee Report, optionally filtered by referrer name and/or funnel status.
  // Always resets the course filter too — otherwise a stale course selection from an
  // earlier, unrelated visit (e.g. the Dashboard's course-chart deep link) would silently
  // narrow these referrer/status-based results down to almost nothing.
  const goToRefereeReport = ({ referrerName = null, applicationStatus = "All" } = {}) => {
    setRefereeReferrerFilter(referrerName);
    setRefereeStatusFilter(applicationStatus);
    setRefereeSearchTerm("");
    setSelectedRefereeCourse("All");
    setActiveSubTab("referee_report");
  };

  const clearRefereeFilters = () => {
    setRefereeReferrerFilter(null);
    setRefereeStatusFilter("All");
  };

  // Filter reports list based on search term and selected course
  const filteredReports = reports.filter(rep => {
    const matchesSearch =
      rep.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCourse === "All") return true;
    const courses = referrerCourseMap[rep.student];
    return courses && courses.has(selectedCourse);
  });

  // Filter referee reports by search + selected course + referrer/status drill-down filters
  const filteredRefereeReports = refereeReports.filter(rep => {
    const matchesSearch =
      rep.refereeName.toLowerCase().includes(refereeSearchTerm.toLowerCase()) ||
      rep.refereeEnrollNo.toLowerCase().includes(refereeSearchTerm.toLowerCase()) ||
      rep.referrerName.toLowerCase().includes(refereeSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedRefereeCourse !== "All" && rep.refereeCourse !== selectedRefereeCourse) return false;
    if (refereeReferrerFilter && rep.referrerName !== refereeReferrerFilter) return false;
    if (refereeStatusFilter !== "All" && rep.applicationStatus !== refereeStatusFilter) return false;
    return true;
  });

  // Download whatever is currently previewed in the Referrer Report table
  const handleDownloadReferrerReport = () => {
    const header = ["Student", "Enrollment No", "No. of Referrals", "Enrolled", "In Progress", "Dropped", "Conversion Rate", "Status"];
    const rows = filteredReports.map(rep => {
      const rate = rep.submitted > 0 ? Math.round((rep.converted / rep.submitted) * 100) : 0;
      const droppedCount = rep.dropped ?? 0;
      const inProgressCount = rep.submitted - rep.converted - droppedCount;
      return [
        rep.student,
        rep.enrollmentNo,
        rep.submitted,
        rep.converted,
        inProgressCount,
        droppedCount,
        `${rate}%`,
        rep.status
      ];
    });
    downloadCSV("referrer-report.csv", [header, ...rows]);
  };

  // Download whatever is currently previewed in the Referee Report table
  const handleDownloadRefereeReport = () => {
    const header = ["Referee", "Enrollment No", "Referee Course", "Referrer", "Referrer Course", "Application Status", "Admitted", "Paid", "In Process", "Status"];
    const rows = filteredRefereeReports.map(rep => [
      rep.refereeName,
      rep.refereeEnrollNo,
      rep.refereeCourse,
      rep.referrerName,
      rep.referrerCourse,
      rep.applicationStatus,
      rep.admitted,
      rep.paid,
      rep.inProcess,
      rep.status
    ]);
    downloadCSV("referee-report.csv", [header, ...rows]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Summaries (matching the three boxes from screenshot 1) */}
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

      {/* Reports Inner Page Navigation */}
      <div className="inner-tabs-container">
        <div className="inner-tabs">
          <div 
            className={`inner-tab ${activeSubTab === "referrer_report" ? "active" : ""}`}
            onClick={() => setActiveSubTab("referrer_report")}
          >
            Referrer Report
          </div>
          <div 
            className={`inner-tab ${activeSubTab === "referee_report" ? "active" : ""}`}
            onClick={() => setActiveSubTab("referee_report")}
          >
            Referee Report
          </div>
          {/* Attribution Audit temporarily disabled
          <div
            className={`inner-tab ${activeSubTab === "attribution_audit" ? "active" : ""}`}
            onClick={() => setActiveSubTab("attribution_audit")}
          >
            Attribution Audit <span className="inner-tab-badge">1</span>
          </div>
          */}
        </div>
      </div>

      {/* Conditional Content based on selected inner tab */}
      {activeSubTab === "referrer_report" && (
        <>
          {/* Search bar + Course filter + Download */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar-container" style={{ marginBottom: 0, maxWidth: 'none', width: '100%', flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by student or enrollment no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Course filter dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px', flexShrink: 0 }}>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1.5px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                {courseOptions.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {/* Download button — icon only */}
            <button
              onClick={handleDownloadReferrerReport}
              title="Download CSV"
              aria-label="Download CSV"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: '38px',
                height: '38px',
                padding: 0,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <Download size={16} />
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Enrollment No</th>
                  <th>No. of Referrals</th>
                  <th
                    className="report-link-th"
                    onClick={() => goToRefereeReport({ applicationStatus: "Enrolled" })}
                    title="View all enrolled referees"
                  >
                    Enrolled
                  </th>
                  <th
                    className="report-link-th"
                    onClick={() => goToRefereeReport({ applicationStatus: "In Progress" })}
                    title="View all in-progress referees"
                  >
                    In Progress
                  </th>
                  <th
                    className="report-link-th"
                    onClick={() => goToRefereeReport({ applicationStatus: "Dropped" })}
                    title="View all dropped referees"
                  >
                    Dropped
                  </th>
                  <th>Conversion Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((rep, idx) => {
                  const rate = rep.submitted > 0 ? Math.round((rep.converted / rep.submitted) * 100) : 0;

                  let barColor = 'var(--danger)';
                  if (rate >= 70) barColor = 'var(--success)';
                  else if (rate >= 50) barColor = 'var(--warning)';

                  const droppedCount = rep.dropped ?? 0;
                  const inProgressCount = rep.submitted - rep.converted - droppedCount;

                  return (
                    <tr key={idx}>
                      <td>
                        <button
                          className="report-link-btn"
                          onClick={() => goToRefereeReport({ referrerName: rep.student })}
                          title={`View all students referred by ${rep.student}`}
                        >
                          {rep.student}
                        </button>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{rep.enrollmentNo}</td>
                      <td>
                        <button
                          className="report-link-btn"
                          onClick={() => goToRefereeReport({ referrerName: rep.student })}
                          title={`View all students referred by ${rep.student}`}
                        >
                          {rep.submitted}
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-link-btn"
                          onClick={() => goToRefereeReport({ referrerName: rep.student, applicationStatus: "Enrolled" })}
                          title={`View ${rep.student}'s enrolled referees`}
                          style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                        >
                          {rep.converted}
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-link-btn"
                          onClick={() => goToRefereeReport({ referrerName: rep.student, applicationStatus: "In Progress" })}
                          title={`View ${rep.student}'s in-progress referees`}
                          style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }}
                        >
                          {inProgressCount}
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-link-btn"
                          onClick={() => goToRefereeReport({ referrerName: rep.student, applicationStatus: "Dropped" })}
                          title={`View ${rep.student}'s dropped referees`}
                          style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                        >
                          {droppedCount}
                        </button>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="prog-progress-container" style={{ width: '80px', marginBottom: '0' }}>
                            <div className="prog-progress-bar" style={{ width: `${rate}%`, backgroundColor: barColor }}></div>
                          </div>
                          <span style={{ fontWeight: '700', color: barColor }}>{rate}%</span>
                        </div>
                      </td>
                      <td>
                        {rep.status === 'Flagged' ? (
                          <span className="btn-flagged">Flagged</span>
                        ) : (
                          <span className="btn-clear">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      {selectedCourse !== "All"
                        ? `No referrers found for "${selectedCourse}"${searchTerm ? ` matching "${searchTerm}"` : ""}`
                        : `No student records found matching "${searchTerm}"`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSubTab === "referee_report" && (
        <>
          {/* Search bar + Course filter + Download */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar-container" style={{ marginBottom: 0, maxWidth: 'none', width: '100%', flex: 1 }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by referee, referrer or enrollment no..."
                value={refereeSearchTerm}
                onChange={(e) => setRefereeSearchTerm(e.target.value)}
              />
            </div>
            {/* Referee course filter dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '220px', flexShrink: 0 }}>
              <select
                value={selectedRefereeCourse}
                onChange={(e) => setSelectedRefereeCourse(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1.5px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                {courseOptions.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {/* Download button — icon only */}
            <button
              onClick={handleDownloadRefereeReport}
              title="Download CSV"
              aria-label="Download CSV"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                width: '38px',
                height: '38px',
                padding: 0,
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <Download size={16} />
            </button>
          </div>

          {(refereeReferrerFilter || refereeStatusFilter !== "All") && (
            <div className="report-filter-bar">
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filtered by:</span>
              {refereeReferrerFilter && (
                <span className="report-filter-chip">
                  Referrer: {refereeReferrerFilter}
                  <button onClick={() => setRefereeReferrerFilter(null)} aria-label="Clear referrer filter">×</button>
                </span>
              )}
              {refereeStatusFilter !== "All" && (
                <span className="report-filter-chip">
                  Status: {refereeStatusFilter}
                  <button onClick={() => setRefereeStatusFilter("All")} aria-label="Clear status filter">×</button>
                </span>
              )}
              <button className="report-filter-clear-btn" onClick={clearRefereeFilters}>Clear all</button>
            </div>
          )}

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Referee</th>
                  <th>Enrollment No</th>
                  <th>Referee Course</th>
                  <th>Referrer</th>
                  <th>Referrer Course</th>
                  <th>Application Status</th>
                  <th>Stage Breakdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefereeReports.map((rep, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="student-name">{rep.refereeName}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{rep.refereeEnrollNo}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)'
                      }}>
                        {rep.refereeCourse}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{rep.referrerName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{rep.referrerCourse}</td>
                    <td>
                      {rep.applicationStatus === 'Enrolled' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          ● Enrolled
                        </span>
                      )}
                      {rep.applicationStatus === 'In Progress' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          ● In Progress
                        </span>
                      )}
                      {rep.applicationStatus === 'Dropped' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          ● Dropped
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="stages-list">
                        <span className="stage-pill stage-admitted">Admitted: {rep.admitted}</span>
                        <span className="stage-pill stage-paid">Paid: {rep.paid}</span>
                        <span className="stage-pill stage-in-process">Process: {rep.inProcess}</span>
                      </div>
                    </td>
                    <td>
                      {rep.status === 'Flagged' ? (
                        <span className="btn-flagged">Flagged</span>
                      ) : (
                        <span className="btn-clear">Clear</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRefereeReports.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      {selectedRefereeCourse !== "All"
                        ? `No referees found for "${selectedRefereeCourse}"${refereeSearchTerm ? ` matching "${refereeSearchTerm}"` : ""}`
                        : `No referee records found matching "${refereeSearchTerm}"`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Attribution Audit temporarily disabled — guarded with `false &&` instead of a JSX
          comment since this block contains its own inline `{/* ... *\/}` comments, which
          would otherwise prematurely close an outer JSX comment wrap. */}
      {false && activeSubTab === "attribution_audit" && (() => {
        const auditRows = [
          { student: "Rahul Sharma",  origCourse: "B.Tech CSE",     newCourse: "B.Tech AI/ML",   referring: "Aditya Verma",  date: "10 Jun 2026", status: "Preserved" },
          { student: "Priya Mehta",   origCourse: "MBA Marketing",   newCourse: "MBA Finance",    referring: "Pradeep Nair",  date: "05 Jun 2026", status: "Preserved" },
          { student: "Kavya Iyer",    origCourse: "B.Com",           newCourse: "BCA",            referring: "Neha Kapoor",   date: "28 May 2026", status: "Broken"    },
          { student: "Rohan Gupta",   origCourse: "B.Tech CSE",      newCourse: "MCA",            referring: "Divya Menon",   date: "01 Jun 2026", status: "Preserved" },
        ];
        const totalChanges = auditRows.length;
        const preserved   = auditRows.filter(r => r.status === "Preserved").length;
        const broken      = auditRows.filter(r => r.status === "Broken").length;

        return (
          <div className="table-container">
            {/* Summary bar */}
            <div style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafbfc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{totalChanges}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Total Course Changes</span>
                </span>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--success-text)' }}>{preserved}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Preserved</span>
                </span>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--danger-text)' }}>{broken}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Broken</span>
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                BR-15: referral source must be preserved on course change
              </span>
            </div>

            {/* Table */}
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Original Course</th>
                  <th>New Course</th>
                  <th>Referring Student</th>
                  <th>Date</th>
                  <th>Attribution</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '700' }}>{row.student}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.origCourse}</td>
                    <td style={{ fontWeight: '600', color: row.status === 'Broken' ? 'var(--danger-text)' : 'var(--text-main)' }}>
                      {row.newCourse}
                    </td>
                    <td style={{ color: 'var(--info-text)', fontWeight: '500' }}>{row.referring}</td>
                    <td style={{ color: row.status === 'Broken' ? 'var(--danger-text)' : 'var(--text-muted)', fontSize: '12px' }}>
                      {row.date}
                    </td>
                    <td>
                      {row.status === 'Preserved' ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: 'var(--success-bg)', color: 'var(--success-text)',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          ● Preserved
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                          border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                          ● Broken
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}


    </div>
  );
}
