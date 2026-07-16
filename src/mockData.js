// ── Referee report generator ──────────────────────────────────────────────
// Each referrer's aggregate counts in `reports` (submitted/converted/dropped)
// must be backed by that exact number of individual entries in
// `refereeReports`, so filtering/counting stays consistent between the two
// tables. Rather than hand-author dozens of records per university, we
// generate them deterministically from the aggregate numbers.

const REFEREE_FIRST_NAMES = [
  "Priya", "Rohan", "Anita", "Karan", "Sneha", "Vikash", "Meera", "Aakash", "Pooja", "Rahul",
  "Ishita", "Dev", "Kavita", "Nikhil", "Ritika", "Sameer", "Tanya", "Yash", "Anjali", "Manish",
  "Swati", "Gaurav", "Neha", "Vivek", "Shreya", "Aman", "Divya", "Rajat", "Preeti", "Suresh",
  "Alok", "Nidhi", "Harsh", "Komal", "Varun", "Sonal", "Ankit", "Radha", "Deepak", "Anushka"
];

const REFEREE_LAST_NAMES = [
  "Sharma", "Verma", "Gupta", "Iyer", "Nair", "Reddy", "Menon", "Joshi", "Kapoor", "Chopra",
  "Malhotra", "Bose", "Rao", "Pillai", "Mehta", "Agarwal", "Bhat", "Das", "Chatterjee", "Kulkarni"
];

function generateRefereeName(seed) {
  const first = REFEREE_FIRST_NAMES[seed % REFEREE_FIRST_NAMES.length];
  const last = REFEREE_LAST_NAMES[(seed * 7 + 3) % REFEREE_LAST_NAMES.length];
  return `${first} ${last}`;
}

const DROP_REASONS = [
  "Chose another university",
  "Financial constraints",
  "Lost interest",
  "Admission requirements not met",
  "Delayed response from applicant",
];

