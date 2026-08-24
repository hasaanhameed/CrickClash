"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Clock3,
  Flame,
  Loader2,
  Trophy,
  XCircle,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import AuthButtons from "../../../components/auth/AuthButtons";
import {
  getTodayChallenge,
  submitDailyChallenge,
} from "../../../services/dailyChallenge.service";
import type {
  SubmitDailyChallengeResponse,
  TodayChallengeResponse,
} from "../../../types/dailyChallenge";

const difficultyStyles = {
  EASY: "border-pitch-bright/40 bg-pitch-bright/10 text-pitch-bright",
  MEDIUM: "border-gold/40 bg-gold/10 text-gold",
  HARD: "border-ember/40 bg-ember/10 text-ember",
};

const optionLetters = ["A", "B", "C", "D", "E", "F"];

// In-progress answers survive a reload/crash/reboot (localStorage is
// disk-backed, not session-only) so a user doesn't lose progress or have
// to re-see already-answered questions. Keyed by date so a stale entry
// from a previous day is never picked up.
const PROGRESS_STORAGE_KEY = "crickclash:dailyChallengeProgress";

function loadSavedAnswers(date: string): Record<string, string> | null {
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { date: string; answers: Record<string, string> };
    return saved.date === date ? saved.answers : null;
  } catch {
    return null;
  }
}

function saveAnswers(date: string, answers: Record<string, string>) {
  localStorage.setItem(
    PROGRESS_STORAGE_KEY,
    JSON.stringify({ date, answers }),
  );
}

function clearSavedAnswers() {
  localStorage.removeItem(PROGRESS_STORAGE_KEY);
}

export default function DailyChallengePage() {
  const { user, isLoadingUser } = useAuth();
  const [today, setToday] = useState<TodayChallengeResponse | null>(null);
  const [uiStep, setUiStep] = useState<"rules" | "quiz">("rules");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitDailyChallengeResponse | null>(
    null,
  );

  useEffect(() => {
    if (!user) return;
    getTodayChallenge().then((response) => {
      setToday(response);
      if (!response.alreadyAttempted) {
        const saved = loadSavedAnswers(response.date);
        if (saved && Object.keys(saved).length > 0) {
          setAnswers(saved);
          setUiStep("quiz");
        }
      } else {
        // Stale progress from an attempt that's already been submitted
        // elsewhere (e.g. another tab) — nothing left to resume.
        clearSavedAnswers();
      }
    });
  }, [user]);

  // Persist answers as they're picked, so a reload/crash/reboot resumes
  // from where the user left off instead of losing progress.
  useEffect(() => {
    if (!today || today.alreadyAttempted) return;
    if (Object.keys(answers).length === 0) return;
    saveAnswers(today.date, answers);
  }, [today, answers]);

  // Logging out mid-attempt would leave the in-progress score with nowhere
  // to land, so the log out option is hidden for the duration of the quiz.
  const quizInProgress =
    !!today && !today.alreadyAttempted && uiStep === "quiz" && !result;

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const response = await submitDailyChallenge(answers);
      setResult(response);
      clearSavedAnswers();
    } catch {
      // Most likely a stray double-submit (e.g. two open tabs) — fall back
      // to whatever the server now says is true rather than showing an error.
      const fresh = await getTodayChallenge();
      setToday(fresh);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Floodlit-pitch backdrop — same night-stadium atmosphere as the homepage hero */}
      <Image
        src="/images/grass.png"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-hero-dark/45" />
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-hero-dark to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-hero-dark to-transparent" />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link
          href="/"
          className="font-display text-glow flex items-center gap-4 text-4xl text-foreground"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gold via-gold-deep to-gold/50 shadow-[0_0_26px_rgba(232,181,58,0.55)]">
            <Image src="/images/logo.png" alt="" width={58} height={58} />
          </div>
          <span>
            CRICK<span className="text-gold">CLASH</span>
          </span>
        </Link>
        <AuthButtons hideLogout={quizInProgress} />
      </header>

      <div className="relative z-10 flex flex-1 items-start justify-center overflow-hidden px-4 pt-3 pb-4">
        {isLoadingUser || (user && !today) ? (
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        ) : !user ? (
          <div className="w-full max-w-sm rounded-xl border-2 border-gold/40 bg-surface-raised p-8 text-center shadow-[0_0_40px_rgba(232,181,58,0.2)]">
            <h1 className="font-display text-glow text-2xl text-gold">
              LOG IN TO PLAY
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              Daily Challenge tracks your score and streak, so you&apos;ll
              need an account first.
            </p>
            <div className="mt-6 flex justify-center">
              <AuthButtons />
            </div>
          </div>
        ) : result ? (
          <ResultView result={result} />
        ) : today && today.alreadyAttempted ? (
          <AlreadyAttemptedView today={today} />
        ) : today && uiStep === "rules" ? (
          <RulesView streak={today.streak} onStart={() => setUiStep("quiz")} />
        ) : today && !today.alreadyAttempted ? (
          <QuizView
            questions={today.questions}
            answers={answers}
            initialIndex={Math.max(
              0,
              (() => {
                const firstUnanswered = today.questions.findIndex(
                  (q) => !answers[q.id],
                );
                return firstUnanswered === -1
                  ? today.questions.length - 1
                  : firstUnanswered;
              })(),
            )}
            onAnswer={(questionId, option) =>
              setAnswers((prev) => ({ ...prev, [questionId]: option }))
            }
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        ) : null}
      </div>
    </main>
  );
}

