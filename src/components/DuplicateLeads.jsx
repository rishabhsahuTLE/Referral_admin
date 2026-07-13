import React from "react";
import { 
  User, 
  FileText, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from "lucide-react";

export default function DuplicateLeads({ 
  duplicateLeads, 
  activeDuplicateIndex, 
  setActiveDuplicateIndex,
  onUpdateStatus 
}) {
  const currentLead = duplicateLeads[activeDuplicateIndex] || duplicateLeads[0];

  const handlePrev = (e) => {
    e.stopPropagation();
    if (duplicateLeads.length === 0) return;
    setActiveDuplicateIndex((prev) => (prev === 0 ? duplicateLeads.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (duplicateLeads.length === 0) return;
    setActiveDuplicateIndex((prev) => (prev === duplicateLeads.length - 1 ? 0 : prev + 1));
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'badge-pending';
      case 'cleared': return 'badge-cleared';
      case 'rejected': return 'badge-rejected';
      default: return '';
    }
  };

  const getCrmMatchBadgeClass = (type) => {
    switch (type?.toLowerCase()) {
      case 'existing lead': return 'badge-pending';
      case 'applicant': return 'badge-applicant';
      case 'enrolled': return 'badge-enrolled';
      default: return 'badge-enrolled';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Compliance banner */}
      <div className="compliance-banner">
        <div className="compliance-content">
          <AlertCircle className="compliance-icon" size={18} />
          <div>
            <strong>BR-13 compliance.</strong> These referrals match an existing lead, applicant, or enrolled student in CRM. No reward is issued until a decision is made. Review each case and either Clear (legitimate, allow reward) or Reject (confirmed duplicate, block reward).
          </div>
        </div>
        <div className="compliance-badge">
          {duplicateLeads.filter(l => l.status === "Pending").length} pending decision
        </div>
      </div>

      {/* Main 70-30 layout */}
      <div className="duplicate-layout" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
        
        {/* Left Side: Review Details (70% width) */}
        {currentLead ? (
          <div className="review-panel" style={{ position: 'relative' }}>
            
            {/* Large Vertically Centered Left Arrow */}
            <button 
              className="carousel-arrow-btn"
              onClick={handlePrev}
              title="Previous Duplicate Lead"
              style={{
                position: 'absolute',
                left: '-24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Large Vertically Centered Right Arrow */}
            <button 
              className="carousel-arrow-btn"
              onClick={handleNext}
              title="Next Duplicate Lead"
              style={{
                position: 'absolute',
                right: '-24px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                boxShadow: 'var(--shadow-lg)',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.12)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.color = 'var(--primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--primary)';
              }}
            >
              <ChevronRight size={24} />
            </button>

            <div className="review-header" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              <div className="review-header-left">
                <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>
                  Review: {currentLead.name}
                </h2>
                <div className="review-subtitle">
                  Submitted {currentLead.submittedDate} by {currentLead.referredBy} — {currentLead.enrollmentNo}
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span className={`badge ${getStatusBadgeClass(currentLead.status)}`}>
                  {currentLead.status}
                </span>
              </div>
            </div>

            <div className="review-cards-comparison" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              {/* Left Sub-card: New Referral */}
              <div className="comparison-card">
                <div className="comp-card-header-purple">
                  <User size={16} /> New Referral
                </div>
                <div className="comp-card-body">
                  <div className="comp-field">
                    <span className="comp-label">Name</span>
                    <span className="comp-val">{currentLead.name}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Phone</span>
                    <span className="comp-val">{currentLead.phone}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Course</span>
                    <span className="comp-val">{currentLead.course}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Referred By</span>
                    <span className="comp-val">{currentLead.referredBy}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Submitted</span>
                    <span className="comp-val">{currentLead.submittedDate}</span>
                  </div>
                </div>
              </div>

              {/* Right Sub-card: CRM Match */}
              <div className="comparison-card">
                <div className="comp-card-header-red">
                  <FileText size={16} /> {currentLead.crmMatchText}
                </div>
                <div className="comp-card-body">
                  <div className="comp-field">
                    <span className="comp-label">Name</span>
                    <span className="comp-val">{currentLead.crmName}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Phone</span>
                    <span className="comp-val">{currentLead.crmPhone}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">Course</span>
                    <span className="comp-val">{currentLead.crmCourse}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">CRM Status</span>
                    <span className="comp-val">{currentLead.crmStatus}</span>
                  </div>
                  <div className="comp-field">
                    <span className="comp-label">First Seen</span>
                    <span className="comp-val">{currentLead.crmFirstSeen}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="review-actions" style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              <button 
                className="action-btn btn-success-solid"
                onClick={() => onUpdateStatus(currentLead.id, "Cleared")}
                disabled={currentLead.status !== "Pending"}
                style={{ opacity: currentLead.status !== "Pending" ? 0.6 : 1 }}
              >
                <Check size={18} /> Clear — Allow Reward
              </button>
              <button 
                className="action-btn btn-danger-solid"
                onClick={() => onUpdateStatus(currentLead.id, "Rejected")}
                disabled={currentLead.status !== "Pending"}
                style={{ opacity: currentLead.status !== "Pending" ? 0.6 : 1 }}
              >
                <X size={18} /> Reject — Block Reward
              </button>
            </div>
          </div>
        ) : (
          <div className="review-panel" style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>No duplicate leads to review.</p>
          </div>
        )}

        {/* Right Side: Flagged Referrals List (30% width) */}
        <div className="flagged-list-panel">
          <div className="flagged-list-header">Flagged Referrals</div>
          <div className="flagged-list-subtitle">
            {duplicateLeads.length} total — {duplicateLeads.filter(l => l.status === "Pending").length} pending decision
          </div>
          
          <div className="flagged-entries">
            {duplicateLeads.map((lead, index) => (
              <div 
                key={lead.id}
                className={`flagged-entry-card ${index === activeDuplicateIndex ? "selected" : ""}`}
                onClick={() => setActiveDuplicateIndex(index)}
              >
                <div className="entry-header">
                  <span className="entry-name">{lead.name}</span>
                  <span className={`badge ${getStatusBadgeClass(lead.status)}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
                    {lead.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Referred by {lead.referredBy}
                </div>
                <div className="entry-footer">
                  <span className={`badge ${getCrmMatchBadgeClass(lead.crmMatchText.split(" — ")[1] || "")}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                    {lead.crmMatchText.split(" — ")[1] || lead.crmMatchText}
                  </span>
                  <span>{lead.submittedDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