function generateLeadDate(seed) {
  const daysAgo = 5 + ((seed * 13) % 90);
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Enrollment happens some weeks after the initial referral — reuses the same lead-date
// "days ago" math, just closer to today, so it never lands after the lead date.
function generateEnrollDate(seed) {
  const leadDaysAgo = 5 + ((seed * 13) % 90);
  const daysAgo = Math.max(1, leadDaysAgo - (10 + (seed % 15)));
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Pool of course names an admin can pick from in the "Add Course" flow, before any
// university-specific filtering (already-added courses are excluded per-university).
export const COURSE_POOL = {
  UG: [
    "B.Tech CSE", "B.Tech AI/ML", "B.Tech ECE", "B.Tech Mechanical", "B.Tech Electrical",
    "B.Tech Civil", "B.Tech Data Science", "B.Sc Data Science", "B.Sc Physics", "B.Sc Chemistry",
    "B.Sc Mathematics", "BCA", "BBA", "B.Com", "BA English",
  ],
  PG: [
    "MBA Finance", "MBA Marketing", "MBA HR", "MCA", "M.Tech AI & ML", "M.Tech Power Systems",
    "M.Tech Biotechnology", "M.Tech Civil", "MA English", "M.Sc Mathematics", "M.Sc Physics",
    "M.Com", "PhD Physics", "PhD Chemistry",
  ],
};

// Catalog cost for each pool course, so the Add-course modal can autofill "Course Cost"
// the moment a course is picked, instead of the admin having to type it (or it silently
// defaulting to 0).
export const COURSE_COST_MAP = {
  "B.Tech CSE": 180000,
  "B.Tech AI/ML": 190000,
  "B.Tech ECE": 150000,
  "B.Tech Mechanical": 170000,
  "B.Tech Electrical": 165000,
  "B.Tech Civil": 155000,
  "B.Tech Data Science": 200000,
  "B.Sc Data Science": 95000,
  "B.Sc Physics": 80000,
  "B.Sc Chemistry": 82000,
  "B.Sc Mathematics": 78000,
  "BCA": 90000,
  "BBA": 100000,
  "B.Com": 70000,
  "BA English": 60000,
  "MBA Finance": 200000,
  "MBA Marketing": 190000,
  "MBA HR": 180000,
  "MCA": 120000,
  "M.Tech AI & ML": 160000,
  "M.Tech Power Systems": 150000,
  "M.Tech Biotechnology": 140000,
  "M.Tech Civil": 145000,
  "MA English": 70000,
  "M.Sc Mathematics": 85000,
  "M.Sc Physics": 88000,
  "M.Com": 75000,
  "PhD Physics": 120000,
  "PhD Chemistry": 125000,
};

// Fills in the newer Reward Master columns (effective-to, fee head, last-modified audit
// trail) for programs that predate those fields, without having to hand-edit every entry.
function withPolicyDefaults(programs) {
  return programs.map((p) => ({
    effectiveTo: "-",
    feeHead: "Tuition Fees",
    lastModifiedBy: "-",
    lastModifiedOn: "-",
    ...p,
  }));
}

export const DEFAULT_NUDGE_MESSAGE = "Bank details are not available.";
const PAYOUT_POC_NAME = "Rishabh Sahu";
const PAYOUT_POC_PHONE = "+91 98765 43210";

function payoutDaysAgo(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date.toLocaleDateString("en-IN");
}

// Shared across Referral Payouts (which can advance/edit these records) and Payment
// History (which reads the same records, read-only, filtered to Payment Done).
export function buildInitialPayoutRecords() {
  return [
    {
      id: 1,
      student: "Aditya Verma",
      studentId: "JH2026STU041",
      referrer: "Rahul Sharma",
      referrerId: "JH2023REF018",
      course: "B.Tech CSE",
      referrerCourse: "B.Tech CSE",
      enrolledDate: payoutDaysAgo(29),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 29)),
      daysAgo: 29,
      amount: "₹5,000",
      amountValue: 5000,
      status: "Pending Payout",
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "",
    },
    {
      id: 2,
      student: "Rajesh Pillai",
      studentId: "JH2026STU058",
      referrer: "Sneha Patel",
      referrerId: "JH2023REF027",
      course: "B.Com",
      referrerCourse: "B.Com",
      enrolledDate: payoutDaysAgo(22),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 22)),
      daysAgo: 22,
      amount: "₹3,000",
      amountValue: 3000,
      status: "Bank Details Pending",
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "Referrer confirmed they will update bank details by Friday.",
    },
    {
      id: 3,
      student: "Pradeep Nair",
      studentId: "JH2026STU073",
      referrer: "Priya Mehta",
      referrerId: "JH2023REF033",
      course: "MBA Finance",
      referrerCourse: "MBA Marketing",
      enrolledDate: payoutDaysAgo(15),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 15)),
      daysAgo: 15,
      amount: "₹5,000",
      amountValue: 5000,
      status: "Payment Done",
      paymentInfo: { transactionId: "TXN-2026-00417", utrNumber: "UTR2026041700931", pocName: PAYOUT_POC_NAME, pocPhone: PAYOUT_POC_PHONE, date: payoutDaysAgo(6) },
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "",
    },
    {
      id: 4,
      student: "Sarah Khan",
      studentId: "JH2026STU091",
      referrer: "Amit Singh",
      referrerId: "JH2023REF041",
      course: "B.Sc Data Science",
      referrerCourse: "B.Tech AI/ML",
      enrolledDate: payoutDaysAgo(8),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 8)),
      daysAgo: 8,
      amount: "₹4,500",
      amountValue: 4500,
      status: "Pending Payout",
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "",
    },
    {
      id: 5,
      student: "Vikram Singh",
      studentId: "JH2026STU104",
      referrer: "Neha Gupta",
      referrerId: "JH2023REF056",
      course: "B.Tech AI/ML",
      referrerCourse: "B.Tech AI/ML",
      enrolledDate: payoutDaysAgo(35),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 35)),
      daysAgo: 35,
      amount: "₹6,000",
      amountValue: 6000,
      status: "Bank Details Pending",
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "Bank account name mismatch with PAN details — referrer's registered bank name differs from PAN records.",
    },
    {
      id: 6,
      student: "Karan Mehta",
      studentId: "JH2026STU117",
      referrer: "Divya Menon",
      referrerId: "JH2023REF062",
      course: "BCA",
      referrerCourse: "BCA",
      enrolledDate: payoutDaysAgo(12),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 12)),
      daysAgo: 12,
      amount: "₹3,500",
      amountValue: 3500,
      status: "Pending Payout",
      paymentInfo: null,
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "",
    },
    {
      id: 7,
      student: "Ananya Joshi",
      studentId: "JH2026STU124",
      referrer: "Karthik Reddy",
      referrerId: "JH2023REF071",
      course: "B.Tech ECE",
      referrerCourse: "B.Tech ECE",
      enrolledDate: payoutDaysAgo(40),
      enrolledDateObj: new Date(new Date().setDate(new Date().getDate() - 40)),
      daysAgo: 40,
      amount: "₹5,500",
      amountValue: 5500,
      status: "Payment Done",
      paymentInfo: { transactionId: "TXN-2026-00392", utrNumber: "", pocName: PAYOUT_POC_NAME, pocPhone: PAYOUT_POC_PHONE, date: payoutDaysAgo(20) },
      nudge: { message: DEFAULT_NUDGE_MESSAGE, lastSentAt: null },
      comment: "",
    },
  ];
}

