import React from 'react';
import { FiX } from 'react-icons/fi';
import './ComprehensiveReportModal.css';
import { getRefereePayment } from '../utils/dashboardMetrics';

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

// Leads Generated / Drop off: one row per referee referred into this course (or, when
// courseName is null — the university total was clicked — every course), sourced from
// the university's refereeReports (the same records the table counts come from).
function buildFunnelRows(uni, courseName, column, courseNames) {
  const refereeReports = uni.refereeReports || [];
  const reports = uni.reports || [];
  const programs = uni.programs || [];

  return refereeReports
    .filter((r) => (courseName ? r.refereeCourse === courseName : courseNames ? courseNames.includes(r.refereeCourse) : true) && (column === 'dropOff' ? r.applicationStatus === 'Dropped' : true))
    .map((r) => {
      const referrerReport = reports.find((rep) => rep.student === r.referrerName);
      const prog = programs.find((p) => p.name === r.refereeCourse);
      const pay = getRefereePayment(r, programs);
      return {
        referrerName: r.referrerName,
        referrerEnrollNo: referrerReport?.enrollmentNo ?? '-',
        paymentType: pay?.paymentTypeLabel ?? '-',
        refereeName: r.refereeName,
        refereeCourse: r.refereeCourse,
        leadDate: r.leadDate,
        status: r.applicationStatus,
        amount: prog ? `₹${prog.referrerIncentive.toLocaleString('en-IN')}` : '-',
        discount: pay ? `${pay.discountPct}% · ${inr(pay.discount)}` : prog ? `${prog.refereeDiscount}%` : '-',
        dropReason: r.dropReason ?? '-',
      };
    });
}

// Admissions Converted: every Enrolled referee for this course (or every course, when
// courseName is null), in the same Referrer/Referee Details layout as Payment History —
// but it doesn't require an actual payout record to show up here (that's a separate,
// later step), so unpaid ones just read "Payment Pending" under Date of Payment instead
// of being excluded.
function buildConvertedRows(uni, courseName, payoutRecords, courseNames) {
  const refereeReports = uni.refereeReports || [];
  const reports = uni.reports || [];
  const programs = uni.programs || [];

  return refereeReports
    .filter((r) => (courseName ? r.refereeCourse === courseName : courseNames ? courseNames.includes(r.refereeCourse) : true) && r.applicationStatus === 'Enrolled')
    .map((r) => {
      const referrerReport = reports.find((rep) => rep.student === r.referrerName);
      const prog = programs.find((p) => p.name === r.refereeCourse);
      const pay = getRefereePayment(r, programs);
      const matchingPayout = payoutRecords.find(
        (p) => p.status === 'Payment Done' && p.referrer === r.referrerName && p.student === r.refereeName && p.course === r.refereeCourse
      );
      return {
        referrerName: r.referrerName,
        referrerCourse: r.referrerCourse,
        referrerEnrollNo: referrerReport?.enrollmentNo ?? '-',
        paymentAmount: prog ? `₹${prog.referrerIncentive.toLocaleString('en-IN')}` : '-',
        datePaid: matchingPayout ? matchingPayout.paymentInfo.date : 'Payment Pending',
        refereeName: r.refereeName,
        refereeCourse: r.refereeCourse,
        refereeEnrollNo: r.refereeEnrollNo,
        discountPct: pay ? pay.discountPct : prog ? prog.refereeDiscount : 0,
        paymentType: pay?.paymentTypeLabel ?? '-',
        discountAmount: pay ? inr(pay.discount) : '-',
        firstPayable: pay ? inr(pay.payable) : '-',
        enrolledDate: r.enrollDate ?? r.leadDate,
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
  const { uni, courseName, column, courseNames = null } = popup;

  const funnelRows = column !== 'converted' ? buildFunnelRows(uni, courseName, column, courseNames) : [];
  const convertedRows = column === 'converted' ? buildConvertedRows(uni, courseName, payoutRecords, courseNames) : [];

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
            <div className="cr-modal-subtitle">{uni.name} · {courseName ?? (courseNames ? courseNames.join(', ') : 'All Courses')}</div>
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
                  <th colSpan={8} className="cr-group-header">Referee Details</th>
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
                  <th>Payment Type</th>
                  <th>Discount</th>
                  <th>First Payment Paid</th>
                  <th>Enrollment Date</th>
                </tr>
              </thead>
              <tbody>
                {convertedRows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.referrerName}</td>
                    <td>{r.referrerCourse}</td>
                    <td>{r.referrerEnrollNo}</td>
                    <td>{r.paymentAmount}</td>
                    <td>{r.datePaid}</td>
                    <td>{r.refereeName}</td>
                    <td>{r.refereeCourse}</td>
                    <td>{r.refereeEnrollNo}</td>
                    <td>{r.paymentType}</td>
                    <td>{r.discountPct}% · {r.discountAmount}</td>
                    <td>{r.firstPayable}</td>
                    <td>{r.enrolledDate}</td>
                  </tr>
                ))}
                {convertedRows.length === 0 && (
                  <tr>
                    <td colSpan={13} className="cr-modal-empty">No converted admissions for this course yet.</td>
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
                  <th colSpan={7} className="cr-group-header">Referee Details</th>
                  {column === 'dropOff' && <th className="cr-group-header">Reason of Drop-off</th>}
                </tr>
                <tr>
                  <th>Name</th>
                  <th>Enrollment ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Date Lead Generated</th>
                  <th>Status</th>
                  <th>Payment Type</th>
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
                    <td>{r.paymentType}</td>
                    <td>{r.amount}</td>
                    <td>{r.discount}</td>
                    {column === 'dropOff' && <td>{r.dropReason}</td>}
                  </tr>
                ))}
                {funnelRows.length === 0 && (
                  <tr>
                    <td colSpan={column === 'dropOff' ? 10 : 9} className="cr-modal-empty">No records found.</td>
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
