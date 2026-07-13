// Column tree + row-building helpers for the Referral Payouts "Custom Data" export.
// Shared between ReferralPayouts.jsx (which owns the raw records) and PayoutExportModal.jsx
// (which lets the admin pick which columns to preview/download).

export const PAYOUT_COLUMN_GROUPS = [
  {
    key: 'student',
    label: 'Student Details',
    children: [
      { key: 'student.name', label: 'Name' },
      { key: 'student.course', label: 'Course' },
      { key: 'student.id', label: 'ID' },
    ],
  },
  {
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

// Stage a record is blocked on — everything strictly before this stage is already complete.
const STAGE_ORDER = ['Doc Verification', 'Bank Verification', 'Payment Pending'];

// Small rotating pool of staff so each record gets a plausible-but-deterministic point of contact.
const POC_POOL = [
  { name: 'Ravi Sharma', phone: '+91 98111 22334' },
  { name: 'Meena Pillai', phone: '+91 98222 33445' },
  { name: 'Suresh Nair', phone: '+91 98333 44556' },
  { name: 'Anita Rao', phone: '+91 98444 55667' },
];

function getPOC(id, offset) {
  const poc = POC_POOL[(id + offset) % POC_POOL.length];
  return `${poc.name} (${poc.phone})`;
}

// Builds a flat { columnKey: displayValue } row for one payout record, given a way to
// format "N days ago" into a date string (the caller already has calculateDaysAgo).
export function buildExportRow(item, calculateDaysAgo) {
  const stageIdx = STAGE_ORDER.indexOf(item.stage);
  const reached = (idx) => stageIdx > idx;

  return {
    'student.name': item.student,
    'student.course': item.course,
    'student.id': item.studentId,
    'referrer.name': item.referrer,
    'referrer.course': item.referrerCourse,
    'referrer.id': item.referrerId,
    'date.enrolledOn': item.enrolledDate,
    'date.docVerification': reached(0) ? calculateDaysAgo(Math.max(item.daysAgo - 4, 0)) : '-',
    'date.bankVerification': reached(1) ? calculateDaysAgo(Math.max(item.daysAgo - 9, 0)) : '-',
    'date.payment': reached(2) ? calculateDaysAgo(Math.max(item.daysAgo - 14, 0)) : '-',
    'poc.counsellor': getPOC(item.id, 0),
    'poc.docVerification': reached(0) ? getPOC(item.id, 1) : '-',
    'poc.bankVerification': reached(1) ? getPOC(item.id, 2) : '-',
    'poc.payment': reached(2) ? getPOC(item.id, 3) : '-',
    amount: item.amount,
  };
}
