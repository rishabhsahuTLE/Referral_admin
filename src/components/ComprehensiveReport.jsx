import React, { useState } from 'react';
import ComprehensiveReportModal from './ComprehensiveReportModal';
import './ComprehensiveReport.css';

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

function sumStats(stats) {
  return stats.reduce(
    (acc, s) => ({ leads: acc.leads + s.leads, converted: acc.converted + s.converted, dropOff: acc.dropOff + s.dropOff }),
    { leads: 0, converted: 0, dropOff: 0 }
  );
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
              <th>Course</th>
              <th>Leads Generated</th>
              <th>Admissions Converted</th>
              <th>Drop off</th>
            </tr>
          </thead>
          <tbody>
            {universities.map((uni) => {
              const stats = computeCourseStats(uni);
              const totals = sumStats(stats);
              return (
                <React.Fragment key={uni.id}>
                  <tr className="cr-total-row">
                    <td>{uni.name} · {stats.length} Course{stats.length !== 1 ? 's' : ''}</td>
                    <td>
                      <button className="report-link-btn" onClick={() => setPopup({ uni, courseName: null, column: 'leads' })}>
                        {totals.leads}
                      </button>
                    </td>
                    <td>
                      <button
                        className="report-link-btn"
                        style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)' }}
                        onClick={() => setPopup({ uni, courseName: null, column: 'converted' })}
                      >
                        {totals.converted}
                      </button>
                    </td>
                    <td>
                      <button
                        className="report-link-btn"
                        style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)' }}
                        onClick={() => setPopup({ uni, courseName: null, column: 'dropOff' })}
                      >
                        {totals.dropOff}
                      </button>
                    </td>
                  </tr>
                  {stats.map((row) => (
                    <tr key={row.course}>
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