// Builds a full refereeReports array from a university's referrer-aggregate
// `reports` array, so counts always reconcile: for every referrer, exactly
// `submitted` referee entries exist, split `converted` Enrolled /
// (submitted - converted - dropped) In Progress / `dropped` Dropped.
function generateRefereeReports(reportsList, courseNames, idPrefix) {
  const result = [];
  let globalIndex = 0;

  // Give each referrer one consistent "home" course, cycling through the
  // university's programme list.
  const referrerCourse = {};
  reportsList.forEach((rep, i) => {
    referrerCourse[rep.student] = courseNames[i % courseNames.length];
  });

  reportsList.forEach((rep) => {
    const dropped = rep.dropped ?? 0;
    const inProgress = rep.submitted - rep.converted - dropped;

    const statuses = [
      ...Array(rep.converted).fill("Enrolled"),
      ...Array(inProgress).fill("In Progress"),
      ...Array(dropped).fill("Dropped"),
    ];

    statuses.forEach((applicationStatus) => {
      globalIndex += 1;
      result.push({
        refereeName: generateRefereeName(globalIndex),
        refereeEnrollNo: `${idPrefix}REF${String(globalIndex).padStart(3, "0")}`,
        refereeCourse: courseNames[globalIndex % courseNames.length],
        referrerName: rep.student,
        referrerCourse: referrerCourse[rep.student],
        applicationStatus,
        admitted: applicationStatus === "Enrolled" ? 1 : 0,
        paid: applicationStatus === "Enrolled" ? 1 : 0,
        inProcess: applicationStatus === "In Progress" ? 1 : 0,
        // Sprinkle in an occasional fraud flag for variety/testing, independent of funnel stage.
        status: globalIndex % 9 === 0 ? "Flagged" : "Clear",
        leadDate: generateLeadDate(globalIndex),
        enrollDate: applicationStatus === "Enrolled" ? generateEnrollDate(globalIndex) : null,
        dropReason: applicationStatus === "Dropped" ? DROP_REASONS[globalIndex % DROP_REASONS.length] : null,
      });
    });
  });

  return result;
}

