import api from "../lib/api";
import type { QuizPack, QuizPackDetail } from "../types/quizPack";

export async function getQuizPacks(): Promise<QuizPack[]> {
  const { data } = await api.get<QuizPack[]>("/quiz-packs");
  return data;
}

export async function getQuizPackDetail(
  slug: string,
): Promise<QuizPackDetail> {
  const { data } = await api.get<QuizPackDetail>(`/quiz-packs/${slug}`);
  return data;
}
