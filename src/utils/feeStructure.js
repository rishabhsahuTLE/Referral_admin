// Semester-wise fee structure and referee-discount maths for Reward Master.
//
// Each course's fees are split across semesters, and every semester has its own fee-head
// breakdown (Tuition / Examination / Registration). A configuration's referee discount is
// a % of ONE fee head, and it is only ever applied to the referee's FIRST payment — which
// depends on the payment type they choose:
//   • Sem-wise → first payment = Semester 1 fees
//   • Yearly   → first payment = Semester 1 + Semester 2 fees (Year 1)
//   • Lumpsum  → first payment = the whole course fee, paid up front
// Payment types not enabled on a configuration get a ₹0 discount (the referee still pays
// the full first payment under that type).

export const FEE_HEAD_OPTIONS = ["Tuition Fees", "Examination Fees", "Registration Fee"];

export const PAYMENT_TYPES = [
  { key: "semester", label: "Sem-wise", firstPayment: "First Sem" },
  { key: "yearly", label: "Yearly", firstPayment: "First Year" },
  { key: "lumpsum", label: "Lumpsum", firstPayment: "Lumpsum" },
];

export const PAYMENT_TYPE_KEYS = PAYMENT_TYPES.map((p) => p.key);

// Configurations saved before payment types existed rewarded on the first-term fee
// payment only (BR-4), so they read as Sem-wise.
export const LEGACY_PAYMENT_TYPES = ["semester"];

export const getPaymentTypes = (config) =>
  Array.isArray(config?.paymentTypes) ? config.paymentTypes : LEGACY_PAYMENT_TYPES;

export const paymentTypeLabel = (key) => PAYMENT_TYPES.find((p) => p.key === key)?.label ?? key;

// Number of semesters a course runs for, inferred from its name/type (UMS would supply
// this in production).
export function getSemesterCount(name = "", type = "UG") {
  if (/^PhD/i.test(name)) return 6;
  if (/^(B\.Tech|B\.E\b)/i.test(name)) return 8;
  if (/^(M\.|MBA|MCA)/i.test(name)) return 4;
  if (/^B\./i.test(name) || /^BCA|^BBA/i.test(name)) return 6;
  return type === "PG" ? 4 : 6;
}

const round100 = (n) => Math.round(n / 100) * 100;

// Splits a course's total cost into semesters, each with its own fee-head distribution:
//   • Registration Fee — one-time, charged in Semester 1 only (5% of cost)
//   • Examination Fees — 8% of cost, split evenly across semesters
//   • Tuition Fees     — the rest; odd semesters carry slightly more than even ones
// Any rounding remainder lands on Semester 1 tuition so the semesters always add up to
// exactly the course cost. Returns [{ semester, heads: { [feeHead]: amount }, total }].
export function getFeeStructure(prog, cost = prog?.cost ?? 0) {
  if (Array.isArray(prog?.feeStructure) && prog.feeStructure.length) return prog.feeStructure;

  const sems = getSemesterCount(prog?.name, prog?.type);
  const registration = round100(cost * 0.05);
  const examPerSem = round100((cost * 0.08) / sems);
  const tuitionPool = cost - registration - examPerSem * sems;
  // odd semesters weight 1.1, even 0.9 → same pool, uneven distribution within the year
  const weights = Array.from({ length: sems }, (_, i) => (i % 2 === 0 ? 1.1 : 0.9));
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const tuition = weights.map((w) => round100((tuitionPool * w) / weightSum));
  tuition[0] += tuitionPool - tuition.reduce((a, b) => a + b, 0);

  return tuition.map((t, i) => {
    const heads = {
      "Tuition Fees": t,
      "Examination Fees": examPerSem,
      "Registration Fee": i === 0 ? registration : 0,
    };
    return { semester: i + 1, heads, total: Object.values(heads).reduce((a, b) => a + b, 0) };
  });
}

// Semesters covered by the first payment under each payment type.
function firstPaymentSemesters(typeKey, structure) {
  if (typeKey === "semester") return structure.slice(0, 1);
  if (typeKey === "yearly") return structure.slice(0, 2);
  return structure; // lumpsum
}

// For one configuration, the referee's first payment under every payment type:
// { semester|yearly|lumpsum: { selected, gross, feeHeadAmount, discount, payable } }.
// `discount` is (refereeDiscount % × the fee head's amount within that first payment),
// and 0 when the payment type isn't enabled on the configuration.
export function computeFirstPayments(prog, config) {
  const structure = getFeeStructure(prog, config?.cost ?? prog?.cost ?? 0);
  const selected = getPaymentTypes(config);
  const pct = parseFloat(config?.refereeDiscount) || 0;
  const feeHead = config?.feeHead ?? FEE_HEAD_OPTIONS[0];

  return Object.fromEntries(
    PAYMENT_TYPES.map(({ key }) => {
      const sems = firstPaymentSemesters(key, structure);
      const gross = sems.reduce((a, s) => a + s.total, 0);
      const feeHeadAmount = sems.reduce((a, s) => a + (s.heads[feeHead] ?? 0), 0);
      const isSelected = selected.includes(key);
      const discount = isSelected ? Math.round((feeHeadAmount * pct) / 100) : 0;
      return [key, { selected: isSelected, gross, feeHeadAmount, discount, payable: gross - discount }];
    })
  );
}

// The highest first-payment discount a referee can get on a configuration (across its
// enabled payment types) — used where a single per-conversion figure is needed, e.g. the
// Dashboard's cost-of-referral estimate.
export function getMaxRefereeDiscount(prog, config = prog) {
  return Math.max(0, ...Object.values(computeFirstPayments(prog, config)).map((p) => p.discount));
}
