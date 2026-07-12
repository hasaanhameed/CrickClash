export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export interface Question {
  id: string;
  quizPackId: string;
  difficulty: Difficulty;
  text: string;
  options: string[];
  createdAt: string;
}
