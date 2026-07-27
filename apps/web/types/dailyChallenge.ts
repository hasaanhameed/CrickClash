import type { Difficulty } from "./question";

export interface DailyChallengeQuestion {
  id: string;
  difficulty: Difficulty;
  text: string;
  options: string[];
}

export interface TodayChallengeNotAttempted {
  date: string;
  alreadyAttempted: false;
  questions: DailyChallengeQuestion[];
  streak: number;
}

export interface TodayChallengeAlreadyAttempted {
  date: string;
  alreadyAttempted: true;
  score: number;
  streak: number;
  totalQuestions: number;
}

export type TodayChallengeResponse =
  | TodayChallengeNotAttempted
  | TodayChallengeAlreadyAttempted;

export interface DailyChallengeResult {
  questionId: string;
  correct: boolean;
  correctAnswer: string;
  pointsAwarded: number;
}

export interface SubmitDailyChallengeResponse {
  score: number;
  correctCount: number;
  totalQuestions: number;
  streak: number;
  results: DailyChallengeResult[];
}
