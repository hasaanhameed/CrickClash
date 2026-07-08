import api from "../lib/api";
import type { QuizPack } from "../types/quizPack";

export async function getQuizPacks(): Promise<QuizPack[]> {
  const { data } = await api.get<QuizPack[]>("/quiz-packs");
  return data;
}