// ── Per-university referrer aggregates (source of truth for referee counts) ──
const jhReports = [
  { student: "Aditya Verma", enrollmentNo: "JH2024CSD042", submitted: 12, converted: 8, dropped: 2, status: "Flagged", referralsCount: 12, referralsConverted: 8 },
  { student: "Neha Kapoor", enrollmentNo: "JH2024MDA017", submitted: 7, converted: 5, dropped: 1, status: "Clear", referralsCount: 7, referralsConverted: 5 },
  { student: "Simran Kaur", enrollmentNo: "JH2024TCF009", submitted: 9, converted: 4, dropped: 3, status: "Flagged", referralsCount: 9, referralsConverted: 4 },
  { student: "Pradeep Nair", enrollmentNo: "JH2024MAR111", submitted: 5, converted: 4, dropped: 1, status: "Clear", referralsCount: 5, referralsConverted: 4 },
  { student: "Divya Menon", enrollmentNo: "JH2024CSD088", submitted: 6, converted: 3, dropped: 2, status: "Clear", referralsCount: 6, referralsConverted: 3 },
  { student: "Rajesh Pillai", enrollmentNo: "JH2024MCA009", submitted: 3, converted: 2, dropped: 1, status: "Clear", referralsCount: 3, referralsConverted: 2 },
  { student: "Kavya Suresh", enrollmentNo: "JH2024MDA022", submitted: 11, converted: 7, dropped: 2, status: "Flagged", referralsCount: 11, referralsConverted: 7 },
  { student: "Arjun Mathew", enrollmentNo: "JH2024PHY114", submitted: 4, converted: 3, dropped: 1, status: "Clear", referralsCount: 4, referralsConverted: 3 }
];

const ibReports = [
  { student: "Srishti Sen", enrollmentNo: "IB2024BCH011", submitted: 18, converted: 12, dropped: 4, status: "Flagged", referralsCount: 18, referralsConverted: 12 },
  { student: "Kabir Singh", enrollmentNo: "IB2024PHY044", submitted: 14, converted: 9, dropped: 3, status: "Clear", referralsCount: 14, referralsConverted: 9 },
  { student: "Rahul Sharma", enrollmentNo: "IB2024ENG021", submitted: 12, converted: 8, dropped: 2, status: "Clear", referralsCount: 12, referralsConverted: 8 }
];

const imReports = [
  { student: "Meera Nair", enrollmentNo: "IM2024IR002", submitted: 15, converted: 10, dropped: 3, status: "Flagged", referralsCount: 15, referralsConverted: 10 },
  { student: "Akash Roy", enrollmentNo: "IM2024CS089", submitted: 12, converted: 7, dropped: 3, status: "Clear", referralsCount: 12, referralsConverted: 7 },
  { student: "Tanvi Shah", enrollmentNo: "IM2024LG112", submitted: 10, converted: 6, dropped: 2, status: "Clear", referralsCount: 10, referralsConverted: 6 }
];

const jhCourseNames = ["B.Tech CSE", "B.Tech AI/ML", "B.Tech ECE", "MBA Finance", "MBA Marketing", "MCA", "B.Sc Data Science"];
const ibCourseNames = ["B.Tech CSE", "B.Tech Data Science", "B.Tech Electrical", "M.Tech AI & ML", "M.Tech Power Systems"];
const imCourseNames = ["B.Tech CSE", "B.Tech Mechanical", "M.Tech Biotechnology", "PhD Physics"];

