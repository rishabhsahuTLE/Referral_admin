// Helpers for a course's dated reward configurations. Dates are stored in the display
// format used across the app ("01 Jun 2026"); an Effective To of "-" (or missing) means
// the configuration is open-ended.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const isOpenEnded = (effectiveTo) => !effectiveTo || effectiveTo === '-';

// "01 Jun 2026" -> local Date at midnight (null if unparseable)
export function parseDisplayDate(str) {
  if (!str || str === '-') return null;
  const [d, m, y] = str.trim().split(/\s+/);
  const month = MONTHS.indexOf(m);
  if (month === -1) return null;
  return new Date(Number(y), month, Number(d));
}

export const formatDisplayDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

// Date -> "YYYY-MM-DD" for <input type="date">
export const toIsoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// "YYYY-MM-DD" -> local Date (parsed as local, not UTC, to avoid an off-by-one day)
export function fromIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

export const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const CONFIG_FIELDS = ['cost', 'referrerIncentive', 'refereeDiscount', 'effectiveFrom', 'effectiveTo', 'feeHead', 'lastModifiedBy', 'lastModifiedOn'];

export const pickConfigFields = (obj) =>
  Object.fromEntries(CONFIG_FIELDS.map(k => [k, obj[k]]));

// A program's configurations sorted by Effective From. Programs created before
// configurations existed are read as a single configuration from their top-level fields.
export function getConfigs(prog) {
  const configs = prog.configs && prog.configs.length ? prog.configs : [pickConfigFields(prog)];
  return [...configs].sort((a, b) => (parseDisplayDate(a.effectiveFrom)?.getTime() ?? 0) - (parseDisplayDate(b.effectiveFrom)?.getTime() ?? 0));
}

// The configuration whose date range covers `on` (default today); falls back to the one
// with the latest Effective From when none covers that date.
export function getActiveConfig(configs, on = startOfToday()) {
  const t = on.getTime();
  const active = configs.find(c => {
    const from = parseDisplayDate(c.effectiveFrom);
    const to = parseDisplayDate(c.effectiveTo);
    return from && from.getTime() <= t && (isOpenEnded(c.effectiveTo) || (to && t <= to.getTime()));
  });
  return active ?? configs[configs.length - 1];
}