function RulesView({
  streak,
  onStart,
}: {
  streak: number;
  onStart: () => void;
}) {
  return (
    <div className="w-full max-w-xl rounded-xl border-2 border-gold/40 bg-surface-raised/95 p-8 shadow-[0_0_40px_rgba(232,181,58,0.2)] backdrop-blur-sm">
      <h1 className="font-display text-glow text-2xl text-gold">
        TODAY&apos;S CHALLENGE
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        {streak > 0
          ? `You're on a ${streak} day streak — five questions to keep it alive.`
          : "Five questions. Same set as every other player today."}
      </p>

      <div className="mt-6 rounded-lg border border-foreground/10 bg-hero-dark/30 p-4">
        <h2 className="font-display text-sm text-gold">HOW IT WORKS</h2>

        <p className="mt-3 text-xs tracking-wide text-foreground/50 uppercase">
          Points per question
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-md border border-pitch-bright/40 bg-pitch-bright/10 px-3 py-1 text-xs text-pitch-bright">
            Easy · 10 pts
          </span>
          <span className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1 text-xs text-gold">
            Medium · 20 pts
          </span>
          <span className="rounded-md border border-ember/40 bg-ember/10 px-3 py-1 text-xs text-ember">
            Hard · 30 pts
          </span>
        </div>

        <ul className="mt-4 space-y-2.5 text-sm text-foreground/70">
          <li className="flex items-center gap-2.5">
            <Clock3 className="h-4 w-4 shrink-0 text-gold" />
            No timer — answer at your own pace
          </li>
          <li className="flex items-center gap-2.5">
            <XCircle className="h-4 w-4 shrink-0 text-gold" />
            Wrong answers earn 0 points
          </li>
          <li className="flex items-center gap-2.5">
            <Flame className="h-4 w-4 shrink-0 text-gold" />
            One attempt per day — come back tomorrow to keep your streak
          </li>
        </ul>
      </div>

      <button
        type="button"
        onClick={onStart}
        className="btn-game btn-gold font-display mt-6 w-full cursor-pointer rounded-md py-3 text-lg text-foreground"
      >
        <span className="text-glow relative z-10">START CHALLENGE</span>
      </button>
    </div>
  );
}

