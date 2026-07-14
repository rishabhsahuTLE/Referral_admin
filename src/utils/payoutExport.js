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
      { key: 'date.payment', label: 'Payment' },
    ],
  },
  {
    key: 'poc',
    label: 'Point of Contact',
    children: [
      { key: 'poc.counsellor', label: 'Counsellor' },
      { key: 'poc.payment', label: 'Payment' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    children: null,
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

// Small rotating pool of staff so each record gets a plausible-but-deterministic counsellor
// (assigned at initial lead intake — separate from the payment POC captured when a payout
// is actually marked done).
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

// Builds a flat { columnKey: displayValue } row for one payout record, sourcing the payment
// date/POC from the record's real paymentInfo (captured when it's marked Payment Done).
export function buildExportRow(item) {
  const p = item.paymentInfo;

  return {
    'student.name': item.student,
    'student.course': item.course,
    'student.id': item.studentId,
    'referrer.name': item.referrer,
    'referrer.course': item.referrerCourse,
    'referrer.id': item.referrerId,
    'date.enrolledOn': item.enrolledDate,
    'date.payment': p ? p.date : '-',
    'poc.counsellor': getCounsellorPOC(item.id),
    'poc.payment': p ? `${p.pocName} (${p.pocPhone})` : '-',
    status: item.status,
    amount: item.amount,
  };
}
