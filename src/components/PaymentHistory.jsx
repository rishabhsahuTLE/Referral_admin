import React from 'react';
import './PaymentHistory.css';

function PaymentHistory({ university }) {
  const mockPayments = [
    {
      id: 1,
      datePaid: '18 May 2028',
      student: 'Vikash Deboral',
      referrer: 'Kavya Iyer',
      course: 'MBA Marketing',
      courseUniversity: 'Delhi University',
      amount: '₹5,000',
      siteReference: 'LY65T37HC51',
    },
    {
      id: 2,
      datePaid: '18 May 2028',
      student: 'Arjun Marwai',
      referrer: 'Kavya Iyer',
      course: 'MBA Marketing',
      courseUniversity: 'Delhi University',
      amount: '₹5,000',
      siteReference: 'LY65T37T641',
    },
  ];

  return (
    <div className="payment-history">
      <div className="payment-summary">
        <div className="summary-box">
          <label>Total Disbursed</label>
          <span className="summary-amount">₹10,000</span>
          <p>To date</p>
        </div>
        <div className="summary-box">
          <label>This Month</label>
          <span className="summary-amount">₹10,000</span>
          <p>May 2026</p>
        </div>
        <div className="summary-box">
          <label>Payments Made</label>
          <span className="summary-amount">2</span>
          <p>Recent transactions</p>
        </div>
      </div>

      <div className="payment-ledger">
        <h3 className="ledger-title">Payment Ledger</h3>
        <div className="ledger-container">
          <table className="ledger-table">
            <thead>
              <tr>
                <th>DATE PAID</th>
                <th>STUDENT</th>
                <th>REFERRER</th>
                <th>COURSE / UNIVERSITY</th>
                <th>AMOUNT</th>
                <th>UTR/REFERENCE ID</th>
              </tr>
            </thead>
            <tbody>
              {mockPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>{payment.datePaid}</td>
                  <td className="student-name">{payment.student}</td>
                  <td className="referrer-name">{payment.referrer}</td>
                  <td>
                    <div className="course-info">
                      {payment.course}
                      <br />
                      <small>{payment.courseUniversity}</small>
                    </div>
                  </td>
                  <td className="amount">{payment.amount}</td>
                  <td className="reference">{payment.siteReference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PaymentHistory;
