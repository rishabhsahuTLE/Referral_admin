import React, { useState } from "react";
import { Search, BarChart3, PieChart, Users, Award, TrendingUp, AlertTriangle, ToggleLeft, ToggleRight, Info, Download } from "lucide-react";
import { downloadCSV } from "../utils/csv";

export default function Reports({ data }) {
  const [activeSubTab, setActiveSubTab] = useState("referrer_report");
  const [searchTerm, setSearchTerm] = useState("");
  const [chartView, setChartView] = useState("referrer"); // "referrer" or "referee"
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);

  // Referee report state
  const [refereeSearchTerm, setRefereeSearchTerm] = useState("");
  const [selectedRefereeCourse, setSelectedRefereeCourse] = useState("All");

  const { reports, refereeReports = [], programs, stats } = data;

  // Derive unique course list from programs for the dropdown
  const courseOptions = ["All", ...programs.map(p => p.name)];

  // Build a referrer → courses mapping from duplicateLeads
  const referrerCourseMap = {};
  (data.duplicateLeads || []).forEach(dl => {
    if (!referrerCourseMap[dl.referredBy]) referrerCourseMap[dl.referredBy] = new Set();
    referrerCourseMap[dl.referredBy].add(dl.course);
  });

  // Helper: navigate to Referrer Report tab with a course pre-selected
  const navigateToReferrerReport = (courseName) => {
    setSelectedCourse(courseName);
    setActiveSubTab("referrer_report");
  };

  // Helper: navigate to Referee Report tab with a course pre-selected
  const navigateToRefereeReport = (courseName) => {
    setSelectedRefereeCourse(courseName);
    setActiveSubTab("referee_report");
  };

  // Unified chart click: routes based on current toggle
  const handleChartClick = (courseName) => {
    if (chartView === "referrer") {
      navigateToReferrerReport(courseName);
    } else {
      navigateToRefereeReport(courseName);
    }
  };

  // Filter reports list based on search term and selected course
  const filteredReports = reports.filter(rep => {
    const matchesSearch =
      rep.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedCourse === "All") return true;
    const courses = referrerCourseMap[rep.student];
    return courses && courses.has(selectedCourse);
  });

  // Filter referee reports by search + selected course (referee course)
  const filteredRefereeReports = refereeReports.filter(rep => {
    const matchesSearch =
      rep.refereeName.toLowerCase().includes(refereeSearchTerm.toLowerCase()) ||
      rep.refereeEnrollNo.toLowerCase().includes(refereeSearchTerm.toLowerCase()) ||
      rep.referrerName.toLowerCase().includes(refereeSearchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (selectedRefereeCourse === "All") return true;
    return rep.refereeCourse === selectedRefereeCourse;
  });

  // Download whatever is currently previewed in the Referrer Report table
  const handleDownloadReferrerReport = () => {
    const header = ["Student", "Enrollment No", "No. of Referrals", "No. Converted", "In Progress", "Conversion Rate", "Admitted", "Paid", "In Process", "Status"];
    const rows = filteredReports.map(rep => {
      const rate = rep.submitted > 0 ? Math.round((rep.converted / rep.submitted) * 100) : 0;
      const inProgressCount = rep.submitted - rep.converted;
      return [
        rep.student,
        rep.enrollmentNo,
        rep.submitted,
        rep.converted,
        inProgressCount,
        `${rate}%`,
        rep.admitted || Math.round(rep.converted * 0.6),
        rep.paid || Math.round(rep.converted * 0.4),
        rep.inProcess || inProgressCount,
        rep.status
      ];
    });
    downloadCSV("referrer-report.csv", [header, ...rows]);
  };

  // Download whatever is currently previewed in the Referee Report table
  const handleDownloadRefereeReport = () => {
    const header = ["Referee", "Enrollment No", "Referee Course", "Referrer", "Referrer Course", "Application Status", "Admitted", "Paid", "In Process", "Status"];
    const rows = filteredRefereeReports.map(rep => [
      rep.refereeName,
      rep.refereeEnrollNo,
      rep.refereeCourse,
      rep.referrerName,
      rep.referrerCourse,
      rep.applicationStatus,
      rep.admitted,
      rep.paid,
      rep.inProcess,
      rep.status
    ]);
    downloadCSV("referee-report.csv", [header, ...rows]);
  };

  // Math helper to build SVG Pie Chart slices
  const getCoordinatesForPercent = (percent) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  // Get data based on chart view (referrer or referee)
  const getChartData = () => {
    return programs.map(p => ({
      name: p.name,
      converted: chartView === "referrer" ? p.referrerData.converted : p.refereeData.converted,
      flagged: chartView === "referrer" ? p.referrerData.flagged : p.refereeData.flagged,
      inProcess: chartView === "referrer" ? p.referrerData.inProcess : p.refereeData.inProcess,
      total: (chartView === "referrer" ? p.referrerData.converted : p.refereeData.converted) +
             (chartView === "referrer" ? p.referrerData.flagged : p.refereeData.flagged) +
             (chartView === "referrer" ? p.referrerData.inProcess : p.refereeData.inProcess),
      cost: p.cost,
      referrerIncentive: p.referrerIncentive,
      refereeDiscount: p.refereeDiscount
    }));
  };

  const chartData = getChartData();

  // Calculate total cost of referral (doesn't change with toggle)
  const calculateTotalReferralCost = () => {
    let totalReferralCost = 0;
    let totalCourseRevenue = 0;
    
    programs.forEach(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      totalReferralCost += referralCostPerConversion * p.converted;
      totalCourseRevenue += p.cost * p.converted;
    });
    
    return {
      totalReferralCost,
      totalCourseRevenue,
      percentage: totalCourseRevenue > 0 ? (totalReferralCost / totalCourseRevenue * 100).toFixed(1) : 0
    };
  };

  const totalReferralData = calculateTotalReferralCost();

  // Render stacked bar chart for overall referrals
  const renderStackedBarChart = () => {
    const chartHeight = 280;
    const chartWidth = 600;
    const paddingLeft = 50;
    const paddingBottom = 50;
    const paddingTop = 30;
    const paddingRight = 20;

    const dataHeight = chartHeight - paddingTop - paddingBottom;
    const dataWidth = chartWidth - paddingLeft - paddingRight;

    const maxVal = Math.max(...chartData.map(d => d.total));
    const barWidth = Math.floor(dataWidth / chartData.length) - 20;

    const colors = {
      enrolled: "#10b981",
      flagged: "#ef4444",
      inProcess: "#f59e0b"
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', maxHeight: '300px' }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = paddingTop + dataHeight - tick * dataHeight;
            const value = Math.round(tick * maxVal);
            return (
              <g key={tick}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={chartWidth - paddingRight} 
                  y2={y} 
                  stroke="var(--border)" 
                  strokeDasharray="4" 
                />
                <text 
                  x={paddingLeft - 10} 
                  y={y + 4} 
                  fontSize="10" 
                  fill="var(--text-muted)" 
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Stacked bars */}
          {chartData.map((item, index) => {
            const x = paddingLeft + index * (dataWidth / chartData.length) + 10;
            let currentY = paddingTop + dataHeight;

            const segments = [
              { value: item.inProcess, color: colors.inProcess, label: 'In Process' },
              { value: item.flagged, color: colors.flagged, label: 'Flagged' },
              { value: item.converted, color: colors.enrolled, label: 'Enrolled' }
            ];

            return (
              <g key={index} onClick={() => handleChartClick(item.name)} style={{ cursor: 'pointer' }}>
                {segments.map((seg, segIndex) => {
                  if (seg.value === 0) return null;
                  const segHeight = (seg.value / maxVal) * dataHeight;
                  const y = currentY - segHeight;
                  currentY = y;

                  return (
                    <rect
                      key={segIndex}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={segHeight}
                      fill={seg.color}
                      rx="2"
                      style={{ transition: 'all 0.3s ease', cursor: 'pointer' }}
                      title={`${item.name} - ${seg.label}: ${seg.value} — Click to view report`}
                    />
                  );
                })}
                {/* Total label on top */}
                <text 
                  x={x + barWidth / 2} 
                  y={currentY - 8} 
                  fontSize="11" 
                  fontWeight="700" 
                  fill="var(--text-main)" 
                  textAnchor="middle"
                >
                  {item.total}
                </text>
                {/* X Axis Label */}
                <text 
                  x={x + barWidth / 2} 
                  y={paddingTop + dataHeight + 20} 
                  fontSize="9" 
                  fontWeight="600" 
                  fill="var(--text-muted)" 
                  textAnchor="middle"
                  transform={`rotate(-25, ${x + barWidth / 2}, ${paddingTop + dataHeight + 20})`}
                >
                  {item.name}
                </text>
              </g>
            );
          })}

          {/* Base Axis Line */}
          <line 
            x1={paddingLeft} 
            y1={paddingTop + dataHeight} 
            x2={chartWidth - paddingRight} 
            y2={paddingTop + dataHeight} 
            stroke="var(--text-muted)" 
            strokeWidth="1" 
          />
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.enrolled, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Enrolled</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.flagged, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Flagged</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', backgroundColor: colors.inProcess, borderRadius: '2px' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>In Process</span>
          </div>
        </div>
      </div>
    );
  };

  // Render pie chart for enrolled students by course
  const renderEnrolledPieChart = () => {
    const data = chartData.map(d => ({ name: d.name, value: d.converted })).filter(d => d.value > 0);
    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    
    const colors = ["#5c4ff2", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];

    if (totalVal === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center', width: '100%' }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percent = item.value / totalVal;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');
            
            return (
              <path 
                key={index} 
                d={pathData} 
                fill={colors[index % colors.length]} 
                stroke="#ffffff" 
                strokeWidth="0.02"
                onClick={() => handleChartClick(item.name)}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleChartClick(item.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>({Math.round((item.value / totalVal) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render pie chart for conversion rate by course
  const renderConversionRatePieChart = () => {
    const data = chartData.map(d => {
      const rate = d.total > 0 ? (d.converted / d.total) * 100 : 0;
      return { name: d.name, value: rate };
    }).filter(d => d.value > 0);

    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#5c4ff2", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];

    if (totalVal === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center', width: '100%' }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percent = item.value / totalVal;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');
            
            return (
              <path 
                key={index} 
                d={pathData} 
                fill={colors[index % colors.length]} 
                stroke="#ffffff" 
                strokeWidth="0.02"
                onClick={() => handleChartClick(item.name)}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleChartClick(item.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>({item.value.toFixed(1)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render pie chart for flagged students by course
  const renderFlaggedPieChart = () => {
    const data = chartData.map(d => ({ name: d.name, value: d.flagged })).filter(d => d.value > 0);
    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4"];

    if (totalVal === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center', width: '100%' }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percent = item.value / totalVal;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');
            
            return (
              <path 
                key={index} 
                d={pathData} 
                fill={colors[index % colors.length]} 
                stroke="#ffffff" 
                strokeWidth="0.02"
                onClick={() => handleChartClick(item.name)}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleChartClick(item.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>({Math.round((item.value / totalVal) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Cost of Referral tile
  const renderReferralCostTile = () => {
    const courseReferralCosts = programs.map(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      const totalReferralCost = referralCostPerConversion * p.converted;
      const totalCourseCost = p.cost * p.converted;
      const percentage = totalCourseCost > 0 ? (totalReferralCost / totalCourseCost * 100).toFixed(1) : 0;
      return { name: p.name, referralCost: totalReferralCost, percentage };
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        {/* Total Referral Cost Percentage */}
        <div style={{ textAlign: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Total Cost of Referral</div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primary)' }}>{totalReferralData.percentage}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            ₹{totalReferralData.totalReferralCost.toLocaleString()} / ₹{totalReferralData.totalCourseRevenue.toLocaleString()}
          </div>
        </div>
        
        {/* Course-wise Referral Cost */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {courseReferralCosts.map((item, index) => (
            <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)' }}>
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render pie chart for referral cost ratio by course
  const renderReferralCostPieChart = () => {
    const data = programs.map(p => {
      const referralCostPerConversion = p.referrerIncentive + (p.cost * p.refereeDiscount / 100);
      const totalReferralCost = referralCostPerConversion * p.converted;
      return { name: p.name, value: totalReferralCost };
    }).filter(d => d.value > 0);

    const totalVal = data.reduce((sum, item) => sum + item.value, 0);
    const colors = ["#5c4ff2", "#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4"];

    if (totalVal === 0) return <div style={{ color: 'var(--text-muted)' }}>No data available</div>;

    let cumulativePercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '30px', justifyContent: 'center', width: '100%' }}>
        <svg viewBox="-1.2 -1.2 2.4 2.4" style={{ width: '180px', height: '180px', transform: 'rotate(-90deg)' }}>
          {data.map((item, index) => {
            const percent = item.value / totalVal;
            const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
            cumulativePercent += percent;
            const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
            const largeArcFlag = percent > 0.5 ? 1 : 0;
            const pathData = [`M 0 0`, `L ${startX} ${startY}`, `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`, `Z`].join(' ');
            
            return (
              <path 
                key={index} 
                d={pathData} 
                fill={colors[index % colors.length]} 
                stroke="#ffffff" 
                strokeWidth="0.02"
                onClick={() => handleChartClick(item.name)}
                style={{ transition: 'opacity 0.2s ease', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              />
            );
          })}
          <circle cx="0" cy="0" r="0.5" fill="#ffffff" />
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.map((item, index) => (
            <div
              key={index}
              onClick={() => handleChartClick(item.name)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}
            >
              <div style={{ width: '10px', height: '10px', backgroundColor: colors[index % colors.length], borderRadius: '2px' }}></div>
              <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{item.name}</span>
              <span style={{ color: 'var(--text-muted)' }}>(₹{(item.value / 1000).toFixed(0)}K - {Math.round((item.value / totalVal) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Summaries (matching the three boxes from screenshot 1) */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Leads Generated</div>
          <div className="stat-val">{stats.leadsGenerated}</div>
          <div className="stat-trend trend-up">
            <TrendingUp size={14} /> {stats.leadsGrowth}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Admissions Converted</div>
          <div className="stat-val">{stats.admissionsConverted}</div>
          <div className="stat-trend trend-up">
            <TrendingUp size={14} /> {stats.conversionsGrowth}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Drop-offs</div>
          <div className="stat-val">{stats.dropOffs}</div>
          <div className="stat-trend trend-up" style={{ color: 'var(--danger)' }}>
            <TrendingUp size={14} /> {stats.dropOffsGrowth}
          </div>
        </div>
      </div>

      {/* Reports Inner Page Navigation */}
      <div className="inner-tabs-container">
        <div className="inner-tabs">
          <div 
            className={`inner-tab ${activeSubTab === "referrer_report" ? "active" : ""}`}
            onClick={() => setActiveSubTab("referrer_report")}
          >
            Referrer Report
          </div>
          <div 
            className={`inner-tab ${activeSubTab === "referee_report" ? "active" : ""}`}
            onClick={() => setActiveSubTab("referee_report")}
          >
            Referee Report
          </div>
          <div 
            className={`inner-tab ${activeSubTab === "attribution_audit" ? "active" : ""}`}
            onClick={() => setActiveSubTab("attribution_audit")}
          >
            Attribution Audit <span className="inner-tab-badge">1</span>
          </div>
          <div 
            className={`inner-tab ${activeSubTab === "visual_charts" ? "active" : ""}`}
            onClick={() => setActiveSubTab("visual_charts")}
          >
            Visual Charts
          </div>
        </div>
      </div>

      {/* Conditional Content based on selected inner tab */}
      {activeSubTab === "referrer_report" && (
        <>
          {/* Search bar + Course filter + Download — evenly spread, equidistant */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar-container" style={{ marginBottom: 0, maxWidth: 'none', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by student or enrollment no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Course filter dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1.5px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                {courseOptions.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {/* Download button */}
            <button
              onClick={handleDownloadReferrerReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <Download size={15} /> Download CSV
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Enrollment No</th>
                  <th>No. of Referrals</th>
                  <th>No. Converted</th>
                  <th>In Progress</th>
                  <th>Conversion Rate</th>
                  <th>Referrals Stage Breakdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((rep, idx) => {
                  const rate = rep.submitted > 0 ? Math.round((rep.converted / rep.submitted) * 100) : 0;
                  
                  let barColor = 'var(--danger)';
                  if (rate >= 70) barColor = 'var(--success)';
                  else if (rate >= 50) barColor = 'var(--warning)';

                  // In progress can be calculated as: submitted - converted
                  const inProgressCount = rep.submitted - rep.converted;

                  return (
                    <tr key={idx}>
                      <td>
                        <div className="student-name">{rep.student}</div>
                      </td>
                      <td style={{ color: "var(--text-muted)" }}>{rep.enrollmentNo}</td>
                      <td style={{ fontWeight: '600' }}>{rep.submitted}</td>
                      <td style={{ fontWeight: '600', color: 'var(--success-text)' }}>{rep.converted}</td>
                      <td style={{ fontWeight: '600', color: 'var(--warning-text)' }}>{inProgressCount}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="prog-progress-container" style={{ width: '80px', marginBottom: '0' }}>
                            <div className="prog-progress-bar" style={{ width: `${rate}%`, backgroundColor: barColor }}></div>
                          </div>
                          <span style={{ fontWeight: '700', color: barColor }}>{rate}%</span>
                        </div>
                      </td>
                      <td>
                        <div className="stages-list">
                          <span className="stage-pill stage-admitted">
                            Admitted: {rep.admitted || Math.round(rep.converted * 0.6)}
                          </span>
                          <span className="stage-pill stage-paid">
                            Paid: {rep.paid || Math.round(rep.converted * 0.4)}
                          </span>
                          <span className="stage-pill stage-in-process">
                            Process: {rep.inProcess || inProgressCount}
                          </span>
                        </div>
                      </td>
                      <td>
                        {rep.status === 'Flagged' ? (
                          <span className="btn-flagged">Flagged</span>
                        ) : (
                          <span className="btn-clear">Clear</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      {selectedCourse !== "All"
                        ? `No referrers found for "${selectedCourse}"${searchTerm ? ` matching "${searchTerm}"` : ""}`
                        : `No student records found matching "${searchTerm}"`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSubTab === "referee_report" && (
        <>
          {/* Search bar + Course filter + Download — evenly spread, equidistant */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignItems: 'center' }}>
            <div className="search-bar-container" style={{ marginBottom: 0, maxWidth: 'none', width: '100%' }}>
              <Search size={16} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search by referee, referrer or enrollment no..."
                value={refereeSearchTerm}
                onChange={(e) => setRefereeSearchTerm(e.target.value)}
              />
            </div>
            {/* Referee course filter dropdown */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
              <select
                value={selectedRefereeCourse}
                onChange={(e) => setSelectedRefereeCourse(e.target.value)}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  width: '100%',
                  padding: '9px 36px 9px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  border: '1.5px solid var(--border)',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--primary)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              >
                {courseOptions.map(c => (
                  <option key={c} value={c}>{c === "All" ? "All Courses" : c}</option>
                ))}
              </select>
              <svg
                style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--text-muted)' }}
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            {/* Download button */}
            <button
              onClick={handleDownloadRefereeReport}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '9px 14px',
                fontSize: '13px',
                fontWeight: '700',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              <Download size={15} /> Download CSV
            </button>
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Referee</th>
                  <th>Enrollment No</th>
                  <th>Referee Course</th>
                  <th>Referrer</th>
                  <th>Referrer Course</th>
                  <th>Application Status</th>
                  <th>Stage Breakdown</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefereeReports.map((rep, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="student-name">{rep.refereeName}</div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{rep.refereeEnrollNo}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '600',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary)'
                      }}>
                        {rep.refereeCourse}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{rep.referrerName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{rep.referrerCourse}</td>
                    <td>
                      {rep.applicationStatus === 'Enrolled' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', border: '1px solid rgba(16,185,129,0.2)' }}>
                          ● Enrolled
                        </span>
                      )}
                      {rep.applicationStatus === 'In Progress' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)', border: '1px solid rgba(245,158,11,0.2)' }}>
                          ● In Progress
                        </span>
                      )}
                      {rep.applicationStatus === 'Flagged' && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          ● Flagged
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="stages-list">
                        <span className="stage-pill stage-admitted">Admitted: {rep.admitted}</span>
                        <span className="stage-pill stage-paid">Paid: {rep.paid}</span>
                        <span className="stage-pill stage-in-process">Process: {rep.inProcess}</span>
                      </div>
                    </td>
                    <td>
                      {rep.status === 'Flagged' ? (
                        <span className="btn-flagged">Flagged</span>
                      ) : (
                        <span className="btn-clear">Clear</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRefereeReports.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      {selectedRefereeCourse !== "All"
                        ? `No referees found for "${selectedRefereeCourse}"${refereeSearchTerm ? ` matching "${refereeSearchTerm}"` : ""}`
                        : `No referee records found matching "${refereeSearchTerm}"`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeSubTab === "attribution_audit" && (() => {
        const auditRows = [
          { student: "Rahul Sharma",  origCourse: "B.Tech CSE",     newCourse: "B.Tech AI/ML",   referring: "Aditya Verma",  date: "10 Jun 2026", status: "Preserved" },
          { student: "Priya Mehta",   origCourse: "MBA Marketing",   newCourse: "MBA Finance",    referring: "Pradeep Nair",  date: "05 Jun 2026", status: "Preserved" },
          { student: "Kavya Iyer",    origCourse: "B.Com",           newCourse: "BCA",            referring: "Neha Kapoor",   date: "28 May 2026", status: "Broken"    },
          { student: "Rohan Gupta",   origCourse: "B.Tech CSE",      newCourse: "MCA",            referring: "Divya Menon",   date: "01 Jun 2026", status: "Preserved" },
        ];
        const totalChanges = auditRows.length;
        const preserved   = auditRows.filter(r => r.status === "Preserved").length;
        const broken      = auditRows.filter(r => r.status === "Broken").length;

        return (
          <div className="table-container">
            {/* Summary bar */}
            <div style={{
              padding: '14px 24px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#fafbfc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '13px' }}>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{totalChanges}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Total Course Changes</span>
                </span>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--success-text)' }}>{preserved}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Preserved</span>
                </span>
                <span>
                  <strong style={{ fontSize: '15px', color: 'var(--danger-text)' }}>{broken}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '5px' }}>Broken</span>
                </span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                BR-15: referral source must be preserved on course change
              </span>
            </div>

            {/* Table */}
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Original Course</th>
                  <th>New Course</th>
                  <th>Referring Student</th>
                  <th>Date</th>
                  <th>Attribution</th>
                </tr>
              </thead>
              <tbody>
                {auditRows.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: '700' }}>{row.student}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.origCourse}</td>
                    <td style={{ fontWeight: '600', color: row.status === 'Broken' ? 'var(--danger-text)' : 'var(--text-main)' }}>
                      {row.newCourse}
                    </td>
                    <td style={{ color: 'var(--info-text)', fontWeight: '500' }}>{row.referring}</td>
                    <td style={{ color: row.status === 'Broken' ? 'var(--danger-text)' : 'var(--text-muted)', fontSize: '12px' }}>
                      {row.date}
                    </td>
                    <td>
                      {row.status === 'Preserved' ? (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: 'var(--success-bg)', color: 'var(--success-text)',
                          border: '1px solid rgba(16,185,129,0.2)'
                        }}>
                          ● Preserved
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '4px',
                          padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                          backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
                          border: '1px solid rgba(239,68,68,0.2)'
                        }}>
                          ● Broken
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })()}

      {activeSubTab === "visual_charts" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Sticky Toggle Switch */}
          <div style={{ 
            position: 'sticky', 
            top: '0', 
            zIndex: '100', 
            backgroundColor: 'var(--bg-app)', 
            padding: '16px 0', 
            borderBottom: '1px solid var(--border)',
            marginBottom: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: chartView === 'referrer' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                Referrer Courses
              </span>
              <button
                onClick={() => setChartView(chartView === 'referrer' ? 'referee' : 'referrer')}
                style={{
                  width: '60px',
                  height: '32px',
                  borderRadius: '16px',
                  backgroundColor: chartView === 'referrer' ? 'var(--primary)' : 'var(--border)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    transform: chartView === 'referrer' ? 'translateX(0)' : 'translateX(28px)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </button>
              <span style={{ fontSize: '14px', fontWeight: '600', color: chartView === 'referee' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                Referee Courses
              </span>

              {/* Info (i) button */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setShowInfoTooltip(v => !v)}
                  onBlur={() => setShowInfoTooltip(false)}
                  aria-label="Toggle chart info"
                  style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--primary)',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    color: 'var(--primary)',
                    flexShrink: 0
                  }}
                >
                  <Info size={13} />
                </button>

                {showInfoTooltip && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '30px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '340px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid rgba(239,68,68,0.35)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      zIndex: 200
                    }}
                  >
                    {/* small arrow */}
                    <div style={{
                      position: 'absolute',
                      top: '-7px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '12px',
                      height: '12px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1.5px solid rgba(239,68,68,0.35)',
                      borderBottom: 'none',
                      borderRight: 'none'
                    }} />
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      lineHeight: '1.6',
                      color: '#ef4444',
                      fontWeight: '500'
                    }}>
                      Use the toggle to switch the perspective of the charts. <strong>Referrer Courses</strong> groups data by the course of the student who made the referral, while <strong>Referee Courses</strong> groups data by the course of the referred student. All charts update automatically based on the selected view.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
            {/* 1. Overall Referrals - Stacked Bar Chart */}
            <div className="chart-card" style={{ gridColumn: 'span 2' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Overall Referrals</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total referrals breakdown by status across all courses</p>
              </div>
              <div className="chart-container-inner">
                {renderStackedBarChart()}
              </div>
            </div>

            {/* 2. Enrolled Students - Pie Chart */}
            <div className="chart-card">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Enrolled Students</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Distribution of enrolled students by course</p>
              </div>
              <div className="chart-container-inner">
                {renderEnrolledPieChart()}
              </div>
            </div>

            {/* 3. Conversion Rate - Pie Chart */}
            <div className="chart-card">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Conversion Rate</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Conversion rate distribution by course</p>
              </div>
              <div className="chart-container-inner">
                {renderConversionRatePieChart()}
              </div>
            </div>

            {/* 4. Flagged Students - Pie Chart */}
            <div className="chart-card">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Flagged Students</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Distribution of flagged students by course</p>
              </div>
              <div className="chart-container-inner">
                {renderFlaggedPieChart()}
              </div>
            </div>

            {/* 5. Cost of Referral */}
            <div className="chart-card">
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Cost of Referral</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Referral cost as percentage of course revenue</p>
              </div>
              <div className="chart-container-inner">
                {renderReferralCostTile()}
              </div>
            </div>

            {/* 6. Referral Cost Ratio - Pie Chart */}
            <div className="chart-card" style={{ gridColumn: 'span 2' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Referral Cost Ratio by Course</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Distribution of referral costs across courses</p>
              </div>
              <div className="chart-container-inner">
                {renderReferralCostPieChart()}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
