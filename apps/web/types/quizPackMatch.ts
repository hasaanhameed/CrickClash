/** Event names — must stay in step with the backend gateway's QueueEvent. */
export const QueueEvent = {
  // client → server
  Join: "queue:join",
  Cancel: "queue:cancel",
  // server → client
  Waiting: "queue:waiting",
  Matched: "queue:matched",
  TimedOut: "queue:timed-out",
  AlreadyEngaged: "queue:already-engaged",
  Error: "queue:error",
} as const;

export interface MatchPlayer {
  userId: string;
  username: string;
}

export interface MatchSummary {
  matchId: string;
  packSlug: string;
  packTitle: string;
  /** In pairing order: the longer-waiting player first. */
  players: MatchPlayer[];
}

export interface AlreadyEngagedPayload {
  packSlug: string;
  packTitle: string;
}

/** Where the search has got to, for the pack currently being viewed. */
export type QueueStatus =
  | { phase: "idle" }
  | { phase: "searching" }
  | { phase: "matched"; match: MatchSummary }
  | { phase: "timed-out" }
  | { phase: "already-engaged"; packTitle: string }
  | { phase: "error"; message: string };
