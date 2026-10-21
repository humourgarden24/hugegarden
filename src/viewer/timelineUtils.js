export const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** construction.years is a list of [t, year] stops, linearly interpolated. */
export function yearAt(construction, t) {
  const s = construction.years;
  if (t <= s[0][0]) return s[0][1];
  for (let i = 1; i < s.length; i++) {
    if (t <= s[i][0]) {
      const [t0, y0] = s[i - 1];
      const [t1, y1] = s[i];
      return t1 === t0 ? y1 : y0 + ((y1 - y0) * (t - t0)) / (t1 - t0);
    }
  }
  return s[s.length - 1][1];
}

/**
 * Inverse of yearAt: which timeline position shows this year?
 * Returns null when the year is later than the last construction year
 * (the event happened after the monument was finished).
 */
export function tAtYear(construction, year) {
  const s = construction.years;
  if (year > s[s.length - 1][1]) return null;
  if (year <= s[0][1]) return 0;
  for (let i = 1; i < s.length; i++) {
    const [t0, y0] = s[i - 1];
    const [t1, y1] = s[i];
    if (year <= y1) return y1 === y0 ? t1 : t0 + ((year - y0) / (y1 - y0)) * (t1 - t0);
  }
  return 1;
}

export function formatYear(construction, year) {
  return Math.round(year);
}

/** Latest phase whose start time has been reached. */
export function phaseAt(construction, t) {
  let current = null;
  for (const phase of construction.phases) if (t >= phase.from - 1e-6) current = phase;
  return current;
}

/** Next (dir = 1) or previous (dir = -1) phase start relative to t. */
export function nextMilestone(construction, t, dir) {
  const marks = [...new Set([0, ...construction.phases.map((p) => p.from)])].sort((a, b) => a - b);
  if (dir > 0) return marks.find((m) => m > t + 0.002) ?? 1;
  return [...marks].reverse().find((m) => m < t - 0.002) ?? 0;
}