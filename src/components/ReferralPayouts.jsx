import React, { useState } from 'react';
import { FiDownload, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import DateRangeFilter from './DateRangeFilter';
import SortBy from './SortBy';
import PayoutExportModal from './PayoutExportModal';
import PayoutStatusPopup from './PayoutStatusPopup';
import PayoutCommentModal from './PayoutCommentModal';
import './ReferralPayouts.css';

function ReferralPayouts({ records, onMarkPaymentDone, onMarkBankPending, onNudge, onSaveComment }) {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date-newest');
  const [dateRange, setDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [statusPopupItemId, setStatusPopupItemId] = useState(null);
  const [commentPopupItemId, setCommentPopupItemId] = useState(null);

  const filterDataForTable = () => {
    let filtered = records;

    switch (activeTab) {
      case 'paymentDone':
        filtered = filtered.filter((item) => item.status === 'Payment Done');
        break;
      case 'pendingPayout':
        filtered = filtered.filter((item) => item.status === 'Pending Payout');
        break;
      case 'bankDetailsPending':
        filtered = filtered.filter((item) => item.status === 'Bank Details Pending');
        break;
      case 'all':
      default:
        break;
    }

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = item.enrolledDateObj;
        return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
      });
    }

    return sortData(filtered);
  };

  const filterDataForStats = () => {
    let filtered = [...records];

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      filtered = filtered.filter((item) => {
        const itemDate = item.enrolledDateObj;
        return itemDate >= dateRange.startDate && itemDate <= dateRange.endDate;
      });
    }

    return filtered;
  };

  const sortData = (data) => {
    const dataCopy = [...data];

    switch (sortBy) {
      case 'date-newest':
        return dataCopy.sort((a, b) => b.enrolledDateObj - a.enrolledDateObj);
      case 'date-oldest':
        return dataCopy.sort((a, b) => a.enrolledDateObj - b.enrolledDateObj);
      case 'amount-high':
        return dataCopy.sort((a, b) => b.amountValue - a.amountValue);
      case 'amount-low':
        return dataCopy.sort((a, b) => a.amountValue - b.amountValue);
      case 'name-asc':
        return dataCopy.sort((a, b) => a.student.localeCompare(b.student));
      case 'name-desc':
        return dataCopy.sort((a, b) => b.student.localeCompare(a.student));
      case 'status':
        return dataCopy.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return dataCopy;
    }
  };

  const calculateStats = () => {
    const statsData = filterDataForStats();

    const totalStudents = statsData.length;
    const amountDue = statsData
      .filter((item) => item.status !== 'Payment Done')
      .reduce((sum, item) => sum + item.amountValue, 0);
    const paymentDoneCount = statsData.filter((item) => item.status === 'Payment Done').length;
    const pendingPayoutCount = statsData.filter((item) => item.status === 'Pending Payout').length;
    const bankDetailsPendingCount = statsData.filter((item) => item.status === 'Bank Details Pending').length;

    return {
      totalStudents,
      amountDue: `₹${amountDue.toLocaleString('en-IN')}`,
      paymentDoneCount,
      pendingPayoutCount,
      bankDetailsPendingCount,
    };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending Payout':
        return '#ffa500';
      case 'Bank Details Pending':
        return '#dc2626';
      case 'Payment Done':
        return '#0d9488';
      default:
        return '#808080';
    }
  };

  const tableData = filterDataForTable();
  const stats = calculateStats();
  const statusPopupItem = records.find((i) => i.id === statusPopupItemId) ?? null;
  const commentPopupItem = records.find((i) => i.id === commentPopupItemId) ?? null;

  return (
    <div className="referral-payouts">
      {/* TOP ROW: controls */}
      <div className="page-header-row">
        <div className="header-controls">
          <DateRangeFilter onDateRangeChange={setDateRange} />
          <SortBy onSortChange={setSortBy} />
        </div>
        {/* Download option temporarily disabled */}
        {false && (
          <button className="export-download-btn" onClick={() => setShowExportModal(true)}>
            <FiDownload size={16} /> Download
          </button>
        )}
      </div>

      {/* STAT TILES ROW — these now double as the tab filter (the old tab bar was removed) */}
      <div className="header-stats">
        <div
          className={`stat-box stat-box-clickable ${activeTab === 'all' ? 'stat-box-active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <label>Total</label>
          <span className="stat-amount">{stats.totalStudents} students</span>
          <p>{stats.amountDue} due</p>
        </div>
        <div
          className={`stat-box stat-box-clickable ${activeTab === 'paymentDone' ? 'stat-box-active' : ''}`}
          onClick={() => setActiveTab('paymentDone')}
        >
          <label>Payout Done</label>
          <span className="stat-amount">{stats.paymentDoneCount}</span>
          <p>students</p>
        </div>
        <div
          className={`stat-box stat-box-clickable ${activeTab === 'pendingPayout' ? 'stat-box-active' : ''}`}
          onClick={() => setActiveTab('pendingPayout')}
        >
          <label>Pending Payout</label>
          <span className="stat-amount">{stats.pendingPayoutCount}</span>
          <p>students</p>
        </div>
        <div
          className={`stat-box stat-box-clickable urgent-stat ${activeTab === 'bankDetailsPending' ? 'stat-box-active' : ''}`}
          onClick={() => setActiveTab('bankDetailsPending')}
        >
          <label>Bank Details Pending</label>
          <span className="stat-amount" style={{ color: 'var(--danger)' }}>{stats.bankDetailsPendingCount}</span>
          <p>students</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>REFEREE</th>
              <th>COURSE</th>
              <th>ENROLLED ON</th>
              <th>BANK DETAILS</th>
              <th>AMOUNT</th>
              <th className="status-th">STATUS</th>
              <th>REMARKS</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr key={item.id} className={`table-row ${item.status === 'Bank Details Pending' ? 'bank-pending-row' : ''}`}>
                <td className="student-name">{item.referrer}</td>
                <td className="referrer-name">{item.student}</td>
                <td className="course-name">{item.course}</td>
                <td className="enrolled-date">
                  {item.enrolledDate}
                  <br />
                  <small>{item.daysAgo} days ago</small>
                </td>
                <td className="bank-details">
                  {item.paymentInfo && (item.paymentInfo.transactionId || item.paymentInfo.utrNumber) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {item.paymentInfo.transactionId && (
                        <span>{item.paymentInfo.transactionId} <small style={{ color: '#999' }}>(Transaction ID)</small></span>
                      )}
                      {item.paymentInfo.utrNumber && (
                        <span>{item.paymentInfo.utrNumber} <small style={{ color: '#999' }}>(UTR)</small></span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: '#999' }}>—</span>
                  )}
                </td>
                <td className="amount">{item.amount}</td>
                <td className="stage-cell">
                  <span
                    className="stage-badge stage-badge-clickable"
                    style={{ backgroundColor: getStatusColor(item.status), color: 'white' }}
                    onClick={() => setStatusPopupItemId(item.id)}
                    title="Update payout status"
                  >
                    {item.status}
                    <FiEdit2 size={12} />
                  </span>
                </td>
                <td className="comment-cell">
                  <button
                    className={`comment-btn ${item.comment ? 'has-comment' : ''}`}
                    onClick={() => setCommentPopupItemId(item.id)}
                    title={item.comment ? 'View / edit remark' : 'Add a remark'}
                  >
                    <FiMessageSquare size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="records-count">{tableData.length} records</div>

      {/* EXPORT MODAL — unreachable while the download option above is disabled */}
      <PayoutExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} records={tableData} />

      {/* STATUS UPDATE POPUP */}
      <PayoutStatusPopup
        item={statusPopupItem}
        onClose={() => setStatusPopupItemId(null)}
        onMarkPaymentDone={onMarkPaymentDone}
        onMarkBankPending={onMarkBankPending}
        onNudge={onNudge}
      />

      {/* COMMENT MODAL */}
      <PayoutCommentModal
        item={commentPopupItem}
        onClose={() => setCommentPopupItemId(null)}
        onSave={onSaveComment}
      />
    </div>
  );
}

export default ReferralPayouts;
