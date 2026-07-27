// Deterministic PRNG (mulberry32) — same seed always produces the same
// sequence of "random" numbers, which is what lets every user get an
// identical shuffle for the same calendar date.
function mulberry32(seed: number) {
  return function random() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashStringToInt(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

function seededShuffle<T>(items: T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10); // "2026-07-27"
}

export function pickDailyQuestionIds(
  allQuestionIds: string[],
  date: Date,
  count: number,
): string[] {
  const seed = hashStringToInt(toDateKey(date));
  return seededShuffle(allQuestionIds, seed).slice(0, count);
}

export function computeNewStreak(
  lastChallengeDate: Date | null,
  today: Date,
  currentStreak: number,
): number {
  if (!lastChallengeDate) return 1;

  const diffDays = Math.round(
    (today.getTime() - lastChallengeDate.getTime()) / 86_400_000,
  );

  return diffDays === 1 ? currentStreak + 1 : 1;
}
