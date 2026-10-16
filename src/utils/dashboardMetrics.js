// Dashboard metrics computed from the per-individual records (refereeReports and payout
// records) so they can be filtered by university and date range. Cost of Referral is based
// on amounts actually paid:
//   • Referrer payouts — payout records marked "Payment Done" (dated by payment date)
//   • Referee discounts — the first-payment discount each enrolled referee actually got,
//     for the payment type they chose, under the configuration live on their enrollment
//   • Fees collected — what those referees actually paid on that first payment
// Cost % = (payouts + discounts) ÷ fees collected.

import { getConfigs, getActiveConfig, coversToday } from "./rewardConfigs";
import { computeFirstPayments, paymentTypeLabel } from "./feeStructure";

const MONTH_PREFIXES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

// Parses the app's two record date formats: "15 Oct 2026" (also "15 Sept 2026") and
// "15/10/2026". Returns a local Date at midnight, or null.
export function parseRecordDate(str) {
  if (!str || typeof str !== "string") return null;
  const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return new Date(Number(slash[3]), Number(slash[2]) - 1, Number(slash[1]));
  const words = str.trim().split(/[\s,]+/);
  if (words.length < 3) return null;
  const month = MONTH_PREFIXES.indexOf(words[1].slice(0, 3).toLowerCase());
  if (month === -1) return null;
  return new Date(Number(words[2]), month, Number(words[0]));
}

// Whether `date` falls in { startDate, endDate } (inclusive, whole days). A missing range
// means "all time"; a missing date is excluded only when a range is set.
export function inDateRange(date, range) {
  if (!range || !range.startDate || !range.endDate) return true;
  if (!date) return false;
  const end = new Date(range.endDate);
  end.setHours(23, 59, 59, 999);
  return date >= range.startDate && date <= end;
}

// The configuration that was live for a course on a given date (falls back to the
// course's current one).
function configOn(prog, date) {
  const configs = getConfigs(prog);
  return (date && configs.find((c) => coversToday(c, date))) || getActiveConfig(configs);
}

// First-payment figures for one enrolled referee, under the payment type they chose.
// Returns null when the referee hasn't paid yet or the course isn't configured.
export function getRefereePayment(rep, programs) {
  if (rep.applicationStatus !== "Enrolled" || !rep.paid || !rep.paymentType) return null;
  const prog = programs.find((p) => p.name === rep.refereeCourse);
  if (!prog) return null;
  const config = configOn(prog, parseRecordDate(rep.enrollDate));
  const fp = computeFirstPayments(prog, config)[rep.paymentType];
  return {
    paymentType: rep.paymentType,
    paymentTypeLabel: paymentTypeLabel(rep.paymentType),
    discountPct: config.refereeDiscount,
    feeHead: config.feeHead,
    discount: fp.discount,
    payable: fp.payable,
    gross: fp.gross,
  };
}

// Everything the Dashboard shows, for a list of universities ({ uni, payouts }) and a
// date range. Course rows are keyed by university + course so "All universities" keeps
// same-named courses (e.g. B.Tech CSE) apart.
export function computeDashboardMetrics(entries, range) {
  const courses = [];
  let leads = 0, converted = 0, dropOffs = 0;
  let payoutsPaid = 0, discountsGiven = 0, feesCollected = 0;

  entries.forEach(({ uni, payouts }) => {
    const refereeReports = uni.refereeReports || [];
    uni.programs.forEach((prog) => {
      const rows = refereeReports.filter((r) => r.refereeCourse === prog.name);
      const courseLeads = rows.filter((r) => inDateRange(parseRecordDate(r.leadDate), range));
      // Funnel counts follow the lead cohort (leads generated in the period, and how many
      // of those converted / dropped) so the conversion rate stays ≤ 100%.
      const courseEnrolled = courseLeads.filter((r) => r.applicationStatus === "Enrolled");
      const courseDropped = courseLeads.filter((r) => r.applicationStatus === "Dropped");

      // Money follows when it was paid: referees who enrolled (paid) in the period.
      const paidInPeriod = rows.filter(
        (r) => r.applicationStatus === "Enrolled" && inDateRange(parseRecordDate(r.enrollDate ?? r.leadDate), range)
      );
      let discounts = 0, fees = 0;
      paidInPeriod.forEach((r) => {
        const pay = getRefereePayment(r, uni.programs);
        if (pay) { discounts += pay.discount; fees += pay.payable; }
      });

      const paidPayouts = (payouts || []).filter(
        (p) => p.course === prog.name && p.status === "Payment Done" && inDateRange(parseRecordDate(p.paymentInfo?.date), range)
      );
      const payoutTotal = paidPayouts.reduce((a, p) => a + (p.amountValue || 0), 0);

      leads += courseLeads.length;
      converted += courseEnrolled.length;
      dropOffs += courseDropped.length;
      payoutsPaid += payoutTotal;
      discountsGiven += discounts;
      feesCollected += fees;

      courses.push({
        key: `${uni.id}::${prog.name}`,
        uniId: uni.id,
        uniName: uni.name,
        name: prog.name,
        referrerIncentive: prog.referrerIncentive,
        leads: courseLeads.length,
        converted: courseEnrolled.length,
        payoutsPaid: payoutTotal,
        discountsGiven: discounts,
        feesCollected: fees,
        referralCost: payoutTotal + discounts,
      });
    });
  });

  const referralCost = payoutsPaid + discountsGiven;
  const pct = (cost, fees) => (fees > 0 ? ((cost / fees) * 100).toFixed(1) : "0.0");

  return {
    leads, converted, dropOffs,
    payoutsPaid, discountsGiven, feesCollected, referralCost,
    costPercentage: pct(referralCost, feesCollected),
    courses: courses.map((c) => ({ ...c, costPercentage: pct(c.referralCost, c.feesCollected) })),
  };
}
