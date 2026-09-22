// Derives the 3-way display status (Pending Payout / Bank Details Pending / Payment Done)
// from stored data. `status` on a payout record is only ever literally 'Pending Payout' or
// 'Payment Done' — "Bank Details Pending" is inferred from the absence of `bankDetails`, so
// it flips automatically the moment bank details appear on a record, no manual override needed.
export function getPayoutStatus(item) {
  if (item.status === 'Payment Done') return 'Payment Done';
  return item.bankDetails ? 'Pending Payout' : 'Bank Details Pending';
}