export const initialUniversityData = {
  jamia_hamdard: {
    id: "jamia_hamdard",
    name: "Jamia Hamdard",
    role: "ADMIN PORTAL",
    stats: {
      leadsGenerated: 143,
      leadsGrowth: "+12 this month",
      admissionsConverted: 89,
      conversionsGrowth: "+8 this month",
      dropOffs: 20,
      dropOffsGrowth: "+3 this month",
      rewardsPaid: 445000,
      inProgress: 34
    },
    programs: withPolicyDefaults([
      { name: "B.Tech CSE", converted: 24, leads: 36, cost: 150000, referralPercent: 6.67, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 7, referrerData: { converted: 8, flagged: 2, inProcess: 3 }, refereeData: { converted: 24, flagged: 5, inProcess: 7 } },
      { name: "B.Tech AI/ML", converted: 18, leads: 25, cost: 180000, referralPercent: 5.56, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 3, inProcess: 4, referrerData: { converted: 5, flagged: 1, inProcess: 2 }, refereeData: { converted: 18, flagged: 3, inProcess: 4 } },
      { name: "B.Tech ECE", converted: 12, leads: 27, cost: 140000, referralPercent: 5.71, referrerIncentive: 4000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 4, inProcess: 11, referrerData: { converted: 3, flagged: 1, inProcess: 4 }, refereeData: { converted: 12, flagged: 4, inProcess: 11 } },
      { name: "MBA Finance", converted: 15, leads: 22, cost: 200000, referralPercent: 5.00, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 2, inProcess: 5, referrerData: { converted: 4, flagged: 0, inProcess: 2 }, refereeData: { converted: 15, flagged: 2, inProcess: 5 } },
      { name: "MBA Marketing", converted: 11, leads: 18, cost: 190000, referralPercent: 5.26, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 3, inProcess: 4, referrerData: { converted: 3, flagged: 1, inProcess: 1 }, refereeData: { converted: 11, flagged: 3, inProcess: 4 } },
      { name: "MCA", converted: 7, leads: 11, cost: 120000, referralPercent: 8.33, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 1, inProcess: 3, referrerData: { converted: 2, flagged: 0, inProcess: 1 }, refereeData: { converted: 7, flagged: 1, inProcess: 3 } },
      { name: "B.Sc Data Science", converted: 2, leads: 4, cost: 90000, referralPercent: 10.00, referrerIncentive: 4500, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 1, inProcess: 1, referrerData: { converted: 0, flagged: 0, inProcess: 0 }, refereeData: { converted: 2, flagged: 1, inProcess: 1 } }
    ]),
    referrers: [
      { name: "Aditya Verma", count: 12, converted: 8 },
      { name: "Kavya Suresh", count: 11, converted: 7 },
      { name: "Simran Kaur", count: 9, converted: 4 },
      { name: "Neha Kapoor", count: 7, converted: 5 },
      { name: "Pradeep Nair", count: 5, converted: 4 }
    ],
    duplicateLeads: [
      {
        id: "dup1",
        name: "Priya Sharma",
        phone: "+91 98765 43210",
        course: "B.Tech CSE",
        referredBy: "Aditya Verma",
        submittedDate: "14 Jun 2026",
        enrollmentNo: "JH2024CSD042",
        status: "Pending",
        crmName: "Priya Sharma",
        crmPhone: "+91 98765 43210",
        crmCourse: "B.Tech CSE",
        crmStatus: "Lead — Contacted",
        crmFirstSeen: "12 Mar 2026",
        crmMatchIcon: "user",
        crmMatchText: "CRM Match — Existing Lead"
      },
      {
        id: "dup2",
        name: "Rohan Gupta",
        phone: "+91 87654 32109",
        course: "B.Tech AI/ML",
        referredBy: "Kavya Suresh",
        submittedDate: "15 Jun 2026",
        enrollmentNo: "JH2024MDA022",
        status: "Cleared",
        crmName: "Rohan Gupta",
        crmPhone: "+91 87654 32109",
        crmCourse: "B.Tech AI/ML",
        crmStatus: "Applicant — Fee Pending",
        crmFirstSeen: "28 May 2026",
        crmMatchIcon: "file",
        crmMatchText: "CRM Match — Applicant"
      },
      {
        id: "dup3",
        name: "Anita Patel",
        phone: "+91 76543 21098",
        course: "B.Tech ECE",
        referredBy: "Simran Kaur",
        submittedDate: "16 Jun 2026",
        enrollmentNo: "JH2024TCF009",
        status: "Rejected",
        crmName: "Anita Patel",
        crmPhone: "+91 76543 21098",
        crmCourse: "B.Tech ECE",
        crmStatus: "Enrolled",
        crmFirstSeen: "10 Jan 2026",
        crmMatchIcon: "check",
        crmMatchText: "CRM Match — Enrolled Student"
      }
    ],
    reports: jhReports,
    refereeReports: generateRefereeReports(jhReports, jhCourseNames, "JH2024"),
    notifications: {
      fraudFlags: 2,
      duplicateLeads: 3
    }
  },
  iit_bhilai: {
    id: "iit_bhilai",
    name: "IIT Bhilai",
    role: "ADMIN PORTAL",
    stats: {
      leadsGenerated: 250,
      leadsGrowth: "+30 this month",
      admissionsConverted: 160,
      conversionsGrowth: "+18 this month",
      dropOffs: 35,
      dropOffsGrowth: "+5 this month",
      rewardsPaid: 850000,
      inProgress: 55
    },
    programs: withPolicyDefaults([
      { name: "B.Tech CSE", converted: 45, leads: 60, cost: 220000, referralPercent: 8.33, referrerIncentive: 9000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 8, inProcess: 7, referrerData: { converted: 12, flagged: 3, inProcess: 2 }, refereeData: { converted: 45, flagged: 8, inProcess: 7 } },
      { name: "B.Tech Data Science", converted: 30, leads: 48, cost: 210000, referralPercent: 10.00, referrerIncentive: 10000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 6, inProcess: 12, referrerData: { converted: 8, flagged: 2, inProcess: 4 }, refereeData: { converted: 30, flagged: 6, inProcess: 12 } },
      { name: "B.Tech Electrical", converted: 25, leads: 40, cost: 190000, referralPercent: 10.53, referrerIncentive: 8000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 10, referrerData: { converted: 7, flagged: 2, inProcess: 3 }, refereeData: { converted: 25, flagged: 5, inProcess: 10 } },
      { name: "M.Tech AI & ML", converted: 35, leads: 52, cost: 160000, referralPercent: 8.75, referrerIncentive: 7000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 7, inProcess: 10, referrerData: { converted: 10, flagged: 3, inProcess: 4 }, refereeData: { converted: 35, flagged: 7, inProcess: 10 } },
      { name: "M.Tech Power Systems", converted: 25, leads: 50, cost: 150000, referralPercent: 10.00, referrerIncentive: 6500, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 8, inProcess: 17, referrerData: { converted: 6, flagged: 2, inProcess: 5 }, refereeData: { converted: 25, flagged: 8, inProcess: 17 } }
    ]),
    referrers: [
      { name: "Srishti Sen", count: 18, converted: 12 },
      { name: "Kabir Singh", count: 14, converted: 9 },
      { name: "Rahul Sharma", count: 12, converted: 8 }
    ],
    duplicateLeads: [
      {
        id: "dup_du1",
        name: "Aarav Mehta",
        phone: "+91 91234 56789",
        course: "B.Tech CSE",
        referredBy: "Srishti Sen",
        submittedDate: "18 Jun 2026",
        enrollmentNo: "IB2024BCH011",
        status: "Pending",
        crmName: "Aarav Mehta",
        crmPhone: "+91 91234 56789",
        crmCourse: "B.Tech CSE",
        crmStatus: "Lead — Contacted",
        crmFirstSeen: "01 Apr 2026",
        crmMatchIcon: "user",
        crmMatchText: "CRM Match — Existing Lead"
      },
      {
        id: "dup_du2",
        name: "Kiara Advani",
        phone: "+91 92345 67890",
        course: "B.Tech Data Science",
        referredBy: "Kabir Singh",
        submittedDate: "20 Jun 2026",
        enrollmentNo: "IB2024PHY044",
        status: "Cleared",
        crmName: "Kiara Advani",
        crmPhone: "+91 92345 67890",
        crmCourse: "B.Tech Data Science",
        crmStatus: "Applicant — Registered",
        crmFirstSeen: "05 May 2026",
        crmMatchIcon: "file",
        crmMatchText: "CRM Match — Applicant"
      }
    ],
    reports: ibReports,
    refereeReports: generateRefereeReports(ibReports, ibCourseNames, "IB2024"),
    notifications: {
      fraudFlags: 3,
      duplicateLeads: 2
    }
  },
  iit_mandi: {
    id: "iit_mandi",
    name: "IIT Mandi",
    role: "ADMIN PORTAL",
    stats: {
      leadsGenerated: 180,
      leadsGrowth: "+20 this month",
      admissionsConverted: 110,
      conversionsGrowth: "+12 this month",
      dropOffs: 25,
      dropOffsGrowth: "+2 this month",
      rewardsPaid: 550000,
      inProgress: 45
    },
    programs: withPolicyDefaults([
      { name: "B.Tech CSE", converted: 40, leads: 55, cost: 230000, referralPercent: 8.70, referrerIncentive: 10000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 6, inProcess: 9, referrerData: { converted: 10, flagged: 2, inProcess: 3 }, refereeData: { converted: 40, flagged: 6, inProcess: 9 } },
      { name: "B.Tech Mechanical", converted: 35, leads: 50, cost: 200000, referralPercent: 8.00, referrerIncentive: 8000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 10, referrerData: { converted: 9, flagged: 2, inProcess: 3 }, refereeData: { converted: 35, flagged: 5, inProcess: 10 } },
      { name: "M.Tech Biotechnology", converted: 20, leads: 40, cost: 140000, referralPercent: 10.00, referrerIncentive: 7000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 4, inProcess: 16, referrerData: { converted: 5, flagged: 1, inProcess: 4 }, refereeData: { converted: 20, flagged: 4, inProcess: 16 } },
      { name: "PhD Physics", converted: 15, leads: 35, cost: 120000, referralPercent: 8.33, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 3, inProcess: 17, referrerData: { converted: 4, flagged: 1, inProcess: 5 }, refereeData: { converted: 15, flagged: 3, inProcess: 17 } }
    ]),
    referrers: [
      { name: "Meera Nair", count: 15, converted: 10 },
      { name: "Akash Roy", count: 12, converted: 7 },
      { name: "Tanvi Shah", count: 10, converted: 6 }
    ],
    duplicateLeads: [
      {
        id: "dup_jn1",
        name: "Devansh Joshi",
        phone: "+91 93456 78901",
        course: "B.Tech CSE",
        referredBy: "Meera Nair",
        submittedDate: "22 Jun 2026",
        enrollmentNo: "IM2024IR002",
        status: "Pending",
        crmName: "Devansh Joshi",
        crmPhone: "+91 93456 78901",
        crmCourse: "B.Tech CSE",
        crmStatus: "Lead — Contacted",
        crmFirstSeen: "10 Apr 2026",
        crmMatchIcon: "user",
        crmMatchText: "CRM Match — Existing Lead"
      },
      {
        id: "dup_jn2",
        name: "Isha Ambani",
        phone: "+91 94567 89012",
        course: "M.Tech Biotechnology",
        referredBy: "Akash Roy",
        submittedDate: "24 Jun 2026",
        enrollmentNo: "IM2024CS089",
        status: "Rejected",
        crmName: "Isha Ambani",
        crmPhone: "+91 94567 89012",
        crmCourse: "M.Tech Biotechnology",
        crmStatus: "Enrolled",
        crmFirstSeen: "01 Jan 2026",
        crmMatchIcon: "check",
        crmMatchText: "CRM Match — Enrolled Student"
      }
    ],
    reports: imReports,
    refereeReports: generateRefereeReports(imReports, imCourseNames, "IM2024"),
    notifications: {
      fraudFlags: 1,
      duplicateLeads: 1
    }
  }
};
