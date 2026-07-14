import React, { useState, useEffect, useRef } from 'react';
import { FiCheckCircle, FiAlertTriangle, FiSend, FiX } from 'react-icons/fi';
import './PayoutStatusPopup.css';

export const DEFAULT_NUDGE_MESSAGE = 'Bank details are not available.';
const NUDGE_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 1 day

export default function PayoutStatusPopup({ item, onClose, onMarkPaymentDone, onMarkBankPending, onNudge }) {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [referenceId, setReferenceId] = useState('');
  const [formError, setFormError] = useState('');

  const [nudgeMessage, setNudgeMessage] = useState(DEFAULT_NUDGE_MESSAGE);
  const [isShaking, setIsShaking] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', text }

  const cardRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isOpen = !!item;

  // Reset all local state whenever a (possibly different) record's popup opens.
  useEffect(() => {
    setShowPaymentForm(false);
    setReferenceId('');
    setFormError('');
    setNudgeMessage(item?.nudge?.message || DEFAULT_NUDGE_MESSAGE);
    setIsShaking(false);
    setToast(null);
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

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  if (!item) return null;

  const showToast = (type, text) => {
    setToast({ type, text });
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2000);
  };

  const confirmPaymentDone = () => {
    if (!referenceId.trim()) {
      setFormError('Reference ID is required.');
      return;
    }
    onMarkPaymentDone(item.id, referenceId.trim());
    onClose();
  };

  // Sets status only — the popup stays open. `item` is re-derived fresh from the parent's
  // data on every render, so as soon as the parent updates it this component's own render
  // logic (branching on item.status) swaps straight to the nudge panel below.
  const handleMarkBankPending = () => {
    onMarkBankPending(item.id);
  };

  const lastSentAt = item.nudge?.lastSentAt ? new Date(item.nudge.lastSentAt).getTime() : null;
  const inCooldown = lastSentAt !== null && Date.now() - lastSentAt < NUDGE_COOLDOWN_MS;

  const handleNudge = () => {
    if (inCooldown) {
      showToast('error', "Can't be sent — already nudged. Try again tomorrow.");
      return;
    }
    onNudge(item.id, nudgeMessage);
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
    showToast('success', 'Student portal is nudged.');
  };

  return (
    <div className="payout-status-overlay">
      <div className="payout-status-card" ref={cardRef}>
        <div className="payout-status-header">
          <div>
            <div className="payout-status-title">Update Payout Status</div>
            <div className="payout-status-subtitle">
              Payee: {item.referrer} &middot; Referee: {item.student}
            </div>
          </div>
          <button className="payout-status-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>

        <div className="payout-status-body">
          {item.status === 'Payment Done' && item.paymentInfo && (
            <div className="payout-status-done-summary">
              <div className="payout-status-done-summary-title">
                <FiCheckCircle size={16} /> Payment Done
              </div>
              <div className="payout-status-done-summary-row">
                <span>Reference ID</span>
                <strong>{item.paymentInfo.referenceId}</strong>
              </div>
              <div className="payout-status-done-summary-row">
                <span>Date</span>
                <strong>{item.paymentInfo.date}</strong>
              </div>
              <div className="payout-status-done-summary-row">
                <span>POC</span>
                <strong>
                  {item.paymentInfo.pocName} ({item.paymentInfo.pocPhone})
                </strong>
              </div>
            </div>
          )}

          {item.status === 'Pending Payout' && !showPaymentForm && (
            <div className="payout-status-choice-row">
              <button className="payout-status-choice-btn payment-done" onClick={() => setShowPaymentForm(true)}>
                <FiCheckCircle size={16} /> Mark Payment Done
              </button>
              <button className="payout-status-choice-btn bank-pending" onClick={handleMarkBankPending}>
                <FiAlertTriangle size={16} /> Mark Bank Details Pending
              </button>
            </div>
          )}

          {item.status === 'Bank Details Pending' && (
            <>
              <div className="payout-status-nudge-panel">
                <div className="payout-status-nudge-title">
                  <FiAlertTriangle size={14} /> Bank Details Pending
                </div>
                <textarea
                  className="payout-status-nudge-textarea"
                  value={nudgeMessage}
                  onChange={(e) => setNudgeMessage(e.target.value)}
                  placeholder={DEFAULT_NUDGE_MESSAGE}
                />
                <button
                  className={`payout-status-nudge-btn ${inCooldown ? 'cooling-down' : ''} ${isShaking ? 'shaking' : ''}`}
                  onClick={handleNudge}
                >
                  <FiSend size={14} /> {inCooldown ? 'Nudged — on cooldown' : 'Nudge Student Portal'}
                </button>
              </div>
              {!showPaymentForm && (
                <button className="payout-status-mark-done-link" onClick={() => setShowPaymentForm(true)}>
                  Bank details resolved — Mark Payment Done →
                </button>
              )}
            </>
          )}

          {showPaymentForm && (
            <div className="payout-status-form">
              <div className="payout-status-field">
                <label>Reference ID</label>
                <input
                  type="text"
                  className="payout-status-input"
                  placeholder="e.g. TXN-2026-00931"
                  value={referenceId}
                  onChange={(e) => {
                    setReferenceId(e.target.value);
                    setFormError('');
                  }}
                />
              </div>
              <div className="payout-status-field">
                <label>POC Name</label>
                <input type="text" className="payout-status-input-readonly" value="Rishabh Sahu" readOnly />
              </div>
              <div className="payout-status-field">
                <label>POC Phone Number</label>
                <input type="text" className="payout-status-input-readonly" value="+91 98765 43210" readOnly />
              </div>
              <div className="payout-status-hint">POC name and number are recorded automatically.</div>
              {formError && <div className="payout-status-error">{formError}</div>}
              <div className="payout-status-form-actions">
                <button className="payout-status-cancel-btn" onClick={() => setShowPaymentForm(false)}>
                  Cancel
                </button>
                <button className="payout-status-confirm-btn" onClick={confirmPaymentDone}>
                  Confirm
                </button>
              </div>
            </div>
          )}
        </div>

        {toast && <div className={`payout-status-toast ${toast.type}`}>{toast.text}</div>}
      </div>
    </div>
  );
}
