import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import "./StopConfigModal.css";

export default function StopConfigModal({ course, onClose, onConfirm }) {
  const cardRef = useRef(null);
  const isOpen = !!course;

  // Outside-click to close — same delayed-listener pattern used by PayoutStatusPopup.
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) onClose();
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClickOutside), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!course) return null;

  return (
    <div className="stop-config-overlay">
      <div className="stop-config-card" ref={cardRef}>
        <div className="stop-config-header">
          <div>
            <div className="stop-config-title">Stop Configuration?</div>
            <div className="stop-config-subtitle">{course.name}</div>
          </div>
          <button className="stop-config-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="stop-config-body">
          <div className="stop-config-warning-panel">
            <div className="stop-config-warning-title">
              <AlertTriangle size={14} /> This can't be undone
            </div>
            <p>
              This configuration's Effective To will be set to today. Referrals and admissions
              that would otherwise fall under it, but happen after today, will no longer be
              reward-eligible until a new configuration is added for this course.
            </p>
            <p>Referrals and admissions already completed under it are not affected.</p>
          </div>
        </div>

        <div className="stop-config-footer">
          <button type="button" className="stop-config-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="stop-config-confirm-btn" onClick={onConfirm}>
            Stop Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
