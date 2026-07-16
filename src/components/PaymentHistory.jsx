import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { downloadCSV } from '../utils/csv';
import { buildPaidPayoutRows } from '../utils/paymentHistoryRows';
import './PaymentHistory.css';

function PaymentHistory({ data, payoutRecords = [] }) {
  const rows = buildPaidPayoutRows(payoutRecords, data.programs);

  const totalDisbursed = payoutRecords
    .filter((item) => item.status === 'Payment Done')
    .reduce((sum, item) => sum + item.amountValue, 0);

  const handleDownload = () => {
    const headerRow1 = ['Referrer Details', '', '', '', '', 'Referee Details', '', '', '', ''];
    const headerRow2 = [
      'Name', 'Course', 'Enrollment No', 'Payment Amount', 'Date of Payment',
      'Name', 'Course', 'Enrollment No', 'Discount (%)', 'Enrollment Date',
    ];
    const dataRows = rows.map((r) => [
      r.referrerName, r.referrerCourse, r.referrerEnrollNo, r.paymentAmount, r.datePaid,
      r.refereeName, r.refereeCourse, r.refereeEnrollNo, `${r.discountPct}%`, r.enrolledDate,
    ]);
    downloadCSV('payment-history.csv', [headerRow1, headerRow2, ...dataRows]);
  };

  return (
    <div className="payment-history">
      <div className="payment-summary">
        <div className="summary-box">
          <label>Total Disbursed</label>
          <span className="summary-amount">₹{totalDisbursed.toLocaleString('en-IN')}</span>
          <p>To date</p>
        </div>
        <div className="summary-box">
          <label>Payments Made</label>
          <span className="summary-amount">{rows.length}</span>
          <p>Paid referrals</p>
        </div>
      </div>

      <div className="payment-ledger">
        <div className="ledger-header-row">
          <h3 className="ledger-title">Payment History</h3>
          <button className="ledger-download-btn" onClick={handleDownload} title="Download CSV" aria-label="Download CSV">
            <FiDownload size={16} />
          </button>
        </div>
        <div className="ledger-container">
          <table className="ledger-table grouped-table">
            <thead>
              <tr>
                <th colSpan={5} className="group-header">Referrer Details</th>
                <th colSpan={5} className="group-header">Referee Details</th>
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
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="referrer-name">{r.referrerName}</td>
                  <td>{r.referrerCourse}</td>
                  <td>{r.referrerEnrollNo}</td>
                  <td className="amount">{r.paymentAmount}</td>
                  <td>{r.datePaid}</td>
                  <td className="student-name">{r.refereeName}</td>
                  <td>{r.refereeCourse}</td>
                  <td>{r.refereeEnrollNo}</td>
                  <td>{r.discountPct}%</td>
                  <td>{r.enrolledDate}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
                    No payments recorded yet for this university.
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

export default PaymentHistory;
