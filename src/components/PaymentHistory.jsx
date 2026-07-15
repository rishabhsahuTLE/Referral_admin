import React from 'react';
import './PaymentHistory.css';

// Builds the payment ledger from this university's own referee/programme data instead of
// disconnected placeholder names, so the numbers here reconcile with Reports and Referral
// Payouts rather than referencing students/universities that don't exist anywhere else.
function buildPaymentLedger(data) {
  const { refereeReports = [], programs = [], name: universityName } = data;

  const incentiveByCourse = {};
  programs.forEach((p) => {
    incentiveByCourse[p.name] = p.referrerIncentive;
  });

  const daysAgoOptions = [4, 9, 14, 19, 24, 29];

  return refereeReports
    .filter((r) => r.applicationStatus === 'Enrolled')
    .slice(0, 6)
    .map((r, i) => {
      const daysAgo = daysAgoOptions[i % daysAgoOptions.length];
      const datePaid = new Date(Date.now() - daysAgo * 86400000).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const amountValue = incentiveByCourse[r.refereeCourse] ?? 5000;

      return {
        id: i + 1,
        datePaid,
        student: r.refereeName,
        referrer: r.referrerName,
        course: r.refereeCourse,
        courseUniversity: universityName,
        amountValue,
        amount: `₹${amountValue.toLocaleString('en-IN')}`,
        siteReference: `UTR${new Date().getFullYear()}${String(1000 + i * 37)}X`,
      };
    });
}

function PaymentHistory({ data }) {
  const payments = buildPaymentLedger(data);

  const totalDisbursed = payments.reduce((sum, p) => sum + p.amountValue, 0);
  const now = new Date();
  const thisMonthTotal = payments
    .filter((p) => {
      const [, monStr, yr] = p.datePaid.split(' ');
      return `${monStr} ${yr}` === now.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    })
    .reduce((sum, p) => sum + p.amountValue, 0);

  return (
    <div className="payment-history">
      <div className="payment-summary">
        <div className="summary-box">
          <label>Total Disbursed</label>
          <span className="summary-amount">₹{totalDisbursed.toLocaleString('en-IN')}</span>
          <p>To date</p>
        </div>
        <div className="summary-box">
          <label>This Month</label>
          <span className="summary-amount">₹{thisMonthTotal.toLocaleString('en-IN')}</span>
          <p>{now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="summary-box">
          <label>Payments Made</label>
          <span className="summary-amount">{payments.length}</span>
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
              {payments.map((payment) => (
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
              {payments.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#999' }}>
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
