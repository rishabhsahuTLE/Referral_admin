import React from 'react';
import { FiX } from 'react-icons/fi';
import { buildPaidPayoutRows } from '../utils/paymentHistoryRows';
import './ComprehensiveReportModal.css';

// Leads Generated / Drop off: one row per referee referred into this course, sourced
// from the university's refereeReports (the same records the table counts come from).
function buildFunnelRows(uni, courseName, column) {
  const refereeReports = uni.refereeReports || [];
  const reports = uni.reports || [];
  const programs = uni.programs || [];
  const prog = programs.find((p) => p.name === courseName);

  return refereeReports
    .filter((r) => r.refereeCourse === courseName && (column === 'dropOff' ? r.applicationStatus === 'Dropped' : true))
    .map((r) => {
      const referrerReport = reports.find((rep) => rep.student === r.referrerName);
      return {
        referrerName: r.referrerName,
        referrerEnrollNo: referrerReport?.enrollmentNo ?? '-',
        refereeName: r.refereeName,
        refereeCourse: r.refereeCourse,
        leadDate: r.leadDate,
        status: r.applicationStatus,
        amount: prog ? `₹${prog.referrerIncentive.toLocaleString('en-IN')}` : '-',
        discount: prog ? `${prog.refereeDiscount}%` : '-',
        dropReason: r.dropReason ?? '-',
      };
    });
}

const COLUMN_LABELS = {
  leads: 'Leads Generated',
  converted: 'Admissions Converted',
  dropOff: 'Drop off',
};

export default function ComprehensiveReportModal({ popup, payoutRecords, onClose }) {
  if (!popup) return null;
  const { uni, courseName, column } = popup;

  const funnelRows = column !== 'converted' ? buildFunnelRows(uni, courseName, column) : [];
  const paidRows =
    column === 'converted'
      ? buildPaidPayoutRows(payoutRecords, uni.programs).filter((r) => r.refereeCourse === courseName)
      : [];

  return (
    <div
      className="cr-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cr-modal-card">
        <div className="cr-modal-header">
          <div>
            <div className="cr-modal-title">{COLUMN_LABELS[column]}</div>
            <div className="cr-modal-subtitle">{uni.name} · {courseName}</div>
          </div>
          <button className="cr-modal-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="cr-modal-body">
          {column === 'converted' ? (
            <div className="cr-modal-table-wrapper">
            <table className="cr-modal-table">
              <thead>
                <tr>
                  <th colSpan={5} className="cr-group-header">Referrer Details</th>
                  <th colSpan={5} className="cr-group-header">Referee Details</th>
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Enrollment No</th>
                  <th>Payment Amount</th>
                  <th>Date of Payment</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Enrollment No.</th>
                  <th>Discount (%)</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {paidRows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.referrerName}</td>
                    <td>{r.referrerCourse}</td>
                    <td>{r.referrerEnrollNo}</td>
                    <td>{r.paymentAmount}</td>
                    <td>{r.datePaid}</td>
                    <td>{r.refereeName}</td>
                    <td>{r.refereeCourse}</td>
                    <td>{r.refereeEnrollNo}</td>
                    <td>{r.discountPct}%</td>
                    <td>{r.enrolledDate}</td>
                  </tr>
                ))}
                {paidRows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="cr-modal-empty">No paid admissions for this course yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          ) : (
            <div className="cr-modal-table-wrapper">
            <table className="cr-modal-table">
              <thead>
                <tr>
                  <th colSpan={2} className="cr-group-header">Referrer Details</th>
                  <th colSpan={6} className="cr-group-header">Referee Details</th>
                  {column === 'dropOff' && <th className="cr-group-header">Reason of Drop-off</th>}
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Enrollment ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Date Lead Generated</th>
                  <th>Status</th>
                  <th>Amount (Referrer)</th>
                  <th>Discount (Referee)</th>
                  {column === 'dropOff' && <th>Reason</th>}
                </tr>
              </thead>
              <tbody>
                {funnelRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.referrerName}</td>
                    <td>{r.referrerEnrollNo}</td>
                    <td>{r.refereeName}</td>
                    <td>{r.refereeCourse}</td>
                    <td>{r.leadDate}</td>
                    <td>{r.status}</td>
                    <td>{r.amount}</td>
                    <td>{r.discount}</td>
                    {column === 'dropOff' && <td>{r.dropReason}</td>}
                  </tr>
                ))}
                {funnelRows.length === 0 && (
                  <tr>
                    <td colSpan={column === 'dropOff' ? 9 : 8} className="cr-modal-empty">No records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