function ProgressStepper({
  total,
  currentIndex,
}: {
  total: number;
  currentIndex: number;
}) {
  return (
    <div className="mb-4 flex flex-col items-center gap-2">
      <span className="text-glow font-display text-sm tracking-widest text-gold uppercase">
        Question {currentIndex + 1} of {total}
      </span>
      <div className="flex items-center">
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} className="flex items-center">
            <div
              className={`font-display flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm transition-colors ${
                i < currentIndex
                  ? "border-gold bg-gold text-hero-dark shadow-[0_0_14px_rgba(232,181,58,0.7)]"
                  : i === currentIndex
                    ? "text-glow border-gold bg-gold/15 text-gold shadow-[0_0_14px_rgba(232,181,58,0.5)]"
                    : "border-foreground/20 text-foreground/40"
              }`}
            >
              {i + 1}
            </div>
            {i < total - 1 && (
              <div
                className={`h-0.5 w-6 transition-colors sm:w-10 ${
                  i < currentIndex ? "bg-gold" : "bg-foreground/15"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizView({
  questions,
  answers,
  initialIndex,
  onAnswer,
  onSubmit,
  submitting,
}: {
  questions: { id: string; difficulty: keyof typeof difficultyStyles; text: string; options: string[] }[];
  answers: Record<string, string>;
  initialIndex: number;
  onAnswer: (questionId: string, option: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const question = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = Boolean(answers[question.id]);

  function handleProceed() {
    if (isLastQuestion) {
      onSubmit();
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <ProgressStepper total={questions.length} currentIndex={currentIndex} />

      <div className="relative overflow-hidden rounded-2xl border-2 border-gold/50 shadow-[0_0_50px_rgba(232,181,58,0.25)]">
        {/* bat-on-ball impact shot gets its own unobstructed band, fully visible */}
        <div className="relative h-44 sm:h-56">
          <Image
            src="/images/quiz-background.png"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent" />
          <span
            className={`absolute top-4 left-4 rounded-md border px-3 py-1 text-xs font-semibold tracking-wide ${difficultyStyles[question.difficulty]}`}
          >
            {question.difficulty}
          </span>
        </div>

        {/* question + options sit below the image, on a solid surface */}
        <div className="bg-surface-raised/95 p-6 sm:p-8">
          <p className="text-glow text-xl leading-snug font-medium text-foreground sm:text-2xl">
            {question.text}
          </p>

          <div className="mt-5 flex flex-col gap-2.5">
            {question.options.map((option, i) => {
              const selected = answers[question.id] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onAnswer(question.id, option)}
                  className={`btn-game flex cursor-pointer items-center gap-4 rounded-lg border px-5 py-3.5 text-left text-base transition ${
                    selected
                      ? "btn-gold border-transparent text-foreground"
                      : "border-gold/25 bg-hero-dark/50 text-foreground/85 hover:border-gold/60"
                  }`}
                >
                  <span
                    className={`font-display relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm ${
                      selected
                        ? "border-hero-dark/20 bg-hero-dark text-gold"
                        : "border-gold/30 text-gold/70"
                    }`}
                  >
                    {optionLetters[i]}
                  </span>
                  <span className="relative z-10">{option}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!hasAnswered || submitting}
        onClick={handleProceed}
        className="btn-game btn-gold font-display mt-5 w-full cursor-pointer rounded-md py-3.5 text-lg text-foreground disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-glow relative z-10">
          {submitting
            ? "SUBMITTING..."
            : isLastQuestion
              ? "SUBMIT ANSWERS"
              : "NEXT QUESTION →"}
        </span>
      </button>
    </div>
  );
}

function ResultView({ result }: { result: SubmitDailyChallengeResponse }) {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border-2 border-gold/50 shadow-[0_0_50px_rgba(232,181,58,0.25)]">
      <div className="relative h-56 sm:h-64">
        <Image
          src="/images/quiz-background.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent" />
      </div>

      <div className="bg-surface-raised/95 p-6 sm:p-8">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="h-8 w-8 text-gold" />
          <h1 className="font-display text-glow text-3xl text-gold">
            {result.score} PTS
          </h1>
        </div>
        <p className="mt-2 text-center text-sm text-foreground/70">
          {result.correctCount} of {result.totalQuestions} correct
        </p>

        <div className="mt-4 flex items-center justify-center gap-2 text-ember">
          <Flame className="h-5 w-5" />
          <span className="font-display text-sm">
            {result.streak} day streak
          </span>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          {result.results.map((r, index) => (
            <div
              key={r.questionId}
              className="flex items-center justify-between gap-3 rounded-md border border-gold/20 bg-hero-dark/30 px-4 py-3"
            >
              <div className="flex items-center gap-2.5 text-sm">
                {r.correct ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-pitch-bright" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-ember" />
                )}
                <span className="font-display text-glow text-gold">
                  Question {index + 1}
                </span>
                {!r.correct && (
                  <span className="text-foreground/50">
                    — correct answer: {r.correctAnswer}
                  </span>
                )}
              </div>
              <span
                className={`font-display text-sm ${r.correct ? "text-pitch-bright" : "text-foreground/40"}`}
              >
                +{r.pointsAwarded} pts
              </span>
            </div>
          ))}
        </div>

        <Link
          href="/"
          className="btn-game btn-gold font-display mt-6 block w-full cursor-pointer rounded-md py-3 text-center text-lg text-foreground"
        >
          <span className="text-glow relative z-10">BACK HOME</span>
        </Link>
      </div>
    </div>
  );
}

function AlreadyAttemptedView({
  today,
}: {
  today: Extract<TodayChallengeResponse, { alreadyAttempted: true }>;
}) {
  return (
    <div className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-gold/50 shadow-[0_0_50px_rgba(232,181,58,0.25)]">
      <div className="relative h-48 sm:h-56">
        <Image
          src="/images/quiz-background.png"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent" />
      </div>

      <div className="bg-surface-raised/95 p-6 text-center sm:p-8">
        <Trophy className="mx-auto h-10 w-10 text-gold" />
        <h1 className="font-display text-glow mt-3 text-2xl text-gold">
          ALREADY PLAYED TODAY
        </h1>
        <p className="mt-2 text-sm text-foreground/70">
          You scored {today.score} points on today&apos;s {today.totalQuestions}
          -question set.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-ember">
          <Flame className="h-5 w-5" />
          <span className="font-display text-sm">
            {today.streak} day streak
          </span>
        </div>
        <p className="mt-4 text-xs text-foreground/50">
          Come back tomorrow for a new set of questions.
        </p>
        <Link
          href="/"
          className="btn-game btn-gold font-display mt-6 block w-full cursor-pointer rounded-md py-3 text-center text-lg text-foreground"
        >
          <span className="text-glow relative z-10">BACK HOME</span>
        </Link>
      </div>
    </div>
  );
}
