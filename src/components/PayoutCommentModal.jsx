import React, { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import './PayoutCommentModal.css';

export default function PayoutCommentModal({ item, onClose, onSave }) {
  const [text, setText] = useState('');
  const cardRef = useRef(null);
  const isOpen = !!item;

  useEffect(() => {
    setText(item?.comment ?? '');
  }, [item?.id]);

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

  const handleSave = () => {
    onSave(item.id, text.trim());
    onClose();
  };

  return (
    <div className="payout-comment-overlay">
      <div className="payout-comment-card" ref={cardRef}>
        <div className="payout-comment-header">
          <div>
            <div className="payout-comment-title">Remark</div>
            <div className="payout-comment-subtitle">
              Payee: {item.referrer} &middot; Referee: {item.student}
            </div>
          </div>
          <button className="payout-comment-close" onClick={onClose} aria-label="Close">
            <FiX size={20} />
          </button>
        </div>
        <div className="payout-comment-body">
          <textarea
            className="payout-comment-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Leave a remark about this payout..."
            autoFocus
          />
        </div>
        <div className="payout-comment-actions">
          <button className="payout-comment-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="payout-comment-save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
