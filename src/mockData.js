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
    programs: [
      { name: "B.Tech CSE", converted: 24, leads: 36, cost: 150000, referralPercent: 6.67, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 7, referrerData: { converted: 8, flagged: 2, inProcess: 3 }, refereeData: { converted: 24, flagged: 5, inProcess: 7 } },
      { name: "B.Tech AI/ML", converted: 18, leads: 25, cost: 180000, referralPercent: 5.56, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 3, inProcess: 4, referrerData: { converted: 5, flagged: 1, inProcess: 2 }, refereeData: { converted: 18, flagged: 3, inProcess: 4 } },
      { name: "B.Tech ECE", converted: 12, leads: 27, cost: 140000, referralPercent: 5.71, referrerIncentive: 4000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 4, inProcess: 11, referrerData: { converted: 3, flagged: 1, inProcess: 4 }, refereeData: { converted: 12, flagged: 4, inProcess: 11 } },
      { name: "MBA Finance", converted: 15, leads: 22, cost: 200000, referralPercent: 5.00, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 2, inProcess: 5, referrerData: { converted: 4, flagged: 0, inProcess: 2 }, refereeData: { converted: 15, flagged: 2, inProcess: 5 } },
      { name: "MBA Marketing", converted: 11, leads: 18, cost: 190000, referralPercent: 5.26, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 3, inProcess: 4, referrerData: { converted: 3, flagged: 1, inProcess: 1 }, refereeData: { converted: 11, flagged: 3, inProcess: 4 } },
      { name: "MCA", converted: 7, leads: 11, cost: 120000, referralPercent: 8.33, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 1, inProcess: 3, referrerData: { converted: 2, flagged: 0, inProcess: 1 }, refereeData: { converted: 7, flagged: 1, inProcess: 3 } },
      { name: "B.Sc Data Science", converted: 2, leads: 4, cost: 90000, referralPercent: 10.00, referrerIncentive: 4500, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 1, inProcess: 1, referrerData: { converted: 0, flagged: 0, inProcess: 0 }, refereeData: { converted: 2, flagged: 1, inProcess: 1 } }
    ],
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
    reports: [
      { student: "Aditya Verma", enrollmentNo: "JH2024CSD042", submitted: 12, converted: 8, status: "Flagged", referralsCount: 12, referralsConverted: 8, admitted: 4, paid: 2, inProcess: 2 },
      { student: "Neha Kapoor", enrollmentNo: "JH2024MDA017", submitted: 7, converted: 5, status: "Clear", referralsCount: 7, referralsConverted: 5, admitted: 3, paid: 1, inProcess: 1 },
      { student: "Simran Kaur", enrollmentNo: "JH2024TCF009", submitted: 9, converted: 4, status: "Flagged", referralsCount: 9, referralsConverted: 4, admitted: 1, paid: 2, inProcess: 1 },
      { student: "Pradeep Nair", enrollmentNo: "JH2024MAR111", submitted: 5, converted: 4, status: "Clear", referralsCount: 5, referralsConverted: 4, admitted: 2, paid: 2, inProcess: 0 },
      { student: "Divya Menon", enrollmentNo: "JH2024CSD088", submitted: 6, converted: 3, status: "Clear", referralsCount: 6, referralsConverted: 3, admitted: 1, paid: 1, inProcess: 1 },
      { student: "Rajesh Pillai", enrollmentNo: "JH2024MCA009", submitted: 3, converted: 2, status: "Clear", referralsCount: 3, referralsConverted: 2, admitted: 1, paid: 1, inProcess: 0 },
      { student: "Kavya Suresh", enrollmentNo: "JH2024MDA022", submitted: 11, converted: 7, status: "Flagged", referralsCount: 11, referralsConverted: 7, admitted: 3, paid: 2, inProcess: 2 },
      { student: "Arjun Mathew", enrollmentNo: "JH2024PHY114", submitted: 4, converted: 3, status: "Clear", referralsCount: 4, referralsConverted: 3, admitted: 2, paid: 1, inProcess: 0 }
    ],
    refereeReports: [
      { refereeName: "Priya Sharma",   refereeEnrollNo: "JH2024REF001", refereeCourse: "B.Tech CSE",      referrerName: "Aditya Verma",  referrerCourse: "B.Tech CSE",      applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Rohan Gupta",    refereeEnrollNo: "JH2024REF002", refereeCourse: "B.Tech AI/ML",    referrerName: "Kavya Suresh",  referrerCourse: "B.Tech AI/ML",    applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Anita Patel",    refereeEnrollNo: "JH2024REF003", refereeCourse: "B.Tech ECE",      referrerName: "Simran Kaur",   referrerCourse: "B.Tech CSE",      applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Karan Mehta",    refereeEnrollNo: "JH2024REF004", refereeCourse: "MBA Finance",     referrerName: "Neha Kapoor",   referrerCourse: "MBA Marketing",   applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Sneha Joshi",    refereeEnrollNo: "JH2024REF005", refereeCourse: "MBA Marketing",   referrerName: "Pradeep Nair",  referrerCourse: "MBA Finance",     applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Vikram Rao",     refereeEnrollNo: "JH2024REF006", refereeCourse: "B.Tech CSE",      referrerName: "Aditya Verma",  referrerCourse: "B.Tech CSE",      applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Flagged" },
      { refereeName: "Meena Das",      refereeEnrollNo: "JH2024REF007", refereeCourse: "MCA",             referrerName: "Rajesh Pillai", referrerCourse: "MCA",             applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Amit Singh",     refereeEnrollNo: "JH2024REF008", refereeCourse: "B.Tech AI/ML",    referrerName: "Kavya Suresh",  referrerCourse: "B.Tech AI/ML",    applicationStatus: "Flagged",     admitted: 0, paid: 0, inProcess: 0, status: "Flagged" },
      { refereeName: "Pooja Nair",     refereeEnrollNo: "JH2024REF009", refereeCourse: "MBA Finance",     referrerName: "Divya Menon",   referrerCourse: "B.Tech CSE",      applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Suresh Babu",    refereeEnrollNo: "JH2024REF010", refereeCourse: "B.Tech ECE",      referrerName: "Simran Kaur",   referrerCourse: "B.Tech CSE",      applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Ritu Sharma",    refereeEnrollNo: "JH2024REF011", refereeCourse: "B.Sc Data Science",referrerName: "Arjun Mathew",  referrerCourse: "B.Tech ECE",      applicationStatus: "Enrolled",    admitted: 1, paid: 0, inProcess: 0, status: "Clear"   },
      { refereeName: "Deepak Kumar",   refereeEnrollNo: "JH2024REF012", refereeCourse: "MBA Marketing",   referrerName: "Neha Kapoor",   referrerCourse: "MBA Marketing",   applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   }
    ],
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
    programs: [
      { name: "B.Tech CSE", converted: 45, leads: 60, cost: 220000, referralPercent: 8.33, referrerIncentive: 9000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 8, inProcess: 7, referrerData: { converted: 12, flagged: 3, inProcess: 2 }, refereeData: { converted: 45, flagged: 8, inProcess: 7 } },
      { name: "B.Tech Data Science", converted: 30, leads: 48, cost: 210000, referralPercent: 10.00, referrerIncentive: 10000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 6, inProcess: 12, referrerData: { converted: 8, flagged: 2, inProcess: 4 }, refereeData: { converted: 30, flagged: 6, inProcess: 12 } },
      { name: "B.Tech Electrical", converted: 25, leads: 40, cost: 190000, referralPercent: 10.53, referrerIncentive: 8000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 10, referrerData: { converted: 7, flagged: 2, inProcess: 3 }, refereeData: { converted: 25, flagged: 5, inProcess: 10 } },
      { name: "M.Tech AI & ML", converted: 35, leads: 52, cost: 160000, referralPercent: 8.75, referrerIncentive: 7000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 7, inProcess: 10, referrerData: { converted: 10, flagged: 3, inProcess: 4 }, refereeData: { converted: 35, flagged: 7, inProcess: 10 } },
      { name: "M.Tech Power Systems", converted: 25, leads: 50, cost: 150000, referralPercent: 10.00, referrerIncentive: 6500, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 8, inProcess: 17, referrerData: { converted: 6, flagged: 2, inProcess: 5 }, refereeData: { converted: 25, flagged: 8, inProcess: 17 } }
    ],
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
    reports: [
      { student: "Srishti Sen", enrollmentNo: "IB2024BCH011", submitted: 18, converted: 12, status: "Flagged", referralsCount: 18, referralsConverted: 12, admitted: 6, paid: 4, inProcess: 2 },
      { student: "Kabir Singh", enrollmentNo: "IB2024PHY044", submitted: 14, converted: 9, status: "Clear", referralsCount: 14, referralsConverted: 9, admitted: 4, paid: 3, inProcess: 2 },
      { student: "Rahul Sharma", enrollmentNo: "IB2024ENG021", submitted: 12, converted: 8, status: "Clear", referralsCount: 12, referralsConverted: 8, admitted: 3, paid: 3, inProcess: 2 }
    ],
    refereeReports: [
      { refereeName: "Aarav Mehta",    refereeEnrollNo: "IB2024REF001", refereeCourse: "B.Tech CSE",          referrerName: "Srishti Sen",   referrerCourse: "B.Tech CSE",          applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Kiara Advani",   refereeEnrollNo: "IB2024REF002", refereeCourse: "B.Tech Data Science", referrerName: "Kabir Singh",   referrerCourse: "B.Tech Data Science", applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Rohan Tiwari",   refereeEnrollNo: "IB2024REF003", refereeCourse: "B.Tech Electrical",   referrerName: "Rahul Sharma",  referrerCourse: "B.Tech Electrical",   applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Priya Iyer",     refereeEnrollNo: "IB2024REF004", refereeCourse: "M.Tech AI & ML",      referrerName: "Srishti Sen",   referrerCourse: "B.Tech CSE",          applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Aryan Kapoor",   refereeEnrollNo: "IB2024REF005", refereeCourse: "M.Tech Power Systems", referrerName: "Kabir Singh",  referrerCourse: "B.Tech Data Science", applicationStatus: "Flagged",     admitted: 0, paid: 0, inProcess: 0, status: "Flagged" },
      { refereeName: "Neha Bose",      refereeEnrollNo: "IB2024REF006", refereeCourse: "B.Tech CSE",          referrerName: "Rahul Sharma",  referrerCourse: "B.Tech Electrical",   applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Vishal Gupta",   refereeEnrollNo: "IB2024REF007", refereeCourse: "B.Tech Data Science", referrerName: "Srishti Sen",   referrerCourse: "B.Tech CSE",          applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Tanisha Roy",    refereeEnrollNo: "IB2024REF008", refereeCourse: "M.Tech AI & ML",      referrerName: "Kabir Singh",   referrerCourse: "B.Tech Data Science", applicationStatus: "Enrolled",    admitted: 1, paid: 0, inProcess: 0, status: "Clear"   }
    ],
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
    programs: [
      { name: "B.Tech CSE", converted: 40, leads: 55, cost: 230000, referralPercent: 8.70, referrerIncentive: 10000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 6, inProcess: 9, referrerData: { converted: 10, flagged: 2, inProcess: 3 }, refereeData: { converted: 40, flagged: 6, inProcess: 9 } },
      { name: "B.Tech Mechanical", converted: 35, leads: 50, cost: 200000, referralPercent: 8.00, referrerIncentive: 8000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "UG", flagged: 5, inProcess: 10, referrerData: { converted: 9, flagged: 2, inProcess: 3 }, refereeData: { converted: 35, flagged: 5, inProcess: 10 } },
      { name: "M.Tech Biotechnology", converted: 20, leads: 40, cost: 140000, referralPercent: 10.00, referrerIncentive: 7000, refereeDiscount: 8, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 4, inProcess: 16, referrerData: { converted: 5, flagged: 1, inProcess: 4 }, refereeData: { converted: 20, flagged: 4, inProcess: 16 } },
      { name: "PhD Physics", converted: 15, leads: 35, cost: 120000, referralPercent: 8.33, referrerIncentive: 5000, refereeDiscount: 10, effectiveFrom: "01 Jun 2026", type: "PG", flagged: 3, inProcess: 17, referrerData: { converted: 4, flagged: 1, inProcess: 5 }, refereeData: { converted: 15, flagged: 3, inProcess: 17 } }
    ],
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
    reports: [
      { student: "Meera Nair", enrollmentNo: "IM2024IR002", submitted: 15, converted: 10, status: "Flagged", referralsCount: 15, referralsConverted: 10, admitted: 5, paid: 3, inProcess: 2 },
      { student: "Akash Roy", enrollmentNo: "IM2024CS089", submitted: 12, converted: 7, status: "Clear", referralsCount: 12, referralsConverted: 7, admitted: 3, paid: 2, inProcess: 2 },
      { student: "Tanvi Shah", enrollmentNo: "IM2024LG112", submitted: 10, converted: 6, status: "Clear", referralsCount: 10, referralsConverted: 6, admitted: 3, paid: 2, inProcess: 1 }
    ],
    refereeReports: [
      { refereeName: "Devansh Joshi",  refereeEnrollNo: "IM2024REF001", refereeCourse: "B.Tech CSE",         referrerName: "Meera Nair",  referrerCourse: "B.Tech CSE",         applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Isha Ambani",    refereeEnrollNo: "IM2024REF002", refereeCourse: "M.Tech Biotechnology",referrerName: "Akash Roy",   referrerCourse: "B.Tech Mechanical",  applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Rahul Verma",    refereeEnrollNo: "IM2024REF003", refereeCourse: "B.Tech Mechanical",  referrerName: "Tanvi Shah",  referrerCourse: "B.Tech CSE",         applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Priya Singh",    refereeEnrollNo: "IM2024REF004", refereeCourse: "PhD Physics",        referrerName: "Meera Nair",  referrerCourse: "B.Tech CSE",         applicationStatus: "Flagged",     admitted: 0, paid: 0, inProcess: 0, status: "Flagged" },
      { refereeName: "Arjun Das",      refereeEnrollNo: "IM2024REF005", refereeCourse: "B.Tech CSE",         referrerName: "Akash Roy",   referrerCourse: "B.Tech Mechanical",  applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   },
      { refereeName: "Nisha Kapoor",   refereeEnrollNo: "IM2024REF006", refereeCourse: "M.Tech Biotechnology",referrerName: "Tanvi Shah",  referrerCourse: "B.Tech CSE",         applicationStatus: "In Progress", admitted: 0, paid: 0, inProcess: 1, status: "Clear"   },
      { refereeName: "Vivek Tiwari",   refereeEnrollNo: "IM2024REF007", refereeCourse: "B.Tech Mechanical",  referrerName: "Meera Nair",  referrerCourse: "B.Tech CSE",         applicationStatus: "Enrolled",    admitted: 1, paid: 1, inProcess: 0, status: "Clear"   }
    ],
    notifications: {
      fraudFlags: 1,
      duplicateLeads: 1
    }
  }
};
