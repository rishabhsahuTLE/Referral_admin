import React, { useState } from 'react';
import { FiFlag, FiDownload, FiEdit2, FiMessageSquare } from 'react-icons/fi';
import DateRangeFilter from './DateRangeFilter';
import SortBy from './SortBy';
import PayoutExportModal from './PayoutExportModal';
import PayoutStagePopup from './PayoutStagePopup';
import './ReferralPayouts.css';

function ReferralPayouts({ university }) {
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('date-newest');
  const [dateRange, setDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [stagePopupItemId, setStagePopupItemId] = useState(null);
  const [noteOpenId, setNoteOpenId] = useState(null);

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
      stage: 'Doc Verification',
      bankDetails: 'Rahul Sharma',
      isFlagged: true,
      flagDescription:
        'Referrer has not submitted updated address proof since 25th May; documents pending verification.',
      stageHistory: { docVerification: null, bankVerification: null, payment: null },
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
      stage: 'Bank Verification',
      bankDetails: 'Sneha Patel',
      isFlagged: false,
      flagDescription: '',
      stageHistory: {
        docVerification: { date: calculateDaysAgo(18), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        bankVerification: null,
        payment: null,
      },
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
      stage: 'Payment Pending',
      bankDetails: 'Priya Mehta',
      isFlagged: false,
      flagDescription: '',
      stageHistory: {
        docVerification: { date: calculateDaysAgo(11), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        bankVerification: { date: calculateDaysAgo(6), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        payment: null,
      },
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
      stage: 'Doc Verification',
      bankDetails: 'Amit Singh',
      isFlagged: false,
      flagDescription: '',
      stageHistory: { docVerification: null, bankVerification: null, payment: null },
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
      stage: 'Bank Verification',
      bankDetails: 'Neha Gupta Sharma',
      isFlagged: true,
      flagDescription:
        "Bank account name mismatch with PAN details — referrer's registered bank name differs from PAN records. Awaiting correction before proceeding.",
      stageHistory: {
        docVerification: { date: calculateDaysAgo(31), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        bankVerification: null,
        payment: null,
      },
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
      stage: 'Bank Verification',
      bankDetails: 'Divya Menon',
      isFlagged: true,
      flagDescription:
        'Referrer flagged for a bank account number that matches another active referral payout — needs manual reconciliation before proceeding.',
      stageHistory: {
        docVerification: { date: calculateDaysAgo(8), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        bankVerification: null,
        payment: null,
      },
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
      stage: 'Payment Pending',
      bankDetails: 'Karthik Reddy',
      isFlagged: true,
      flagDescription:
        'Referrer requested a payout hold pending confirmation of updated PAN card — do not release payment until resolved.',
      stageHistory: {
        docVerification: { date: calculateDaysAgo(36), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        bankVerification: { date: calculateDaysAgo(31), pocName: 'Rishabh Sahu', pocPhone: '+91 98765 43210', reference: '' },
        payment: null,
      },
    },
  ];

  const [mockData, setMockData] = useState(buildInitialMockData);

  const filterDataForTable = () => {
    let filtered = mockData;

    switch (activeTab) {
      case 'docVerification':
        filtered = filtered.filter((item) => item.stage === 'Doc Verification');
        break;
      case 'bankVerification':
        filtered = filtered.filter((item) => item.stage === 'Bank Verification');
        break;
      case 'paymentPending':
        filtered = filtered.filter((item) => item.stage === 'Payment Pending');
        break;
      case 'flagged':
        filtered = filtered.filter((item) => item.isFlagged);
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

    filtered = sortData(filtered);

    // Always push flagged items to the top, preserving relative order within each group
    const flaggedItems = filtered.filter((item) => item.isFlagged);
    const nonFlaggedItems = filtered.filter((item) => !item.isFlagged);
    return [...flaggedItems, ...nonFlaggedItems];
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
      case 'stage':
        return dataCopy.sort((a, b) => a.stage.localeCompare(b.stage));
      case 'flagged':
        return dataCopy.sort((a, b) => (b.isFlagged ? 1 : 0) - (a.isFlagged ? 1 : 0));
      default:
        return dataCopy;
    }
  };

  const calculateStats = () => {
    const statsData = filterDataForStats();

    // "Paid" records are settled — excluded from outstanding due totals.
    const totalDue = mockData
      .filter((item) => item.stage !== 'Paid')
      .reduce((sum, item) => sum + item.amountValue, 0);
    const filteredDue = statsData
      .filter((item) => item.stage !== 'Paid')
      .reduce((sum, item) => sum + item.amountValue, 0);
    const bankIssues = statsData.filter((item) => item.stage === 'Bank Verification').length;
    const pendingVerification = statsData.filter(
      (item) => item.stage === 'Doc Verification'
    ).length;

    // Dynamic duration label
    let durationLabel;
    let durationSubtext;
    const formatShortDate = (d) =>
      d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      durationLabel = 'Selected Duration';
      durationSubtext = `${formatShortDate(dateRange.startDate)} – ${formatShortDate(dateRange.endDate)}`;
    } else {
      const now = new Date();
      durationLabel = 'This Month';
      durationSubtext = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    }

    return {
      totalDue: `₹${totalDue.toLocaleString('en-IN')}`,
      filteredDue: `₹${filteredDue.toLocaleString('en-IN')}`,
      durationLabel,
      durationSubtext,
      bankIssues,
      pendingVerification,
    };
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Doc Verification':
        return '#ffa500';
      case 'Bank Verification':
        return '#4169e1';
      case 'Payment Pending':
        return '#32cd32';
      case 'Paid':
        return '#0d9488';
      default:
        return '#808080';
    }
  };

  const handleStageAdvance = (itemId, { newStage, historyKey, date, pocPhone, reference }) => {
    setMockData((prev) =>
      prev.map((item) =>
        item.id !== itemId
          ? item
          : {
              ...item,
              stage: newStage,
              stageHistory: {
                ...item.stageHistory,
                [historyKey]: { date, pocName: 'Rishabh Sahu', pocPhone, reference },
              },
            }
      )
    );
  };

  const handleFlag = (itemId, description) => {
    setMockData((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, isFlagged: true, flagDescription: description } : item
      )
    );
  };

  const tableData = filterDataForTable();
  const stats = calculateStats();
  const stagePopupItem = mockData.find((i) => i.id === stagePopupItemId) ?? null;

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
        <div className="stat-box">
          <label>Total Due</label>
          <span className="stat-amount">{stats.totalDue}</span>
          <p>Amount</p>
        </div>
        <div className="stat-box">
          <label>{stats.durationLabel}</label>
          <span className="stat-amount">{stats.filteredDue}</span>
          <p>{stats.durationSubtext}</p>
        </div>
        <div className="stat-box urgent-stat">
          <label>Bank Issues</label>
          <span className="stat-amount">{stats.bankIssues}</span>
          <p>Pending verification</p>
        </div>
        <div className="stat-box">
          <label>Pending Verification</label>
          <span className="stat-amount">{stats.pendingVerification}</span>
          <p>Sort to upload</p>
        </div>
      </div>

      {/* TABS */}
      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab tab-all ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
          <button
            className={`tab tab-step ${activeTab === 'docVerification' ? 'active' : ''}`}
            onClick={() => setActiveTab('docVerification')}
          >
            Doc Verification
          </button>
          <span className="tab-arrow">→</span>
          <button
            className={`tab tab-step ${activeTab === 'bankVerification' ? 'active' : ''}`}
            onClick={() => setActiveTab('bankVerification')}
          >
            Bank Verification
          </button>
          <span className="tab-arrow">→</span>
          <button
            className={`tab tab-step ${activeTab === 'paymentPending' ? 'active' : ''}`}
            onClick={() => setActiveTab('paymentPending')}
          >
            Payment Pending
          </button>
          <button
            className={`tab tab-flagged ${activeTab === 'flagged' ? 'active' : ''}`}
            onClick={() => setActiveTab('flagged')}
          >
            Flagged
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
              <th>STAGE</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr
                key={item.id}
                className={`table-row ${item.isFlagged ? 'flagged-row' : ''}`}
              >
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
                    style={{
                      backgroundColor: getStageColor(item.stage),
                      color: 'white',
                    }}
                    onClick={() => setStagePopupItemId(item.id)}
                    title="Update payout stage"
                  >
                    {item.stage}
                    <FiEdit2 size={12} style={{ marginLeft: '6px' }} />
                  </span>
                  {item.isFlagged && (
                    <span className="stage-flag-indicators">
                      <FiFlag size={14} className="stage-flag-icon" title="Flagged" />
                      <button
                        className="stage-note-btn"
                        onClick={() => setNoteOpenId((v) => (v === item.id ? null : item.id))}
                        onBlur={() => setNoteOpenId(null)}
                        title="View flag reason"
                      >
                        <FiMessageSquare size={14} />
                      </button>
                      {noteOpenId === item.id && (
                        <div className="stage-note-popover">{item.flagDescription}</div>
                      )}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="records-count">{tableData.length} records</div>

      {/* EXPORT MODAL */}
      <PayoutExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        records={tableData}
      />

      {/* STAGE UPDATE POPUP */}
      <PayoutStagePopup
        item={stagePopupItem}
        onClose={() => setStagePopupItemId(null)}
        onStageAdvance={handleStageAdvance}
        onFlag={handleFlag}
      />
    </div>
  );
}

export default ReferralPayouts;
