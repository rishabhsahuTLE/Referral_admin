// Column tree + row-building helpers for the Referral Payouts "Custom Data" export.
// Shared between ReferralPayouts.jsx (which owns the raw records) and PayoutExportModal.jsx
// (which lets the admin pick which columns to preview/download).

export const PAYOUT_COLUMN_GROUPS = [
  {
    // Sourced from item.student/item.course/item.studentId — the enrolled/referred
    // person, called "Referee" in the main table.
    key: 'student',
    label: 'Referee Details',
    children: [
      { key: 'student.name', label: 'Name' },
      { key: 'student.course', label: 'Course' },
      { key: 'student.id', label: 'ID' },
    ],
  },
  {
    // Sourced from item.referrer/item.referrerCourse/item.referrerId — the person
    // who gets paid, called "Student" in the main table. Label unchanged.
    key: 'referrer',
    label: 'Referrer Details',
    children: [
      { key: 'referrer.name', label: 'Name' },
      { key: 'referrer.course', label: 'Course' },
      { key: 'referrer.id', label: 'ID' },
    ],
  },
  {
    key: 'date',
    label: 'Date',
    children: [
      { key: 'date.enrolledOn', label: 'Enrolled On' },
      { key: 'date.docVerification', label: 'Doc Verification' },
      { key: 'date.bankVerification', label: 'Bank Verification' },
      { key: 'date.payment', label: 'Payment' },
    ],
  },
  {
    key: 'poc',
    label: 'Point of Contact',
    children: [
      { key: 'poc.counsellor', label: 'Counsellor' },
      { key: 'poc.docVerification', label: 'Doc Verification' },
      { key: 'poc.bankVerification', label: 'Bank Verification' },
      { key: 'poc.payment', label: 'Payment' },
    ],
  },
  {
    key: 'amount',
    label: 'Amount',
    children: null,
  },
];

export function getGroupLeafKeys(group) {
  return group.children ? group.children.map((c) => c.key) : [group.key];
}

export function getAllLeafKeys() {
  return PAYOUT_COLUMN_GROUPS.flatMap(getGroupLeafKeys);
}

// Small rotating pool of staff so each record gets a plausible-but-deterministic counsellor.
// (Only the counsellor — doc/bank/payment POCs now come from real stageHistory data, since
// those are captured for real when an admin advances a record through the stage popup.)
const COUNSELLOR_POOL = [
  { name: 'Ravi Sharma', phone: '+91 98111 22334' },
  { name: 'Meena Pillai', phone: '+91 98222 33445' },
  { name: 'Suresh Nair', phone: '+91 98333 44556' },
  { name: 'Anita Rao', phone: '+91 98444 55667' },
];

function getCounsellorPOC(id) {
  const poc = COUNSELLOR_POOL[id % COUNSELLOR_POOL.length];
  return `${poc.name} (${poc.phone})`;
}

const dateOf = (entry) => (entry ? entry.date : '-');
const pocOf = (entry) => (entry ? `${entry.pocName} (${entry.pocPhone})` : '-');

// Builds a flat { columnKey: displayValue } row for one payout record, sourcing doc/bank/payment
// dates and POC info from the record's real stageHistory (captured via the stage-advance popup).
export function buildExportRow(item) {
  const h = item.stageHistory || {};

  return {
    'student.name': item.student,
    'student.course': item.course,
    'student.id': item.studentId,
    'referrer.name': item.referrer,
    'referrer.course': item.referrerCourse,
    'referrer.id': item.referrerId,
    'date.enrolledOn': item.enrolledDate,
    'date.docVerification': dateOf(h.docVerification),
    'date.bankVerification': dateOf(h.bankVerification),
    'date.payment': dateOf(h.payment),
    'poc.counsellor': getCounsellorPOC(item.id),
    'poc.docVerification': pocOf(h.docVerification),
    'poc.bankVerification': pocOf(h.bankVerification),
    'poc.payment': pocOf(h.payment),
    amount: item.amount,
  };
}
