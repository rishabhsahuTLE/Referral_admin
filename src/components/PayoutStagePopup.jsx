import React, { useState, useEffect, useRef } from 'react';
import { FiLock, FiCheckCircle, FiChevronRight, FiFlag, FiX } from 'react-icons/fi';
import './PayoutStagePopup.css';

const STAGE_ORDER = ['Doc Verification', 'Bank Verification', 'Payment Pending'];
const POC_NAME = 'Rishabh Sahu'; // prototype stand-in for the logged-in admin user

// <input type="date"> gives "YYYY-MM-DD" — parse as local components (not UTC) to avoid
// an off-by-one day, matching the convention already used in App.jsx's Add Program modal.
function formatDateInput(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function historyKeyFor(targetStage) {
  if (targetStage === 'Bank Verification') return 'docVerification';
  if (targetStage === 'Payment Pending') return 'bankVerification';
  if (targetStage === 'Paid') return 'payment';
  return null;
}

export default function PayoutStagePopup({ item, onClose, onStageAdvance, onFlag }) {
  const [stageAction, setStageAction] = useState(null); // null | 'advance' | 'markPaid'
  const [formDate, setFormDate] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formReference, setFormReference] = useState('');
  const [formError, setFormError] = useState('');

  const [flagOpen, setFlagOpen] = useState(false);
  const [flagText, setFlagText] = useState('');
  const [flagError, setFlagError] = useState('');

  const cardRef = useRef(null);
  const isOpen = !!item;

  // Reset all local state whenever a (possibly different) record's popup opens.
  // Deliberately keyed only on item?.id (not item?.flagDescription) — the popup
  // always closes right after a successful flag submit, so there's no case where
  // flagDescription changes while this same item stays open.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setStageAction(null);
    setFormDate('');
    setFormPhone('');
    setFormReference('');
    setFormError('');
    setFlagOpen(false);
    setFlagText(item?.flagDescription ?? '');
    setFlagError('');
  }, [item?.id]);

  // Outside-click to close — same delayed-listener pattern used elsewhere in this app.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handleClickOutside), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!item) return null;

  const currentIdx = item.stage === 'Paid' ? 3 : STAGE_ORDER.indexOf(item.stage);

  const getStepStatus = (i) => {
    if (i <= currentIdx) return 'done';
    if (i === currentIdx + 1) return 'next';
    return 'locked';
  };

  const targetStage =
    stageAction === 'advance' ? STAGE_ORDER[currentIdx + 1] : stageAction === 'markPaid' ? 'Paid' : null;
  const dateLabel = targetStage === 'Paid' ? 'Date of Payment' : 'Date of Verification';

  const startAction = (action) => {
    setStageAction(action);
    setFormDate('');
    setFormPhone('');
    setFormReference('');
    setFormError('');
  };

  const confirmAction = () => {
    if (!formDate || !formPhone.trim()) {
      setFormError('Date and POC phone number are required.');
      return;
    }
    onStageAdvance(item.id, {
      newStage: targetStage,
      historyKey: historyKeyFor(targetStage),
      date: formatDateInput(formDate),
      pocPhone: formPhone.trim(),
      reference: formReference.trim(),
    });
    onClose();
  };

  const confirmFlag = () => {
    if (!flagText.trim()) {
      setFlagError('A description is required to flag this entry.');
      return;
    }
    onFlag(item.id, flagText.trim());
    onClose();
  };

  return (
    <div className="payout-stage-overlay">
      <div className="payout-stage-card" ref={cardRef}>
        <div className="payout-stage-header">
          <div>
            <div className="payout-stage-title">Update Payout Stage</div>
            <div className="payout-stage-subtitle">
              Payee: {item.referrer} &middot; Referee: {item.student}
            </div>
          </div>
          <button className="payout-stage-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="payout-stage-body">
          <div className="payout-stage-steps">
            {STAGE_ORDER.map((stageName, i) => {
              const status = getStepStatus(i);
              return (
                <div
                  key={stageName}
                  className={`payout-stage-step ${status}`}
                  onClick={status === 'next' ? () => startAction('advance') : undefined}
                >
                  <span className="payout-stage-step-icon">
                    {status === 'done' && <FiCheckCircle size={16} />}
                    {status === 'next' && <FiChevronRight size={16} />}
                    {status === 'locked' && <FiLock size={14} />}
                  </span>
                  <span className="payout-stage-step-label">{stageName}</span>
                </div>
              );
            })}
          </div>

          {item.stage === 'Paid' ? (
            <div className="payout-stage-paid-summary">
              <FiCheckCircle size={16} /> Paid on {item.stageHistory?.payment?.date}
            </div>
          ) : (
            currentIdx === 2 &&
            stageAction !== 'markPaid' && (
              <button className="payout-stage-mark-paid-btn" onClick={() => startAction('markPaid')}>
                <FiCheckCircle size={15} /> Mark as Paid
              </button>
            )
          )}

          {stageAction && (
            <div className="payout-stage-form">
              <div className="payout-stage-field">
                <label>{dateLabel}</label>
                <input
                  type="date"
                  className="payout-stage-input"
                  value={formDate}
                  onChange={(e) => {
                    setFormDate(e.target.value);
                    setFormError('');
                  }}
                />
              </div>
              <div className="payout-stage-field">
                <label>POC Name</label>
                <input type="text" className="payout-stage-input-readonly" value={POC_NAME} readOnly />
              </div>
              <div className="payout-stage-field">
                <label>POC Phone Number</label>
                <input
                  type="tel"
                  className="payout-stage-input"
                  placeholder="+91 XXXXX XXXXX"
                  value={formPhone}
                  onChange={(e) => {
                    setFormPhone(e.target.value);
                    setFormError('');
                  }}
                />
              </div>
              <div className="payout-stage-field">
                <label>Reference / Bill No. (optional)</label>
                <input
                  type="text"
                  className="payout-stage-input"
                  placeholder="e.g. REF-1234"
                  value={formReference}
                  onChange={(e) => setFormReference(e.target.value)}
                />
              </div>
              {formError && <div className="payout-stage-error">{formError}</div>}
              <div className="payout-stage-form-actions">
                <button className="payout-stage-cancel-btn" onClick={() => setStageAction(null)}>
                  Cancel
                </button>
                <button className="payout-stage-confirm-btn" onClick={confirmAction}>
                  Confirm
                </button>
              </div>
            </div>
          )}

          <div className="payout-stage-divider" />

          {!flagOpen ? (
            <button className="payout-stage-flag-toggle" onClick={() => setFlagOpen(true)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FiFlag size={14} /> {item.isFlagged ? 'Edit flag reason' : 'Flag this entry'}
              </span>
              {item.isFlagged && <span className="payout-stage-flagged-pill">Flagged</span>}
            </button>
          ) : (
            <div className="payout-stage-form">
              <div className="payout-stage-field">
                <label>Flag description (required)</label>
                <textarea
                  className="payout-stage-flag-textarea"
                  value={flagText}
                  onChange={(e) => {
                    setFlagText(e.target.value);
                    setFlagError('');
                  }}
                  placeholder="Explain why this entry is being flagged..."
                />
              </div>
              {flagError && <div className="payout-stage-error">{flagError}</div>}
              <div className="payout-stage-form-actions">
                <button className="payout-stage-cancel-btn" onClick={() => setFlagOpen(false)}>
                  Cancel
                </button>
                <button className="payout-stage-confirm-btn" onClick={confirmFlag}>
                  Submit Flag
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
