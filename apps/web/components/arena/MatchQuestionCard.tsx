"use client";

import Image from "next/image";
import { Check, Hourglass, Swords, User } from "lucide-react";
import type { Difficulty, Question } from "../../types/question";

const difficultyStyles: Record<Difficulty, string> = {
  EASY: "border-pitch-bright/40 bg-pitch-bright/10 text-pitch-bright",
  MEDIUM: "border-gold/40 bg-gold/10 text-gold",
  HARD: "border-ember/40 bg-ember/10 text-ember",
};

const optionLetters = ["A", "B", "C", "D", "E", "F"];

export interface MatchScore {
  username: string;
  score: number;
  /** Locked in an answer for the question on screen. */
  answered: boolean;
}

/**
 * The live question screen: countdown and question number above the card,
 * both players' running scores flanking it, pack artwork as the card header.
 */
export default function MatchQuestionCard({
  question,
  questionNumber,
  totalQuestions,
  packImage,
  secondsLeft,
  you,
  opponent,
  selectedOption,
  onSelect,
  locked,
}: {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  packImage: string;
  secondsLeft: number;
  you: MatchScore;
  opponent: MatchScore;
  selectedOption: string | null;
  onSelect: (option: string) => void;
  locked: boolean;
}) {
  return (
    <div key={question.id} className="w-full max-w-6xl animate-arena-rise">
      <div className="mb-5 flex flex-col items-center gap-1">
        <div className="flex items-baseline gap-3">
          <span className="font-display text-glow text-xl tracking-widest text-gold/70">
            TIME LEFT:
          </span>
          <span
            key={secondsLeft}
            className={`font-display text-glow animate-arena-tick text-6xl tabular-nums transition-colors sm:text-7xl ${
              secondsLeft <= 5 ? "text-ember" : "text-gold"
            }`}
          >
            {secondsLeft}
          </span>
        </div>
        <span className="font-display text-glow text-2xl tracking-widest text-gold sm:text-3xl">
          QUESTION {questionNumber} OF {totalQuestions}
        </span>
      </div>

      {/* Scores flank the card on desktop; they stack above it on narrow screens */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center sm:gap-6">
        <div className="order-2 flex w-full gap-4 sm:order-1 sm:w-auto sm:flex-col">
          <ScoreCard player={you} label="YOU" tone="gold" />
          <div className="sm:hidden flex-1">
            <ScoreCard player={opponent} label="OPPONENT" tone="ember" />
          </div>
        </div>

        <div className="order-1 w-full max-w-4xl overflow-hidden rounded-2xl border-2 border-gold/50 shadow-[0_0_50px_rgba(232,181,58,0.25)] sm:order-2">
          <div className="relative h-56 sm:h-72">
            <Image
              src={packImage}
              alt=""
              fill
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent" />
            <span
              className={`absolute top-4 left-4 rounded-md border px-3 py-1 text-xs font-semibold tracking-wide ${difficultyStyles[question.difficulty]}`}
            >
              {question.difficulty}
            </span>
          </div>

          <div className="bg-surface-raised/95 p-6 sm:p-8">
            <p className="text-glow text-xl leading-snug font-medium text-foreground sm:text-2xl">
              {question.text}
            </p>

            <div className="arena-stagger mt-5 flex flex-col gap-2.5">
              {question.options.map((option, i) => {
                const selected = selectedOption === option;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={locked}
                    onClick={() => onSelect(option)}
                    className={`btn-game flex items-center gap-4 rounded-lg border px-5 py-3.5 text-left text-base transition-all duration-200 disabled:cursor-not-allowed ${
                      selected
                        ? "btn-gold scale-[1.02] border-transparent text-foreground shadow-[0_0_24px_rgba(232,181,58,0.45)]"
                        : "border-gold/25 bg-hero-dark/50 text-foreground/85 not-disabled:cursor-pointer hover:border-gold/60 disabled:opacity-60"
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

        <div className="order-3 hidden sm:block">
          <ScoreCard player={opponent} label="OPPONENT" tone="ember" />
        </div>
      </div>
    </div>
  );
}

const scoreTones = {
  gold: {
    frame:
      "border-gold/50 shadow-[0_0_30px_rgba(232,181,58,0.2)] transition-shadow duration-300",
    accent: "text-gold",
    band: "bg-gold/10 border-gold/30",
    avatar: "border-gold/40 bg-gold/10 text-gold",
  },
  ember: {
    frame:
      "border-ember/50 shadow-[0_0_30px_rgba(255,140,46,0.18)] transition-shadow duration-300",
    accent: "text-ember",
    band: "bg-ember/10 border-ember/30",
    avatar: "border-ember/40 bg-ember/10 text-ember",
  },
};

function ScoreCard({
  player,
  label,
  tone,
}: {
  player: MatchScore;
  label: string;
  tone: keyof typeof scoreTones;
}) {
  const styles = scoreTones[tone];

  return (
    <div
      className={`flex-1 overflow-hidden rounded-xl border-2 bg-surface-raised/90 sm:w-44 ${styles.frame}`}
    >
      <div
        className={`flex items-center justify-center gap-1.5 border-b px-3 py-1.5 ${styles.band}`}
      >
        <Swords className={`h-3.5 w-3.5 ${styles.accent}`} />
        <span
          className={`font-display text-[0.65rem] tracking-widest ${styles.accent}`}
        >
          {label}
        </span>
      </div>

      <div className="px-4 py-4 text-center">
        <div
          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full border-2 ${styles.avatar}`}
        >
          <User className="h-5 w-5" />
        </div>
        <p className="mt-2 truncate text-sm text-foreground/85">
          {player.username}
        </p>
        <p
          className={`font-display text-glow mt-1 text-4xl tabular-nums transition-all duration-300 ${styles.accent}`}
        >
          {player.score}
        </p>
        <p className="text-[0.6rem] tracking-widest text-foreground/40 uppercase">
          points
        </p>

        <AnswerState answered={player.answered} tone={tone} />
      </div>
    </div>
  );
}

/**
 * Shows whether this player has locked an answer in for the question on
 * screen — a breathing "thinking" state until they do, then a solid tick.
 */
function AnswerState({
  answered,
  tone,
}: {
  answered: boolean;
  tone: keyof typeof scoreTones;
}) {
  if (!answered) {
    return (
      <div className="mt-3 flex animate-arena-breathe items-center justify-center gap-1.5 text-foreground/45">
        <Hourglass className="h-3.5 w-3.5" />
        <span className="font-display text-[0.6rem] tracking-widest uppercase">
          Thinking
        </span>
      </div>
    );
  }

  return (
    <div
      className={`mt-3 flex animate-arena-pop items-center justify-center gap-1.5 rounded-md border py-1 ${scoreTones[tone].band} ${scoreTones[tone].accent}`}
    >
      <Check className="h-3.5 w-3.5" />
      <span className="font-display text-[0.6rem] tracking-widest uppercase">
        Answered
      </span>
    </div>
  );
}
