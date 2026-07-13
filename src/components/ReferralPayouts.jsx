import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FiFlag, FiDownload } from 'react-icons/fi';
import DateRangeFilter from './DateRangeFilter';
import SortBy from './SortBy';
import PayoutExportModal from './PayoutExportModal';
import './ReferralPayouts.css';

function ReferralPayouts({ university }) {
  const [activeTab, setActiveTab] = useState('all');
  const [flaggedItems, setFlaggedItems] = useState(new Set());
  const [sortBy, setSortBy] = useState('date-newest');
  const [dateRange, setDateRange] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItemId, setModalItemId] = useState(null);
  const [modalText, setModalText] = useState('');
  const [modalOriginalText, setModalOriginalText] = useState('');
  const [descriptions, setDescriptions] = useState({});
  const modalRef = useRef(null);

  const calculateDaysAgo = (daysBack) => {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    return date.toLocaleDateString('en-IN');
  };

  const mockData = [
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
      isUrgent: true,
      description: 'Documents pending since 25th May. Student has not submitted updated address proof.',
      bankDetails: 'Aditya Verma',
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
      isUrgent: false,
      description: 'Bank details verification in progress. Waiting for bank confirmation.',
      bankDetails: 'Rajesh Kumar',
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
      isUrgent: false,
      description: '',
      bankDetails: 'Pradeep Nair',
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
      isUrgent: false,
      description: '',
      bankDetails: 'Sarah Khan',
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
      isUrgent: true,
      description: 'Bank account mismatch with PAN details. Awaiting student correction.',
      bankDetails: 'Vikram Kumar Singh',
    },
  ];

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

    // Always push urgent items to the top, preserving relative order within urgent/non-urgent
    const urgentItems = filtered.filter((item) => item.isUrgent);
    const nonUrgentItems = filtered.filter((item) => !item.isUrgent);
    return [...urgentItems, ...nonUrgentItems];
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
      case 'urgent':
        return dataCopy.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
      default:
        return dataCopy;
    }
  };

  const calculateStats = () => {
    const statsData = filterDataForStats();

    const totalDue = mockData.reduce((sum, item) => sum + item.amountValue, 0);
    const filteredDue = statsData.reduce((sum, item) => sum + item.amountValue, 0);
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
      default:
        return '#808080';
    }
  };

  const getTabKeyForStage = (stage) => {
    switch (stage) {
      case 'Doc Verification':
        return 'docVerification';
      case 'Bank Verification':
        return 'bankVerification';
      case 'Payment Pending':
        return 'paymentPending';
      default:
        return 'all';
    }
  };

  const toggleFlag = (id) => {
    const newFlagged = new Set(flaggedItems);
    if (newFlagged.has(id)) {
      newFlagged.delete(id);
    } else {
      newFlagged.add(id);
    }
    setFlaggedItems(newFlagged);
  };

  // Open modal for a given item
  const openModal = (item) => {
    const currentDesc = descriptions[item.id] !== undefined ? descriptions[item.id] : item.description;
    setModalItemId(item.id);
    setModalOriginalText(currentDesc);
    setModalText(currentDesc);
    setModalOpen(true);
  };

  // Close modal
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setModalItemId(null);
    setModalText('');
    setModalOriginalText('');
  }, []);

  // Save modal changes
  const saveModal = () => {
    if (modalItemId !== null) {
      setDescriptions((prev) => ({ ...prev, [modalItemId]: modalText }));
    }
    closeModal();
  };

  const hasChanges = modalText !== modalOriginalText;

  // Close modal on outside click
  useEffect(() => {
    if (!modalOpen) return;

    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        closeModal();
      }
    };

    // Delay adding the listener so the opening click doesn't immediately close it
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [modalOpen, closeModal]);

  const tableData = filterDataForTable();
  const stats = calculateStats();

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
        </div>
      </div>

      {/* TABLE */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>STUDENT</th>
              <th>REFERRER</th>
              <th>COURSE</th>
              <th>ENROLLED ON</th>
              <th>BANK DETAILS</th>
              <th>AMOUNT</th>
              <th>STAGE</th>
              <th>DESCRIPTION & FLAG</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((item) => (
              <tr
                key={item.id}
                className={`table-row ${item.isUrgent ? 'urgent-row' : ''}`}
              >
                <td className="student-name">{item.student}</td>
                <td className="referrer-name">{item.referrer}</td>
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
                    onClick={() => setActiveTab(getTabKeyForStage(item.stage))}
                    title={`View all ${item.stage}`}
                  >
                    {item.stage}
                  </span>
                </td>
                <td className="description-cell">
                  <div className="description-wrapper">
                    <button
                      className="expand-btn"
                      onClick={() => openModal(item)}
                      title="View / edit description"
                    >
                      📝
                    </button>
                    <button
                      className={`flag-btn ${flaggedItems.has(item.id) ? 'flagged' : ''}`}
                      onClick={() => toggleFlag(item.id)}
                      title="Flag this item"
                    >
                      <FiFlag size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="records-count">{tableData.length} records</div>

      {/* DESCRIPTION MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-popup" ref={modalRef}>
            <h3 className="modal-title">Description</h3>
            <textarea
              className="modal-textarea"
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              placeholder="Enter description..."
              rows={5}
            />
            <div className="modal-actions">
              <button
                className="modal-cancel-btn"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className={`modal-save-btn ${hasChanges ? 'modal-save-btn-active' : ''}`}
                disabled={!hasChanges}
                onClick={saveModal}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPORT MODAL */}
      <PayoutExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        records={tableData}
        calculateDaysAgo={calculateDaysAgo}
      />
    </div>
  );
}

export default ReferralPayouts;
