// Helpers for a course's dated reward configurations. Dates are stored in the display
// format used across the app ("01 Jun 2026, 00:00"), date + 24-hour time; an Effective To
// of "-" (or missing) means the configuration is open-ended. A bare "01 Jun 2026" with no
// time is still accepted and parses to midnight, for backward compatibility.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const isOpenEnded = (effectiveTo) => !effectiveTo || effectiveTo === '-';

// "01 Jun 2026, 15:46" -> local Date (null if unparseable). The time part is optional and
// defaults to midnight.
export function parseDisplayDate(str) {
  if (!str || str === '-') return null;
  const [datePart, timePart] = str.split(',').map((s) => s.trim());
  const [d, m, y] = datePart.split(/\s+/);
  const month = MONTHS.indexOf(m);
  if (month === -1) return null;
  let hours = 0, minutes = 0;
  if (timePart) {
    const [h, mm] = timePart.split(':').map(Number);
    if (!Number.isNaN(h)) hours = h;
    if (!Number.isNaN(mm)) minutes = mm;
  }
  return new Date(Number(y), month, Number(d), hours, minutes);
}

export const formatDisplayDate = (date) =>
  `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;

export const formatTimeOnly = (date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export const formatDisplayDateTime = (date) => `${formatDisplayDate(date)}, ${formatTimeOnly(date)}`;

// The defaults — midnight for Effective From, end-of-day for Effective To. Any other time
// is a deliberate, non-default instant (e.g. a same-day Stop) worth calling out.
const isDefaultTime = (date) =>
  (date.getHours() === 0 && date.getMinutes() === 0) || (date.getHours() === 23 && date.getMinutes() === 59);

// Renders a stored Effective From/To (string) or a computed instant (Date) for display:
// just the date when its time is a default, date + time otherwise.
export function formatConfigDate(value) {
  const date = value instanceof Date ? value : parseDisplayDate(value);
  if (!date) return value ?? '-';
  return isDefaultTime(date) ? formatDisplayDate(date) : formatDisplayDateTime(date);
}

// Date -> "YYYY-MM-DD" for <input type="date">
export const toIsoDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

// "YYYY-MM-DD" -> local Date at midnight (parsed as local, not UTC, to avoid an off-by-one day)
export function fromIsoDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export const addDays = (date, n) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);

export const addMinutes = (date, n) => new Date(date.getTime() + n * 60000);

export const isMidnight = (date) => date.getHours() === 0 && date.getMinutes() === 0;

export const startOfToday = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const endOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59);

const CONFIG_FIELDS = ['cost', 'referrerIncentive', 'refereeDiscount', 'effectiveFrom', 'effectiveTo', 'feeHead', 'lastModifiedBy', 'lastModifiedOn', 'cancelled'];

export const pickConfigFields = (obj) =>
  Object.fromEntries(CONFIG_FIELDS.map(k => [k, obj[k]]));

// A program's configurations sorted by Effective From. Programs created before
// configurations existed are read as a single configuration from their top-level fields.
export function getConfigs(prog) {
  const configs = prog.configs && prog.configs.length ? prog.configs : [pickConfigFields(prog)];
  return [...configs].sort((a, b) => (parseDisplayDate(a.effectiveFrom)?.getTime() ?? 0) - (parseDisplayDate(b.effectiveFrom)?.getTime() ?? 0));
}

// Whether a configuration's Effective From/To window covers `on` (default: this exact
// moment — not just today's date, now that configurations carry real times).
export function coversToday(c, on = new Date()) {
  const t = on.getTime();
  const from = parseDisplayDate(c.effectiveFrom);
  const to = parseDisplayDate(c.effectiveTo);
  return !!from && from.getTime() <= t && (isOpenEnded(c.effectiveTo) || (to && t <= to.getTime()));
}

// The configuration whose date range covers `on` (default: this exact moment); falls back
// to the one with the latest Effective From when none covers that instant.
export function getActiveConfig(configs, on = new Date()) {
  const active = configs.find(c => coversToday(c, on));
  return active ?? configs[configs.length - 1];
}

// Whether a configuration's Effective From hasn't arrived yet — it hasn't taken effect,
// so it can simply be removed rather than stopped.
export function isFuture(c, on = new Date()) {
  const from = parseDisplayDate(c.effectiveFrom);
  return !!from && from.getTime() > on.getTime();
}

// The earliest non-overlapping instant on `dateMidnight` (a date at local midnight):
// midnight itself, unless an existing configuration already covers that midnight, in
// which case the moment right after that configuration's end — provided it also ends on
// this same day. (If it runs past this day, the whole day is occupied; callers fall back
// to midnight and let the normal overlap check reject the pick.)
export function minStartOnDate(dateMidnight, configs) {
  const conflicting = configs.find(c => coversToday(c, dateMidnight));
  if (!conflicting || isOpenEnded(conflicting.effectiveTo)) return dateMidnight;
  const conflictEnd = parseDisplayDate(conflicting.effectiveTo);
  const sameDay = conflictEnd.getFullYear() === dateMidnight.getFullYear() &&
    conflictEnd.getMonth() === dateMidnight.getMonth() &&
    conflictEnd.getDate() === dateMidnight.getDate();
  return sameDay ? addMinutes(conflictEnd, 1) : dateMidnight;
}
