import api from "../lib/api";
import type {
  SubmitDailyChallengeResponse,
  TodayChallengeResponse,
} from "../types/dailyChallenge";

export async function getTodayChallenge(): Promise<TodayChallengeResponse> {
  const { data } = await api.get<TodayChallengeResponse>("/daily-challenge/today");
  return data;
}

export async function submitDailyChallenge(
  answers: Record<string, string>,
): Promise<SubmitDailyChallengeResponse> {
  const { data } = await api.post<SubmitDailyChallengeResponse>(
    "/daily-challenge/submit",
    { answers },
  );
  return data;
}
