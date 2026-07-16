// Shared row-shaping for anything that shows "paid payout" records in the
// Referrer Details / Referee Details grouped-table shape — used by both the
// Payment History tab and the Comprehensive Report's "Admissions Converted" popup,
// so the two never drift apart.
export function buildPaidPayoutRows(payoutRecords, programs) {
  const discountByCourse = {};
  programs.forEach((p) => {
    discountByCourse[p.name] = p.refereeDiscount;
  });

  return payoutRecords
    .filter((item) => item.status === 'Payment Done' && item.paymentInfo)
    .map((item) => ({
      id: item.id,
      referrerName: item.referrer,
      referrerCourse: item.referrerCourse,
      referrerEnrollNo: item.referrerId,
      paymentAmount: item.amount,
      datePaid: item.paymentInfo.date,
      refereeName: item.student,
      refereeCourse: item.course,
      refereeEnrollNo: item.studentId,
      discountPct: discountByCourse[item.course] ?? 0,
      enrolledDate: item.enrolledDate,
    }));
}
