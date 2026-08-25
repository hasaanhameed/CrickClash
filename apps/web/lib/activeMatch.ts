import type { MatchSummary } from "../types/quizPackMatch";

const ACTIVE_MATCH_KEY = "crickclash:activeMatch";

/**
 * Hands the paired match from the pack modal to the match page across a
 * navigation. Temporary: once the match is server-driven (issue #10) the page
 * will get this straight off the socket instead.
 */
export function storeActiveMatch(match: MatchSummary) {
  sessionStorage.setItem(ACTIVE_MATCH_KEY, JSON.stringify(match));
}

export function readActiveMatch(): MatchSummary | null {
  try {
    const raw = sessionStorage.getItem(ACTIVE_MATCH_KEY);
    return raw ? (JSON.parse(raw) as MatchSummary) : null;
  } catch {
    return null;
  }
}

export function clearActiveMatch() {
  sessionStorage.removeItem(ACTIVE_MATCH_KEY);
}
