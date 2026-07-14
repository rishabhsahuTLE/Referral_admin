import React, { useState } from 'react';
import { FiDownload, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import DateRangeFilter from './DateRangeFilter';
import SortBy from './SortBy';
import PayoutExportModal from './PayoutExportModal';
import PayoutStatusPopup, { DEFAULT_NUDGE_MESSAGE } from './PayoutStatusPopup';
import PayoutCommentModal from './PayoutCommentModal';
import './ReferralPayouts.css';

const POC_NAME = 'Rishabh Sahu';
const POC_PHONE = '+91 98765 43210';

function ReferralPayouts({ university }) {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date-newest');
  const [dateRange, setDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [statusPopupItemId, setStatusPopupItemId] = useState(null);
  const [commentPopupItemId, setCommentPopupItemId] = useState(null);

  const calculateDaysAgo = (daysBack) => {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toLocaleDateString('en-IN');
  };

  const buildInitialMockData = () => [
    {
      id: 1,
      student: 'Aditya Verma',
      studentId: 'JH2026STU041',
      referrer: 'Rahul Sharma',
      referrerId: 'JH2023REF018',
      course: 'B.Tech CSE',
      referrerCourse: 'B.Tech CSE',
      enrolledDate: calculateDaysAgo(29),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 29)),
      daysAgo: 29,
      amount: '₹5,000',
      amountValue: 5000,
      status: 'Pending Payout',
      bankDetails: 'Rahul Sharma',
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: '',
    },
    {
      id: 2,
      student: 'Rajesh Pillai',
      studentId: 'JH2026STU058',
      referrer: 'Sneha Patel',
      referrerId: 'JH2023REF027',
      course: 'B.Com',
      referrerCourse: 'B.Com',
      enrolledDate: calculateDaysAgo(22),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 22)),
      daysAgo: 22,
      amount: '₹3,000',
      amountValue: 3000,
      status: 'Bank Details Pending',
      bankDetails: 'Sneha Patel',
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: 'Referrer confirmed they will update bank details by Friday.',
    },
    {
      id: 3,
      student: 'Pradeep Nair',
      studentId: 'JH2026STU073',
      referrer: 'Priya Mehta',
      referrerId: 'JH2023REF033',
      course: 'MBA Finance',
      referrerCourse: 'MBA Marketing',
      enrolledDate: calculateDaysAgo(15),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 15)),
      daysAgo: 15,
      amount: '₹5,000',
      amountValue: 5000,
      status: 'Payment Done',
      bankDetails: 'Priya Mehta',
      paymentInfo: { referenceId: 'TXN-2026-00417', pocName: POC_NAME, pocPhone: POC_PHONE, date: calculateDaysAgo(6) },
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: '',
    },
    {
      id: 4,
      student: 'Sarah Khan',
      studentId: 'JH2026STU091',
      referrer: 'Amit Singh',
      referrerId: 'JH2023REF041',
      course: 'B.Sc Data Science',
      referrerCourse: 'B.Tech AI/ML',
      enrolledDate: calculateDaysAgo(8),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 8)),
      daysAgo: 8,
      amount: '₹4,500',
      amountValue: 4500,
      status: 'Pending Payout',
      bankDetails: 'Amit Singh',
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: '',
    },
    {
      id: 5,
      student: 'Vikram Singh',
      studentId: 'JH2026STU104',
      referrer: 'Neha Gupta',
      referrerId: 'JH2023REF056',
      course: 'B.Tech AI/ML',
      referrerCourse: 'B.Tech AI/ML',
      enrolledDate: calculateDaysAgo(35),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 35)),
      daysAgo: 35,
      amount: '₹6,000',
      amountValue: 6000,
      status: 'Bank Details Pending',
      bankDetails: 'Neha Gupta Sharma',
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "Bank account name mismatch with PAN details — referrer's registered bank name differs from PAN records.",
    },
    {
      id: 6,
      student: 'Karan Mehta',
      studentId: 'JH2026STU117',
      referrer: 'Divya Menon',
      referrerId: 'JH2023REF062',
      course: 'BCA',
      referrerCourse: 'BCA',
      enrolledDate: calculateDaysAgo(12),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 12)),
      daysAgo: 12,
      amount: '₹3,500',
      amountValue: 3500,
      status: 'Pending Payout',
      bankDetails: 'Divya Menon',
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: '',
    },
    {
      id: 7,
      student: 'Ananya Joshi',
      studentId: 'JH2026STU124',
      referrer: 'Karthik Reddy',
      referrerId: 'JH2023REF071',
      course: 'B.Tech ECE',
      referrerCourse: 'B.Tech ECE',
      enrolledDate: calculateDaysAgo(40),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 40)),
      daysAgo: 40,
      amount: '₹5,500',
      amountValue: 5500,
      status: 'Payment Done',
      bankDetails: 'Karthik Reddy',
      paymentInfo: { referenceId: 'TXN-2026-00392', pocName: POC_NAME, pocPhone: POC_PHONE, date: calculateDaysAgo(20) },
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: '',
    },
  ];

  const [mockData, setMockData] = useState(buildInitialMockData);

  const filterDataForTable = () => {
    let filtered = mockData;

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
    let filtered = [...mockData];

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

  const handleMarkPaymentDone = (itemId, referenceId) => {
    const today = calculateDaysAgo(0);
    setMockData((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: 'Payment Done', paymentInfo: { referenceId, pocName: POC_NAME, pocPhone: POC_PHONE, date: today } }
          : item
      )
    );
  };

  const handleMarkBankPending = (itemId) => {
    setMockData((prev) => prev.map((item) => (item.id === itemId ? { ...item, status: 'Bank Details Pending' } : item)));
  };

  const handleNudge = (itemId, message) => {
    setMockData((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, nudge: { message, lastSentAt: new Date() } } : item))
    );
  };

  const handleSaveComment = (itemId, text) => {
    setMockData((prev) => prev.map((item) => (item.id === itemId ? { ...item, comment: text } : item)));
  };

  const tableData = filterDataForTable();
  const stats = calculateStats();
  const statusPopupItem = mockData.find((i) => i.id === statusPopupItemId) ?? null;
  const commentPopupItem = mockData.find((i) => i.id === commentPopupItemId) ?? null;

  return (
    <div className="referral-payouts">
      {/* TOP ROW: controls */}
      <div className="page-header-row">
        <div className="header-controls">
          <DateRangeFilter onDateRangeChange={setDateRange} />
          <SortBy onSortChange={setSortBy} />
        </div>
        <button className="export-download-btn" onClick={() => setShowExportModal(true)}>
          <FiDownload size={16} /> Download
        </button>
      </div>

      {/* STAT TILES ROW */}
      <div className="header-stats">
        <div className="stat-box stat-box-clickable" onClick={() => setActiveTab('all')}>
          <label>Total</label>
          <span className="stat-amount">{stats.totalStudents} students</span>
          <p>{stats.amountDue} due</p>
        </div>
        <div className="stat-box stat-box-clickable" onClick={() => setActiveTab('paymentDone')}>
          <label>Payout Done</label>
          <span className="stat-amount">{stats.paymentDoneCount}</span>
          <p>students</p>
        </div>
        <div className="stat-box stat-box-clickable" onClick={() => setActiveTab('pendingPayout')}>
          <label>Pending Payout</label>
          <span className="stat-amount">{stats.pendingPayoutCount}</span>
          <p>students</p>
        </div>
        <div className="stat-box stat-box-clickable urgent-stat" onClick={() => setActiveTab('bankDetailsPending')}>
          <label>Bank Details Pending</label>
          <span className="stat-amount" style={{ color: 'var(--danger)' }}>{stats.bankDetailsPendingCount}</span>
          <p>students</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab tab-even ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
            All
          </button>
          <button
            className={`tab tab-even ${activeTab === 'paymentDone' ? 'active' : ''}`}
            onClick={() => setActiveTab('paymentDone')}
          >
            Payout Done
          </button>
          <button
            className={`tab tab-even ${activeTab === 'pendingPayout' ? 'active' : ''}`}
            onClick={() => setActiveTab('pendingPayout')}
          >
            Pending Payout
          </button>
          <button
            className={`tab tab-even ${activeTab === 'bankDetailsPending' ? 'active' : ''}`}
            onClick={() => setActiveTab('bankDetailsPending')}
          >
            Bank Details Pending
          </button>
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
              <th>STATUS</th>
              <th>COMMENT</th>
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
                <td className="bank-details">{item.bankDetails}</td>
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

      {/* EXPORT MODAL */}
      <PayoutExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} records={tableData} />

      {/* STATUS UPDATE POPUP */}
      <PayoutStatusPopup
        item={statusPopupItem}
        onClose={() => setStatusPopupItemId(null)}
        onMarkPaymentDone={handleMarkPaymentDone}
        onMarkBankPending={handleMarkBankPending}
        onNudge={handleNudge}
      />

      {/* COMMENT MODAL */}
      <PayoutCommentModal
        item={commentPopupItem}
        onClose={() => setCommentPopupItemId(null)}
        onSave={handleSaveComment}
      />
    </div>
  );
}

export default ReferralPayouts;
