import React, { useState } from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  Bell, 
  ShieldAlert, 
  Copy, 
  HelpCircle, 
  FileText, 
  ChevronDown, 
  ChevronRight,
  ExternalLink,
  Shield,
  MessageSquare,
  Sparkles,
  Check,
  X,
  MessageCircle,
  Mail,
  Phone,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Plus
} from "lucide-react";
import { initialUniversityData } from "./mockData";
import Dashboard from "./components/Dashboard";
import Reports from "./components/Reports";
import DuplicateLeads from "./components/DuplicateLeads";
import ReferralPolicy from "./components/ReferralPolicy";
import ReferralPayouts from "./components/ReferralPayouts";
import PaymentHistory from "./components/PaymentHistory";

export default function App() {
  const [uniData, setUniData] = useState(initialUniversityData);
  const [selectedUni, setSelectedUni] = useState("jamia_hamdard");
  const [view, setView] = useState("dashboard");
  const [activeDuplicateIndex, setActiveDuplicateIndex] = useState(0);

  // One-shot deep link: set by Dashboard's "Referral Cost Ratio by Course" chart so
  // Reports opens straight into Referee Report with that course pre-selected.
  const [reportsDeepLinkCourse, setReportsDeepLinkCourse] = useState(null);
  const navigateToRefereeReportForCourse = (courseName) => {
    setReportsDeepLinkCourse(courseName);
    setView("reports");
  };

  // Notification Log state
  const [notifChannelFilter, setNotifChannelFilter] = useState("All Channels");
  const [notifStatusFilter, setNotifStatusFilter] = useState("All Statuses");

  // Add New Program state
  const [showAddProgram, setShowAddProgram] = useState(false);
  const [programName, setProgramName] = useState("");
  const [programType, setProgramType] = useState("UG");
  const [referrerIncentive, setReferrerIncentive] = useState("");
  const [refereeDiscount, setRefereeDiscount] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [addProgramError, setAddProgramError] = useState("");

  // Fraud Monitor state
  const [resolvedReferrers, setResolvedReferrers] = useState({});
  const [flaggedReviewPopup, setFlaggedReviewPopup] = useState(null); // name string or null

  // Terms & Conditions state
  const TC_INITIAL = `Jamia Hamdard University – Student Referral Programme
Terms & Conditions – Effective 01 June 2026

1. ELIGIBILITY
Only currently enrolled students of Jamia Hamdard University may participate as referrers. The referred person (referee) must not have a prior relationship with the University – i.e., they must not already exist as a lead, applicant, or enrolled student in the CRM system.

2. REWARD CONDITIONS
Rewards are triggered only when the referred student completes enrollment AND pays 100% of the first-semester fee. Partial fee payment does not qualify. Rewards are forfeited if the referring student is no longer enrolled at the time of disbursement.

3. CAP ON ACTIVE REFERRALS
A student may not have more than 10 referrals in "New" or "In Progress" status simultaneously. Submissions beyond this cap will be rejected until existing referrals are resolved.

4. REWARD DISBURSEMENT
Approved rewards will be credited to the bank account registered in the student portal within 30 days of the enrollment confirmation date. It is the student's responsibility to maintain accurate bank details. Rewards held due to incorrect bank details will not expire.`;

  const [tcEditorText, setTcEditorText] = useState(TC_INITIAL);
  const [tcDraftText, setTcDraftText]   = useState(null);   // null = no saved draft
  const [tcVersions, setTcVersions]     = useState([
    { version: 1, label: "Version 1", text: TC_INITIAL, date: "01 Jun 2026, 9:00 AM", by: "Admin User", live: true }
  ]);

  // Manage FAQs state
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");
  const [faqList, setFaqList] = useState([
    { q: "When do I receive my referral reward?", a: "Rewards are credited within 30 days of the referred student's enrollment confirmation and first semester fee payment." },
    { q: "Is there a limit on how many friends I can refer?", a: "You can refer unlimited friends. However, at any point, you may not have more than 10 referrals in New or In Progress status simultaneously." },
    { q: "Can I track my referral's application status?", a: "Yes. Real-time status updates are available in the \"My Referrals\" table — New, In Progress, Enrolled, or Dropped." },
    { q: "What if I haven't added my bank account?", a: "Your reward will be held as pending until you add a valid bank account. There is no expiry on pending rewards — you won't lose them." },
    { q: "Which programs are eligible for referral rewards?", a: "All full-time UG and PG programs are eligible — B.Tech, B.Com, BCA, MBA, MCA, and more. Part-time or distance programs may have different terms." },
  ]);

  const currentUniData = uniData[selectedUni];

  // Handler to toggle universities
  const handleUniChange = (e) => {
    setSelectedUni(e.target.value);
    setActiveDuplicateIndex(0); // Reset index for duplicate leads
  };

  // Handler to update duplicate lead status dynamically
  const handleUpdateDuplicateStatus = (leadId, newStatus) => {
    setUniData((prevData) => {
      const updatedList = prevData[selectedUni].duplicateLeads.map((lead) => {
        if (lead.id === leadId) {
          return { ...lead, status: newStatus };
        }
        return lead;
      });

      // Recalculate duplicate notifications count
      const pendingCount = updatedList.filter(l => l.status === "Pending").length;
      
      return {
        ...prevData,
        [selectedUni]: {
          ...prevData[selectedUni],
          duplicateLeads: updatedList,
          notifications: {
            ...prevData[selectedUni].notifications,
            duplicateLeads: pendingCount
          }
        }
      };
    });
  };

  // Handler to update referral policy row
  const handleUpdatePolicy = (updatedProg) => {
    setUniData((prevData) => {
      const updatedPrograms = prevData[selectedUni].programs.map((prog) => {
        if (prog.name === updatedProg.name) {
          return {
            ...prog,
            cost: updatedProg.cost,
            referralPercent: updatedProg.referralPercent,
            referrerIncentive: updatedProg.referrerIncentive,
            refereeDiscount: updatedProg.refereeDiscount,
            effectiveFrom: updatedProg.effectiveFrom
          };
        }
        return prog;
      });

      return {
        ...prevData,
        [selectedUni]: {
          ...prevData[selectedUni],
          programs: updatedPrograms
        }
      };
    });
  };

  const resetAddProgramForm = () => {
    setProgramName("");
    setProgramType("UG");
    setReferrerIncentive("");
    setRefereeDiscount("");
    setEffectiveFrom("");
    setAddProgramError("");
  };

  const closeAddProgramModal = () => {
    setShowAddProgram(false);
    resetAddProgramForm();
  };

  const formatEffectiveDate = (isoDate) => {
    // isoDate comes from <input type="date"> as YYYY-MM-DD; parse as local (not UTC) to avoid off-by-one day
    const [year, month, day] = isoDate.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Handler to add a new referral program from the "Add New Program" modal
  const handleSaveNewProgram = () => {
    if (!programName.trim() || !programType || referrerIncentive === "" || refereeDiscount === "" || !effectiveFrom) {
      setAddProgramError("All fields are required.");
      return;
    }

    const newProgram = {
      name: programName.trim(),
      type: programType,
      cost: 0,
      referralPercent: 0,
      referrerIncentive: parseInt(referrerIncentive, 10) || 0,
      refereeDiscount: parseFloat(refereeDiscount) || 0,
      effectiveFrom: formatEffectiveDate(effectiveFrom),
      converted: 0,
      leads: 0,
      flagged: 0,
      inProcess: 0,
      referrerData: { converted: 0, flagged: 0, inProcess: 0 },
      refereeData: { converted: 0, flagged: 0, inProcess: 0 }
    };

    setUniData((prevData) => ({
      ...prevData,
      [selectedUni]: {
        ...prevData[selectedUni],
        programs: [...prevData[selectedUni].programs, newProgram]
      }
    }));

    closeAddProgramModal();
  };

  // Render sub-views
  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return (
          <Dashboard
            data={currentUniData}
            setView={setView}
            onNavigateToRefereeReport={navigateToRefereeReportForCourse}
          />
        );
      case "reports":
        return (
          <Reports
            data={currentUniData}
            initialRefereeCourse={reportsDeepLinkCourse}
            onConsumeDeepLink={() => setReportsDeepLinkCourse(null)}
          />
        );
      case "duplicate_leads":
        return (
          <DuplicateLeads 
            duplicateLeads={currentUniData.duplicateLeads} 
            activeDuplicateIndex={activeDuplicateIndex}
            setActiveDuplicateIndex={setActiveDuplicateIndex}
            onUpdateStatus={handleUpdateDuplicateStatus}
          />
        );
      case "referral_policy":
        return (
          <ReferralPolicy 
            data={currentUniData} 
            onUpdatePolicy={handleUpdatePolicy}
          />
        );

      case "referral_payouts":
        return <ReferralPayouts university={currentUniData.name} />;

      case "payment_history":
        return <PaymentHistory data={currentUniData} />;

      case "policy_content": {
        // live version = last entry with live:true
        const liveVersion  = [...tcVersions].reverse().find(v => v.live);
        const liveText     = liveVersion ? liveVersion.text : TC_INITIAL;
        const isDirty      = tcEditorText !== liveText;
        const hasDraft     = tcDraftText !== null;

        const handleDiscard = () => {
          setTcEditorText(liveText);
          setTcDraftText(null);
        };

        const handleSaveDraft = () => {
          setTcDraftText(tcEditorText);
        };

        const handlePublish = () => {
          const nextVer = tcVersions.length + 1;
          const now = new Date();
          const dateStr = now.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).replace(',','');
          const updated = tcVersions.map(v => ({ ...v, live: false }));
          updated.push({ version: nextVer, label: `Version ${nextVer}`, text: tcEditorText, date: dateStr, by: "Admin User", live: true });
          setTcVersions(updated);
          setTcDraftText(null);
        };

        const handleRestore = (text) => {
          setTcEditorText(text);
          setTcDraftText(null);
        };

        const latestLiveText = [...tcVersions].reverse().find(v => v.live)?.text ?? TC_INITIAL;
        const editorMatchesLive = tcEditorText === latestLiveText && !hasDraft;

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
            {/* Section Header */}
            <div style={{
              backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
              padding:'24px', boxShadow:'var(--shadow-sm)'
            }}>
              <h2 style={{ fontWeight:'700', fontSize:'20px', color:'var(--text-main)', marginBottom:'8px' }}>Referral Configuration</h2>
              <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:'1.5' }}>Manage referral programmes — cost, incentive percentage, and effective dates.</p>
            </div>

            {/* Referral Configuration Section */}
            <div style={{
              backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
              padding:'24px', boxShadow:'var(--shadow-sm)'
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                <h3 style={{ fontWeight:'700', fontSize:'16px', color:'var(--text-main)', margin:0 }}>Referral Configuration</h3>
                <button
                  onClick={() => setShowAddProgram(true)}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:'6px',
                    padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:'700',
                    backgroundColor:'var(--text-main)', color:'#ffffff', border:'none', cursor:'pointer'
                  }}
                >
                  <Plus size={15} /> Add New Program
                </button>
              </div>
              <ReferralPolicy data={currentUniData} onUpdatePolicy={handleUpdatePolicy} />
            </div>

            {/* FAQ Management + Terms & Conditions temporarily disabled — guarded with
                `false &&` instead of a JSX comment since this block contains its own
                inline `{/* ... *\/}` section-header comments. */}
            {false && (
            <>
            {/* FAQ Management Section */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              <div style={{
                backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
                padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
                marginBottom:'12px', boxShadow:'var(--shadow-sm)'
              }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'16px', color:'var(--text-main)' }}>FAQ Management</div>
                  <div style={{ fontSize:'12px', color:'var(--primary)', fontWeight:'500', marginTop:'2px' }}>{faqList.length} questions visible to students</div>
                </div>
                <button
                  onClick={() => { setShowAddFaq(v => !v); setNewFaqQ(""); setNewFaqA(""); }}
                  style={{
                    display:'inline-flex', alignItems:'center', gap:'6px',
                    padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:'700',
                    backgroundColor:'var(--text-main)', color:'#ffffff', border:'none', cursor:'pointer'
                  }}
                >
                  <Plus size={15} /> Add FAQ
                </button>
              </div>

              {showAddFaq && (
                <div style={{
                  backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
                  padding:'20px 24px', marginBottom:'12px', boxShadow:'var(--shadow-sm)'
                }}>
                  <div style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
                    NEW FAQ
                  </div>
                  <input
                    type="text"
                    placeholder="Question"
                    value={newFaqQ}
                    onChange={e => setNewFaqQ(e.target.value)}
                    style={{
                      width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'8px',
                      fontSize:'13px', outline:'none', marginBottom:'10px',
                      backgroundColor:'#fafbfc', color:'var(--text-main)'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Answer"
                    value={newFaqA}
                    onChange={e => setNewFaqA(e.target.value)}
                    style={{
                      width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'8px',
                      fontSize:'13px', outline:'none', marginBottom:'16px',
                      backgroundColor:'#fafbfc', color:'var(--text-main)'
                    }}
                  />
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button
                      onClick={() => {
                        if (newFaqQ.trim() && newFaqA.trim()) {
                          setFaqList(prev => [...prev, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
                          setShowAddFaq(false); setNewFaqQ(""); setNewFaqA("");
                        }
                      }}
                      style={{
                        padding:'8px 20px', borderRadius:'7px', fontSize:'13px', fontWeight:'700',
                        backgroundColor:'var(--primary)', color:'#ffffff', border:'none', cursor:'pointer'
                      }}
                    >
                      Save FAQ
                    </button>
                    <button
                      onClick={() => { setShowAddFaq(false); setNewFaqQ(""); setNewFaqA(""); }}
                      style={{
                        padding:'8px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                        backgroundColor:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)', cursor:'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
                {faqList.map((faq, i) => (
                  <div key={i} style={{
                    backgroundColor:'var(--bg-card)',
                    border:'1px solid var(--border)',
                    borderRadius:'12px',
                    padding:'18px 24px',
                    marginBottom:'8px',
                    boxShadow:'var(--shadow-sm)',
                    display:'flex', gap:'16px', alignItems:'flex-start'
                  }}>
                    <span style={{
                      flexShrink:0, width:'22px', height:'22px', borderRadius:'50%',
                      backgroundColor:'var(--primary-light)', color:'var(--primary)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'11px', fontWeight:'800', marginTop:'1px'
                    }}>{i + 1}</span>
                    <div>
                      <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)', marginBottom:'5px' }}>{faq.q}</div>
                      <div style={{ fontSize:'13px', color:'var(--info-text)', lineHeight:'1.55' }}>{faq.a}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms & Conditions Section */}
            <div style={{
              backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
              boxShadow:'var(--shadow-sm)', overflow:'hidden'
            }}>
              <div style={{
                padding:'12px 20px', borderBottom:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                backgroundColor:'#fafbfc', flexWrap:'wrap', gap:'10px'
              }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)' }}>Terms & Conditions Editor</div>
                  <div style={{ fontSize:'11px', marginTop:'2px', display:'flex', alignItems:'center', gap:'6px' }}>
                    {editorMatchesLive ? (
                      <span style={{ color:'#059669', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#10b981', display:'inline-block' }}/>
                        In sync with live
                      </span>
                    ) : (
                      <span style={{ color:'#d97706', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#f59e0b', display:'inline-block' }}/>
                        {hasDraft ? 'Draft saved · ' : 'Unsaved draft changes · '}
                        Published {liveVersion?.date ?? '01 Jun 2026, 9:00 AM'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <button
                    disabled={editorMatchesLive}
                    onClick={handleDiscard}
                    style={{
                      padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                      border:'1px solid var(--border)', cursor: editorMatchesLive ? 'not-allowed' : 'pointer',
                      backgroundColor: editorMatchesLive ? '#f8fafc' : '#ffffff',
                      color: editorMatchesLive ? '#cbd5e1' : 'var(--text-main)',
                      transition:'all 0.15s ease'
                    }}
                  >Discard</button>
                  <button
                    disabled={editorMatchesLive}
                    onClick={handleSaveDraft}
                    style={{
                      padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                      border:'1px solid var(--border)', cursor: editorMatchesLive ? 'not-allowed' : 'pointer',
                      backgroundColor: editorMatchesLive ? '#f8fafc' : '#ffffff',
                      color: editorMatchesLive ? '#cbd5e1' : 'var(--primary)',
                      borderColor: editorMatchesLive ? 'var(--border)' : 'var(--primary)',
                      transition:'all 0.15s ease'
                    }}
                  >Save Draft</button>
                  <button
                    onClick={handlePublish}
                    style={{
                      padding:'7px 18px', borderRadius:'7px', fontSize:'13px', fontWeight:'700',
                      border:'none', cursor:'pointer',
                      backgroundColor:'#10b981', color:'#ffffff',
                      transition:'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor='#059669'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor='#10b981'}
                  >Publish Live</button>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 260px' }}>
                <div style={{ borderRight:'1px solid var(--border)' }}>
                  <textarea
                    value={tcEditorText}
                    onChange={e => setTcEditorText(e.target.value)}
                    spellCheck={false}
                    style={{
                      width:'100%', minHeight:'440px', padding:'24px',
                      fontFamily:'"Courier New", Courier, monospace',
                      fontSize:'13px', lineHeight:'1.7', color:'var(--text-main)',
                      border:'none', outline:'none', resize:'vertical',
                      backgroundColor:'#ffffff'
                    }}
                  />
                </div>

                <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'0' }}>
                  <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)', marginBottom:'3px' }}>Version History</div>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'16px' }}>
                    {tcVersions.length} version{tcVersions.length !== 1 ? 's' : ''} saved
                  </div>

                  {hasDraft && (
                    <div style={{
                      padding:'12px 14px', borderRadius:'8px', marginBottom:'8px',
                      border:'1px solid rgba(245,158,11,0.3)', backgroundColor:'#fffbeb'
                    }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:'var(--warning-text)' }}>Draft</span>
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>Unsaved to production</div>
                      <button
                        onClick={() => handleRestore(tcDraftText)}
                        style={{
                          fontSize:'11px', fontWeight:'600', color:'var(--primary)',
                          background:'none', border:'none', cursor:'pointer', padding:0
                        }}
                      >Restore to editor →</button>
                    </div>
                  )}

                  {[...tcVersions].reverse().map((v, i) => (
                    <div key={v.version} style={{
                      padding:'12px 14px', borderRadius:'8px', marginBottom:'8px',
                      border:`1px solid ${v.live ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                      backgroundColor: v.live ? '#f0fdf4' : '#fafbfc'
                    }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-main)' }}>
                          {i === 0 ? 'Latest' : v.label}
                        </span>
                        {v.live && (
                          <span style={{
                            fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'4px',
                            backgroundColor:'#10b981', color:'#ffffff', letterSpacing:'0.05em'
                          }}>LIVE</span>
                        )}
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{v.date}</div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>by {v.by}</div>
                      <button
                        onClick={() => handleRestore(v.text)}
                        style={{
                          fontSize:'11px', fontWeight:'600', color:'var(--primary)',
                          background:'none', border:'none', cursor:'pointer', padding:0
                        }}
                      >Restore to editor →</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        );
      }

      // Fallback Views
      case "fraud_monitor": {
        const hvReferrers = [
          { name: "Aditya Verma",  enrollment: "JH2024CSD042", tag: "ACTIVE", referrals: 12, reason: "Unusually high volume (12 referrals in 30 days)" },
          { name: "Simran Kaur",   enrollment: "JH2024TCF009", tag: "ACTIVE", referrals: 9,  reason: "9 referrals assigned to same counsellor (Ravi Sharma)" },
          { name: "Kavya Suresh",  enrollment: "JH2024MDA022", tag: null,     referrals: 11, reason: "Unusually high volume (11 referrals in 65 days)" },
        ];

        const counsellors = [
          { name: "Ravi Sharma",  leads: 23, pct: 75, level: "High"   },
          { name: "Meena Pillai", leads: 18, pct: 37, level: "Normal" },
          { name: "Suresh Nair",  leads: 9,  pct: 22, level: "Normal" },
          { name: "Anita Rao",    leads: 14, pct: 29, level: "Normal" },
        ];

        const capReferrers = [
          { name: "Aditya Verma", enrollment: "JH2024C15942", active: 10, cap: 10, atCap: true  },
          { name: "Simran Kaur",  enrollment: "JH2024TC53685", active: 8,  cap: 10, atCap: false },
          { name: "Kavya Suresh", enrollment: "JH2024M98A822", active: 7,  cap: 10, atCap: false },
        ];

        const levelColor = (l) => l === "High" ? "#f59e0b" : "#10b981";
        const levelBg    = (l) => l === "High" ? "#fffbeb" : "#ecfdf5";
        const levelText  = (l) => l === "High" ? "#d97706" : "#059669";
        const barColor   = (p) => p >= 70 ? "#f59e0b" : "#10b981";

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Alert banner */}
            <div style={{
              backgroundColor:'#dc2626', borderRadius:'12px', padding:'18px 24px',
              display:'flex', alignItems:'center', justifyContent:'space-between', color:'#ffffff'
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <AlertTriangle size={20} />
                <div>
                  <div style={{ fontWeight:'700', fontSize:'14px' }}>2 active flags require review</div>
                  <div style={{ fontSize:'12px', opacity:0.85 }}>Resolve flags to keep the referral programme healthy</div>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:'28px', fontWeight:'800', lineHeight:1 }}>3</div>
                <div style={{ fontSize:'11px', opacity:0.85 }}>total flagged referrers</div>
              </div>
            </div>

            {/* Two-column grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', alignItems:'start' }}>

              {/* Left: High-Volume Referrers */}
              <div style={{ backgroundColor:'#fff8f8', border:'1px solid rgba(239,68,68,0.15)', borderRadius:'12px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <AlertTriangle size={15} style={{ color:'var(--danger)' }} />
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)' }}>High-Volume Referrers</span>
                </div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'16px' }}>Students with unusually high referral activity</div>

                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {hvReferrers.map((r) => {
                    const isResolved = resolvedReferrers[r.name];
                    return (
                      <div key={r.name}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                          <div>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)' }}>{r.name}</span>
                              {r.tag && !isResolved && (
                                <span style={{ fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'4px', backgroundColor:'var(--danger-bg)', color:'var(--danger-text)', border:'1px solid rgba(239,68,68,0.2)' }}>
                                  {r.tag}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{r.enrollment}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontWeight:'800', fontSize:'18px', color:'var(--text-main)' }}>{r.referrals}</div>
                            <div style={{ fontSize:'10px', color:'var(--text-muted)' }}>referrals</div>
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: isResolved ? '#f0fdf4' : 'rgba(239,68,68,0.06)',
                          border: `1px solid ${isResolved ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.12)'}`,
                          borderRadius:'8px', padding:'10px 14px',
                          display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px'
                        }}>
                          <span style={{ fontSize:'12px', color: isResolved ? 'var(--success-text)' : 'var(--text-muted)' }}>
                            {isResolved ? `✓ Resolved — ${r.reason}` : r.reason}
                          </span>
                          {isResolved ? (
                            <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'12px', fontWeight:'600', color:'var(--success-text)', whiteSpace:'nowrap' }}>
                              <Check size={13} /> Resolved
                            </span>
                          ) : (
                            <button
                              onClick={() => setResolvedReferrers(prev => ({ ...prev, [r.name]: true }))}
                              style={{
                                padding:'5px 14px', borderRadius:'6px', fontSize:'12px', fontWeight:'600',
                                backgroundColor:'#ffffff', border:'1px solid var(--border)', color:'var(--text-main)',
                                cursor:'pointer', whiteSpace:'nowrap', flexShrink:0
                              }}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Counsellor Concentration */}
              <div style={{ backgroundColor:'#fffdf0', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'20px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <TrendingUp size={15} style={{ color:'var(--warning)' }} />
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)' }}>Counsellor Concentration</span>
                </div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'16px' }}>Disproportionate lead assignment per counsellor</div>

                <div style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
                  {counsellors.map((c) => (
                    <div key={c.name}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'5px' }}>
                        <div>
                          <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)' }}>{c.name}</div>
                          <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{c.leads} total leads assigned</div>
                        </div>
                        <span style={{
                          padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                          backgroundColor: levelBg(c.level), color: levelText(c.level),
                          border:`1px solid ${levelColor(c.level)}33`
                        }}>● {c.level}</span>
                      </div>
                      <div style={{ height:'7px', backgroundColor:'#f1f5f9', borderRadius:'4px', overflow:'hidden', marginBottom:'3px' }}>
                        <div style={{ height:'100%', width:`${c.pct}%`, backgroundColor: barColor(c.pct), borderRadius:'4px', transition:'width 0.4s ease' }} />
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'var(--text-muted)' }}>
                        <span>from flagged referrers</span>
                        <span style={{ fontWeight:'600' }}>{c.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Max-Referral Cap Monitor */}
            <div style={{ backgroundColor:'#fffdf0', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'12px', padding:'20px', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <AlertTriangle size={15} style={{ color:'var(--warning)' }} />
                  <span style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)' }}>Max-Referral Cap Monitor</span>
                  <span style={{ fontSize:'11px', color:'var(--danger-text)', fontWeight:'600' }}>BR-16 · 10 active referrals/link</span>
                </div>
                <span style={{ padding:'4px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', backgroundColor:'var(--danger-bg)', color:'var(--danger-text)', border:'1px solid rgba(239,68,68,0.2)' }}>
                  3 at risk
                </span>
              </div>
              <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'20px' }}>Students approaching or at the 10-referral active cap</div>

              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {capReferrers.map((r) => (
                  <div key={r.name} style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'baseline', gap:'8px', marginBottom:'5px' }}>
                        <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)' }}>{r.name}</span>
                        <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{r.enrollment}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ flex:1, height:'7px', backgroundColor:'#f1f5f9', borderRadius:'4px', overflow:'hidden' }}>
                          <div style={{
                            height:'100%',
                            width:`${(r.active / r.cap) * 100}%`,
                            backgroundColor: r.atCap ? '#ef4444' : '#f59e0b',
                            borderRadius:'4px', transition:'width 0.4s ease'
                          }} />
                        </div>
                        <span style={{ fontSize:'12px', fontWeight:'600', color:'var(--text-muted)', whiteSpace:'nowrap' }}>{r.active} / {r.cap} active</span>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                      <span style={{
                        padding:'4px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600',
                        backgroundColor: r.atCap ? 'var(--danger-bg)' : 'var(--warning-bg)',
                        color: r.atCap ? 'var(--danger-text)' : 'var(--warning-text)',
                        border: `1px solid ${r.atCap ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`
                      }}>
                        {r.atCap ? 'At Cap' : 'Near Cap'}
                      </span>
                      <button
                        onClick={() => setFlaggedReviewPopup(flaggedReviewPopup === r.name ? null : r.name)}
                        style={{
                          padding:'5px 14px', borderRadius:'6px', fontSize:'12px', fontWeight:'600',
                          backgroundColor:'var(--primary)', color:'#ffffff', border:'none', cursor:'pointer'
                        }}
                      >
                        Flag for Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom-right toast popup */}
              {flaggedReviewPopup && (
                <div style={{
                  position:'fixed', bottom:'28px', right:'28px', zIndex:500,
                  backgroundColor:'var(--text-main)', color:'#ffffff',
                  borderRadius:'10px', padding:'12px 18px',
                  display:'flex', alignItems:'center', gap:'10px',
                  boxShadow:'0 8px 24px rgba(0,0,0,0.18)',
                  fontSize:'13px', fontWeight:'500', maxWidth:'320px'
                }}>
                  <Check size={15} style={{ color:'#10b981', flexShrink:0 }} />
                  <span><strong>{flaggedReviewPopup}</strong> flagged for manual review.</span>
                  <button
                    onClick={() => setFlaggedReviewPopup(null)}
                    style={{ marginLeft:'auto', background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', padding:'0', flexShrink:0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      case "notification_log": {
        const allMessages = [
          { id: 1, channel: "WhatsApp", name: "Aditya Verma",  enrollment: "JH2024CSD042", msg: "Referral Status Update",  date: "18 Jun 2026, 10:32 AM", status: "Delivered" },
          { id: 2, channel: "Email",    name: "Neha Kapoor",   enrollment: "JH2024MDA017", msg: "Reward Disbursed",         date: "18 Jun 2026, 10:00 AM", status: "Delivered" },
          { id: 3, channel: "WhatsApp", name: "Simran Kaur",   enrollment: "JH2024TCF009", msg: "Verification Pending",    date: "17 Jun 2026, 2:00 PM",  status: "Delivered" },
          { id: 4, channel: "Email",    name: "Pradeep Nair",  enrollment: "JH2024MAR111", msg: "Referral Status Update",  date: "16 Jun 2026, 11:30 AM", status: "Pending"   },
          { id: 5, channel: "WhatsApp", name: "Divya Menon",   enrollment: "JH2024CSD088", msg: "New Referral Received",   date: "15 Jun 2026, 9:45 AM",  status: "Delivered" },
          { id: 6, channel: "Email",    name: "Kavya Suresh",  enrollment: "JH2024MDA022", msg: "Fraud Flag Notification", date: "13 Jun 2026, 8:55 AM",  status: "Failed"    },
        ];

        const channels = ["All Channels", "WhatsApp", "Email"];
        const statuses  = ["All Statuses", "Delivered", "Failed", "Pending"];

        const filtered = allMessages.filter(m => {
          const chOk = notifChannelFilter === "All Channels" || m.channel === notifChannelFilter;
          const stOk = notifStatusFilter  === "All Statuses"  || m.status  === notifStatusFilter;
          return chOk && stOk;
        });

        const sentToday  = 2;
        const delivered  = 5;
        const failed     = 2;

        const channelIcon = (ch) => {
          if (ch === "WhatsApp") return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', backgroundColor:'#dcfce7', color:'#16a34a' }}>
              <MessageCircle size={12}/> WhatsApp
            </span>
          );
          if (ch === "Email") return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', backgroundColor:'#eff6ff', color:'#2563eb' }}>
              <Mail size={12}/> Email
            </span>
          );
          return (
            <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'3px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:'600', backgroundColor:'#f1f5f9', color:'#475569' }}>
              <Phone size={12}/> SMS
            </span>
          );
        };

        const statusBadge = (s) => {
          if (s === "Delivered") return <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'var(--success-bg)', color:'var(--success-text)', border:'1px solid rgba(16,185,129,0.2)' }}>● Delivered</span>;
          if (s === "Failed")    return <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'var(--danger-bg)',  color:'var(--danger-text)',  border:'1px solid rgba(239,68,68,0.2)'  }}>● Failed</span>;
          return                        <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'600', backgroundColor:'var(--warning-bg)', color:'var(--warning-text)', border:'1px solid rgba(245,158,11,0.2)' }}>● Pending</span>;
        };

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

            {/* Stat tiles */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Sent Today</div>
                <div className="stat-val" style={{ color:'var(--primary)' }}>{sentToday}</div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>notifications dispatched</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Delivered</div>
                <div className="stat-val" style={{ color:'var(--success-text)' }}>{delivered}</div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>confirmed received</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Failed</div>
                <div className="stat-val" style={{ color:'var(--danger-text)' }}>{failed}</div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>require retry</div>
              </div>
            </div>

            {/* Filter toggles + message count */}
            <div className="table-container">
              <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                  {/* Channel pills */}
                  <div style={{ display:'flex', gap:'6px' }}>
                    {channels.map(c => (
                      <button key={c} onClick={() => setNotifChannelFilter(c)} style={{
                        padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'1.5px solid',
                        borderColor: notifChannelFilter === c ? 'var(--text-main)' : 'var(--border)',
                        backgroundColor: notifChannelFilter === c ? 'var(--text-main)' : '#ffffff',
                        color: notifChannelFilter === c ? '#ffffff' : 'var(--text-muted)',
                        transition:'all 0.15s ease'
                      }}>{c}</button>
                    ))}
                  </div>
                  {/* Divider */}
                  <div style={{ width:'1px', height:'28px', backgroundColor:'var(--border)' }}/>
                  {/* Status pills */}
                  <div style={{ display:'flex', gap:'6px' }}>
                    {statuses.map(s => (
                      <button key={s} onClick={() => setNotifStatusFilter(s)} style={{
                        padding:'6px 14px', borderRadius:'20px', fontSize:'12px', fontWeight:'600', cursor:'pointer', border:'1.5px solid',
                        borderColor: notifStatusFilter === s ? 'var(--text-main)' : 'var(--border)',
                        backgroundColor: notifStatusFilter === s ? 'var(--text-main)' : '#ffffff',
                        color: notifStatusFilter === s ? '#ffffff' : 'var(--text-muted)',
                        transition:'all 0.15s ease'
                      }}>{s}</button>
                    ))}
                  </div>
                </div>
                <span style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:'500' }}>{filtered.length} messages</span>
              </div>

              {/* Message rows */}
              <div style={{ display:'flex', flexDirection:'column' }}>
                {filtered.map((m, i) => (
                  <div key={m.id} style={{
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    padding:'14px 20px',
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    gap:'16px'
                  }}>
                    {/* Left: channel pill + name/message */}
                    <div style={{ display:'flex', alignItems:'center', gap:'14px', minWidth:0 }}>
                      <div style={{ flexShrink:0 }}>{channelIcon(m.channel)}</div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                          <span style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)' }}>{m.name}</span>
                          <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>{m.enrollment}</span>
                        </div>
                        <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'2px' }}>
                          {m.msg} · {m.date}
                        </div>
                      </div>
                    </div>
                    {/* Right: status + retry */}
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                      {statusBadge(m.status)}
                      {m.status === "Failed" && (
                        <button style={{
                          display:'inline-flex', alignItems:'center', gap:'4px',
                          padding:'4px 12px', borderRadius:'6px', fontSize:'11px', fontWeight:'600',
                          backgroundColor:'var(--primary)', color:'#ffffff', border:'none', cursor:'pointer'
                        }}>
                          <RefreshCw size={10}/> Retry
                        </button>
                      )}
                      <span style={{ color:'var(--text-muted)', fontSize:'14px', cursor:'pointer' }}>›</span>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div style={{ padding:'32px', textAlign:'center', color:'var(--text-muted)', fontSize:'13px' }}>
                    No notifications match the selected filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }

      case "manage_faqs":
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {/* Header card */}
            <div style={{
              backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
              padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between',
              marginBottom:'12px', boxShadow:'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ fontWeight:'700', fontSize:'16px', color:'var(--text-main)' }}>FAQ Management</div>
                <div style={{ fontSize:'12px', color:'var(--primary)', fontWeight:'500', marginTop:'2px' }}>{faqList.length} questions visible to students</div>
              </div>
              <button
                onClick={() => { setShowAddFaq(v => !v); setNewFaqQ(""); setNewFaqA(""); }}
                style={{
                  display:'inline-flex', alignItems:'center', gap:'6px',
                  padding:'9px 18px', borderRadius:'8px', fontSize:'13px', fontWeight:'700',
                  backgroundColor:'var(--text-main)', color:'#ffffff', border:'none', cursor:'pointer'
                }}
              >
                <Plus size={15} /> Add FAQ
              </button>
            </div>

            {/* New FAQ form — only visible when showAddFaq */}
            {showAddFaq && (
              <div style={{
                backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
                padding:'20px 24px', marginBottom:'12px', boxShadow:'var(--shadow-sm)'
              }}>
                <div style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'12px' }}>
                  NEW FAQ
                </div>
                <input
                  type="text"
                  placeholder="Question"
                  value={newFaqQ}
                  onChange={e => setNewFaqQ(e.target.value)}
                  style={{
                    width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'8px',
                    fontSize:'13px', outline:'none', marginBottom:'10px',
                    backgroundColor:'#fafbfc', color:'var(--text-main)'
                  }}
                />
                <input
                  type="text"
                  placeholder="Answer"
                  value={newFaqA}
                  onChange={e => setNewFaqA(e.target.value)}
                  style={{
                    width:'100%', padding:'10px 14px', border:'1px solid var(--border)', borderRadius:'8px',
                    fontSize:'13px', outline:'none', marginBottom:'16px',
                    backgroundColor:'#fafbfc', color:'var(--text-main)'
                  }}
                />
                <div style={{ display:'flex', gap:'10px' }}>
                  <button
                    onClick={() => {
                      if (newFaqQ.trim() && newFaqA.trim()) {
                        setFaqList(prev => [...prev, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
                        setShowAddFaq(false); setNewFaqQ(""); setNewFaqA("");
                      }
                    }}
                    style={{
                      padding:'8px 20px', borderRadius:'7px', fontSize:'13px', fontWeight:'700',
                      backgroundColor:'var(--primary)', color:'#ffffff', border:'none', cursor:'pointer'
                    }}
                  >
                    Save FAQ
                  </button>
                  <button
                    onClick={() => { setShowAddFaq(false); setNewFaqQ(""); setNewFaqA(""); }}
                    style={{
                      padding:'8px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                      backgroundColor:'transparent', color:'var(--text-muted)', border:'1px solid var(--border)', cursor:'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* FAQ list */}
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              {faqList.map((faq, i) => (
                <div key={i} style={{
                  backgroundColor:'var(--bg-card)',
                  border:'1px solid var(--border)',
                  borderRadius:'12px',
                  padding:'18px 24px',
                  marginBottom:'8px',
                  boxShadow:'var(--shadow-sm)',
                  display:'flex', gap:'16px', alignItems:'flex-start'
                }}>
                  <span style={{
                    flexShrink:0, width:'22px', height:'22px', borderRadius:'50%',
                    backgroundColor:'var(--primary-light)', color:'var(--primary)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'11px', fontWeight:'800', marginTop:'1px'
                  }}>{i + 1}</span>
                  <div>
                    <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)', marginBottom:'5px' }}>{faq.q}</div>
                    <div style={{ fontSize:'13px', color:'var(--info-text)', lineHeight:'1.55' }}>{faq.a}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "terms_conditions": {
        // live version = last entry with live:true
        const liveVersion  = [...tcVersions].reverse().find(v => v.live);
        const liveText     = liveVersion ? liveVersion.text : TC_INITIAL;
        const isDirty      = tcEditorText !== liveText;
        const hasDraft     = tcDraftText !== null;

        const handleDiscard = () => {
          setTcEditorText(liveText);
          setTcDraftText(null);
        };

        const handleSaveDraft = () => {
          setTcDraftText(tcEditorText);
        };

        const handlePublish = () => {
          const nextVer = tcVersions.length + 1;
          const now = new Date();
          const dateStr = now.toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:false }).replace(',','');
          // mark all old as not-live, add new live version
          const updated = tcVersions.map(v => ({ ...v, live: false }));
          updated.push({ version: nextVer, label: `Version ${nextVer}`, text: tcEditorText, date: dateStr, by: "Admin User", live: true });
          setTcVersions(updated);
          setTcDraftText(null);
        };

        const handleRestore = (text) => {
          setTcEditorText(text);
          setTcDraftText(null);
        };

        // After publish, the new live text = last live entry
        const latestLiveText = [...tcVersions].reverse().find(v => v.live)?.text ?? TC_INITIAL;
        const editorMatchesLive = tcEditorText === latestLiveText && !hasDraft;

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {/* Editor card */}
            <div style={{
              backgroundColor:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:'12px',
              boxShadow:'var(--shadow-sm)', overflow:'hidden'
            }}>
              {/* Toolbar */}
              <div style={{
                padding:'12px 20px', borderBottom:'1px solid var(--border)',
                display:'flex', alignItems:'center', justifyContent:'space-between',
                backgroundColor:'#fafbfc', flexWrap:'wrap', gap:'10px'
              }}>
                <div>
                  <div style={{ fontWeight:'700', fontSize:'14px', color:'var(--text-main)' }}>Terms & Conditions Editor</div>
                  <div style={{ fontSize:'11px', marginTop:'2px', display:'flex', alignItems:'center', gap:'6px' }}>
                    {editorMatchesLive ? (
                      <span style={{ color:'#059669', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#10b981', display:'inline-block' }}/>
                        In sync with live
                      </span>
                    ) : (
                      <span style={{ color:'#d97706', fontWeight:'600', display:'flex', alignItems:'center', gap:'4px' }}>
                        <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:'#f59e0b', display:'inline-block' }}/>
                        {hasDraft ? 'Draft saved · ' : 'Unsaved draft changes · '}
                        Published {liveVersion?.date ?? '01 Jun 2026, 9:00 AM'}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <button
                    disabled={editorMatchesLive}
                    onClick={handleDiscard}
                    style={{
                      padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                      border:'1px solid var(--border)', cursor: editorMatchesLive ? 'not-allowed' : 'pointer',
                      backgroundColor: editorMatchesLive ? '#f8fafc' : '#ffffff',
                      color: editorMatchesLive ? '#cbd5e1' : 'var(--text-main)',
                      transition:'all 0.15s ease'
                    }}
                  >Discard</button>
                  <button
                    disabled={editorMatchesLive}
                    onClick={handleSaveDraft}
                    style={{
                      padding:'7px 16px', borderRadius:'7px', fontSize:'13px', fontWeight:'600',
                      border:'1px solid var(--border)', cursor: editorMatchesLive ? 'not-allowed' : 'pointer',
                      backgroundColor: editorMatchesLive ? '#f8fafc' : '#ffffff',
                      color: editorMatchesLive ? '#cbd5e1' : 'var(--primary)',
                      borderColor: editorMatchesLive ? 'var(--border)' : 'var(--primary)',
                      transition:'all 0.15s ease'
                    }}
                  >Save Draft</button>
                  <button
                    onClick={handlePublish}
                    style={{
                      padding:'7px 18px', borderRadius:'7px', fontSize:'13px', fontWeight:'700',
                      border:'none', cursor:'pointer',
                      backgroundColor:'#10b981', color:'#ffffff',
                      transition:'background 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor='#059669'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor='#10b981'}
                  >Publish Live</button>
                </div>
              </div>

              {/* Two-column body: editor + version history */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 260px' }}>
                {/* Text editor */}
                <div style={{ borderRight:'1px solid var(--border)' }}>
                  <textarea
                    value={tcEditorText}
                    onChange={e => setTcEditorText(e.target.value)}
                    spellCheck={false}
                    style={{
                      width:'100%', minHeight:'440px', padding:'24px',
                      fontFamily:'"Courier New", Courier, monospace',
                      fontSize:'13px', lineHeight:'1.7', color:'var(--text-main)',
                      border:'none', outline:'none', resize:'vertical',
                      backgroundColor:'#ffffff'
                    }}
                  />
                </div>

                {/* Version history sidebar */}
                <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:'0' }}>
                  <div style={{ fontWeight:'700', fontSize:'13px', color:'var(--text-main)', marginBottom:'3px' }}>Version History</div>
                  <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'16px' }}>
                    {tcVersions.length} version{tcVersions.length !== 1 ? 's' : ''} saved
                  </div>

                  {/* Draft entry — shown only when draft exists */}
                  {hasDraft && (
                    <div style={{
                      padding:'12px 14px', borderRadius:'8px', marginBottom:'8px',
                      border:'1px solid rgba(245,158,11,0.3)', backgroundColor:'#fffbeb'
                    }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'4px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:'var(--warning-text)' }}>Draft</span>
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>Unsaved to production</div>
                      <button
                        onClick={() => handleRestore(tcDraftText)}
                        style={{
                          fontSize:'11px', fontWeight:'600', color:'var(--primary)',
                          background:'none', border:'none', cursor:'pointer', padding:0
                        }}
                      >Restore to editor →</button>
                    </div>
                  )}

                  {/* Published versions — newest first */}
                  {[...tcVersions].reverse().map((v, i) => (
                    <div key={v.version} style={{
                      padding:'12px 14px', borderRadius:'8px', marginBottom:'8px',
                      border:`1px solid ${v.live ? 'rgba(16,185,129,0.25)' : 'var(--border)'}`,
                      backgroundColor: v.live ? '#f0fdf4' : '#fafbfc'
                    }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'2px' }}>
                        <span style={{ fontSize:'12px', fontWeight:'700', color:'var(--text-main)' }}>
                          {i === 0 ? 'Latest' : v.label}
                        </span>
                        {v.live && (
                          <span style={{
                            fontSize:'10px', fontWeight:'700', padding:'2px 7px', borderRadius:'4px',
                            backgroundColor:'#10b981', color:'#ffffff', letterSpacing:'0.05em'
                          }}>LIVE</span>
                        )}
                      </div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)' }}>{v.date}</div>
                      <div style={{ fontSize:'11px', color:'var(--text-muted)', marginBottom:'6px' }}>by {v.by}</div>
                      <button
                        onClick={() => handleRestore(v.text)}
                        style={{
                          fontSize:'11px', fontWeight:'600', color:'var(--primary)',
                          background:'none', border:'none', cursor:'pointer', padding:0
                        }}
                      >Restore to editor →</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      default:
        return <div>View not implemented yet</div>;
    }
  };

  const getPageTitle = () => {
    switch (view) {
      case "dashboard": return "Dashboard";
      case "reports": return "Reports";
      case "duplicate_leads": return "Duplicate Leads";
      case "referral_policy": return "Referral Policy";
      case "fraud_monitor": return "Fraud Monitor";
      case "notification_log": return "Audit Trail";
      case "manage_faqs": return "Manage FAQs";
      case "terms_conditions": return "Terms & Conditions";
      case "policy_content": return "Referral Configuration";
      case "referral_payouts": return "Referral Payouts";
      case "payment_history": return "Payment History";
      default: return "Portal";
    }
  };

  // Get active notification count badges for sidebar
  const fraudBadge = currentUniData.notifications?.fraudFlags || 0;
  const duplicateBadge = currentUniData.duplicateLeads.filter(l => l.status === "Pending").length;
  const notifBadge = fraudBadge + duplicateBadge;

  return (
    <div className="app-container">
      
      {/* Left Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          
          {/* Header with University Select Dropdown */}
          <div className="sidebar-header">
            <div className="uni-select-container">
              <span className="uni-select-label">Select University</span>
              <div className="uni-select-wrapper">
                <select 
                  className="uni-select" 
                  value={selectedUni} 
                  onChange={handleUniChange}
                >
                  <option value="jamia_hamdard">Jamia Hamdard</option>
                  <option value="iit_bhilai">IIT Bhilai</option>
                  <option value="iit_mandi">IIT Mandi</option>
                </select>
                <ChevronDown size={16} className="uni-select-chevron" />
              </div>
            </div>
          </div>

          {/* Navigation Items (removed Course Benefits) */}
          <ul className="sidebar-menu">
            <li>
              <a 
                className={`sidebar-item ${view === "dashboard" ? "active" : ""}`}
                onClick={() => setView("dashboard")}
              >
                <div className="sidebar-item-left">
                  <LayoutDashboard size={18} />
                  <span>Dashboard</span>
                </div>
              </a>
            </li>
            
            <li>
              <a 
                className={`sidebar-item ${view === "reports" ? "active" : ""}`}
                onClick={() => setView("reports")}
              >
                <div className="sidebar-item-left">
                  <BarChart3 size={18} />
                  <span>Reports</span>
                </div>
              </a>
            </li>

            {/* <li>
              <a
                className={`sidebar-item ${view === "notification_log" ? "active" : ""}`}
                onClick={() => setView("notification_log")}
              >
                <div className="sidebar-item-left">
                  <Bell size={18} />
                  <span>Audit Trail</span>
                </div>
                {notifBadge > 0 && <span className="sidebar-badge">{notifBadge}</span>}
              </a>
            </li> */}

            {/* <li>
              <a 
                className={`sidebar-item ${view === "fraud_monitor" ? "active" : ""}`}
                onClick={() => setView("fraud_monitor")}
              >
                <div className="sidebar-item-left">
                  <ShieldAlert size={18} />
                  <span>Fraud Monitor</span>
                </div>
                {fraudBadge > 0 && <span className="sidebar-badge">{fraudBadge}</span>}
              </a>
            </li>

            <li>
              <a 
                className={`sidebar-item ${view === "duplicate_leads" ? "active" : ""}`}
                onClick={() => setView("duplicate_leads")}
              >
                <div className="sidebar-item-left">
                  <Copy size={18} />
                  <span>Duplicate Leads</span>
                </div>
                {duplicateBadge > 0 && <span className="sidebar-badge">{duplicateBadge}</span>}
              </a>
            </li> */}

            <li>
              <a 
                className={`sidebar-item ${view === "policy_content" ? "active" : ""}`}
                onClick={() => setView("policy_content")}
              >
                <div className="sidebar-item-left">
                  <FileText size={18} />
                  <span>Referral Configuration</span>
                </div>
              </a>
            </li>

            <li>
              <a 
                className={`sidebar-item ${view === "referral_payouts" ? "active" : ""}`}
                onClick={() => setView("referral_payouts")}
              >
                <div className="sidebar-item-left">
                  <TrendingUp size={18} />
                  <span>Referral Payouts</span>
                </div>
              </a>
            </li>

            <li>
              <a 
                className={`sidebar-item ${view === "payment_history" ? "active" : ""}`}
                onClick={() => setView("payment_history")}
              >
                <div className="sidebar-item-left">
                  <BarChart3 size={18} />
                  <span>Payment History</span>
                </div>
              </a>
            </li>

            {/* <li>
              <a 
                className={`sidebar-item ${view === "manage_faqs" ? "active" : ""}`}
                onClick={() => setView("manage_faqs")}
              >
                <div className="sidebar-item-left">
                  <HelpCircle size={18} />
                  <span>Manage FAQs</span>
                </div>
              </a>
            </li>

            <li>
              <a 
                className={`sidebar-item ${view === "referral_policy" ? "active" : ""}`}
                onClick={() => setView("referral_policy")}
              >
                <div className="sidebar-item-left">
                  <FileText size={18} />
                  <span>Referral Policy</span>
                </div>
              </a>
            </li>

            <li>
              <a 
                className={`sidebar-item ${view === "terms_conditions" ? "active" : ""}`}
                onClick={() => setView("terms_conditions")}
              >
                <div className="sidebar-item-left">
                  <Shield size={18} />
                  <span>Terms & Conditions</span>
                </div>
              </a>
            </li> */}
          </ul>
        </div>

        {/* Sidebar Footer — Role Switcher */}
        <div className="sidebar-footer" style={{ flexDirection: 'column', gap: '0', padding: '0' }}>
          {/* Current user — Admin (active) */}
          <div style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            backgroundColor: 'rgba(81,70,151,0.12)',
            borderTop: '1px solid rgba(81,70,151,0.2)',
          }}>
            <div className="sidebar-avatar" style={{ width: '32px', height: '32px', fontSize: '12px', flexShrink: 0 }}>AU</div>
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <span className="sidebar-username" style={{ fontSize: '13px' }}>Admin User</span>
              <span className="sidebar-role" style={{ fontSize: '10px' }}>App Support · Active</span>
            </div>
            <div style={{
              width: '7px', height: '7px', borderRadius: '50%',
              backgroundColor: '#10b981', flexShrink: 0,
            }} />
          </div>
        </div>
      </aside>

      {/* Main Panel Content Wrapper */}
      <main className="main-wrapper">
        <header className="top-nav">
          <div className="page-title-group">
            <h1 className="page-title">{getPageTitle()}</h1>
            <span className="page-subtitle">Referral Module Administration</span>
          </div>
          <div className="nav-actions">
            <button className="portal-btn">
              Student Portal <ExternalLink size={14} />
            </button>
          </div>
        </header>

        <section className="content-container">
          {renderContent()}
        </section>
      </main>

      {/* Add New Program Modal */}
      {showAddProgram && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '32px', width: '480px', maxWidth: '90vw',
            boxShadow: '0 20px 60px rgba(226,223,241,0.8)'
          }}>
            <h3 style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-main)', marginBottom: '24px' }}>
              Add New Program
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Programme */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>
                  Programme
                </label>
                <input
                  type="text"
                  value={programName}
                  onChange={e => setProgramName(e.target.value)}
                  placeholder="Enter programme name"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>

              {/* Type */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>
                  Type
                </label>
                <select
                  value={programType}
                  onChange={e => setProgramType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    backgroundColor: '#ffffff', cursor: 'pointer'
                  }}
                >
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>

              {/* Referrer Incentive */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>
                  Referrer Incentive (₹, in Rupees)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={referrerIncentive}
                  onChange={e => setReferrerIncentive(e.target.value)}
                  placeholder="e.g. 5000"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>

              {/* Referee Discount */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>
                  Referee Discount (% of cost)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={refereeDiscount}
                  onChange={e => setRefereeDiscount(e.target.value)}
                  placeholder="e.g. 10"
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.target.style.borderColor = '#ddd'}
                />
              </div>

              {/* Effective From */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#666', marginBottom: '6px' }}>
                  Effective From
                </label>
                <input
                  type="date"
                  value={effectiveFrom}
                  onChange={e => setEffectiveFrom(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', border: '1.5px solid #ddd',
                    borderRadius: '8px', fontSize: '14px', outline: 'none',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {addProgramError && (
                <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--danger-text)' }}>
                  {addProgramError}
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button
                onClick={closeAddProgramModal}
                style={{
                  padding: '10px 20px', border: '1.5px solid #ddd',
                  borderRadius: '8px', backgroundColor: '#ffffff',
                  color: '#666', fontSize: '14px', fontWeight: '500',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#f5f5f5'; e.currentTarget.style.borderColor = '#ccc'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.borderColor = '#ddd'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNewProgram}
                style={{
                  padding: '10px 24px', border: 'none', borderRadius: '8px',
                  backgroundColor: 'var(--primary)', color: '#ffffff',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
              >
                Save Program
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
