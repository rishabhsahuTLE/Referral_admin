import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { formatConfigDate } from "../utils/rewardConfigs";
import "./ConfigActionModal.css";

const COPY = {
  stop: {
    title: "Stop Configuration?",
    confirmLabel: "Stop Configuration",
    warningTitle: "This can't be undone",
    body: (
      <>
        <p>
          This configuration's Effective To will be set to today. Referrals and admissions
          that would otherwise fall under it, but happen after today, will no longer be
          reward-eligible until a new configuration is added for this course.
        </p>
        <p>Referrals and admissions already completed under it are not affected.</p>
      </>
    ),
  },
  remove: {
    title: "Remove Configuration?",
    confirmLabel: "Remove Configuration",
    warningTitle: "This can't be undone",
    body: (
      <p>
        This configuration's Effective From hasn't arrived yet, so it never took effect.
        Removing it deletes it completely — it won't appear in this course's history.
      </p>
    ),
  },
};

export default function ConfigActionModal({ action, onClose, onConfirm }) {
  const cardRef = useRef(null);
  const isOpen = !!action;

  // Outside-click to close — same delayed-listener pattern used elsewhere in this app.
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

  if (!action) return null;

  const copy = COPY[action.mode];
  const subtitle =
    action.mode === "remove"
      ? `${action.course.name} — ${formatConfigDate(action.config.effectiveFrom)} to ${formatConfigDate(action.config.effectiveTo)}`
      : action.course.name;

  return (
    <div className="config-action-overlay">
      <div className="config-action-card" ref={cardRef}>
        <div className="config-action-header">
          <div>
            <div className="config-action-title">{copy.title}</div>
            <div className="config-action-subtitle">{subtitle}</div>
          </div>
          <button className="config-action-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="config-action-body">
          <div className="config-action-warning-panel">
            <div className="config-action-warning-title">
              <AlertTriangle size={14} /> {copy.warningTitle}
            </div>
            {copy.body}
          </div>
        </div>

        <div className="config-action-footer">
          <button type="button" className="config-action-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="config-action-confirm-btn" onClick={onConfirm}>
            {copy.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
