import type { Question } from "./question";

export interface QuizPack {
  id: string;
  slug: string;
  title: string;
  description: string;
  playCount: number;
  createdAt: string;
  questionCount: number;
}

export interface QuizPackDetail
  extends Omit<QuizPack, "questionCount"> {
  questions: Question[];
}
