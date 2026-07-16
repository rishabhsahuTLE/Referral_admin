import React, { useState } from 'react';
import ComprehensiveReportModal from './ComprehensiveReportModal';

// Per-course counts are derived straight from each university's refereeReports —
// the same ground-truth per-individual records the Reports tab uses — rather than
// from the programs array's own hand-authored leads/converted numbers, so what's
// shown here always reconciles exactly with what the popup drill-down displays.
function computeCourseStats(uni) {
  const refereeReports = uni.refereeReports || [];
  return uni.programs.map((prog) => {
    const rows = refereeReports.filter((r) => r.refereeCourse === prog.name);
    return {
      course: prog.name,
      leads: rows.length,
      converted: rows.filter((r) => r.applicationStatus === 'Enrolled').length,
      dropOff: rows.filter((r) => r.applicationStatus === 'Dropped').length,
    };
  });
}

export default function ComprehensiveReport({ uniData, payoutRecords }) {
  const [popup, setPopup] = useState(null);

  const universities = Object.values(uniData);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>
        Comprehensive Report
      </h2>

      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>University Name</th>
              <th>Course Name</th>
              <th>Leads Generated</th>
              <th>Admissions Converted</th>
              <th>Drop off</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => {
              const stats = computeCourseStats(uni);
              return (
                <React.Fragment key={uni.id}>
                  {stats.map((row, idx) => (
                    <tr key={row.course}>
                      {idx === 0 && (
                        <td
                          rowSpan={stats.length}
                          style={{ fontWeight: '700', verticalAlign: 'top', borderRight: '1px solid var(--border)' }}
                        >
                          {uni.name}
                        </td>
                      )}
                      <td style={{ fontWeight: '600' }}>{row.course}</td>
                      <td>
                        <button className="report-link-btn" onClick={() => setPopup({ uni, courseName: row.course, column: 'leads' })}>
                          {row.leads}
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-link-btn"
                          style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                          onClick={() => setPopup({ uni, courseName: row.course, column: 'converted' })}
                        >
                          {row.converted}
                        </button>
                      </td>
                      <td>
                        <button
                          className="report-link-btn"
                          style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                          onClick={() => setPopup({ uni, courseName: row.course, column: 'dropOff' })}
                        >
                          {row.dropOff}
                        </button>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <ComprehensiveReportModal popup={popup} payoutRecords={payoutRecords} onClose={() => setPopup(null)} />
    </div>
  );
}
