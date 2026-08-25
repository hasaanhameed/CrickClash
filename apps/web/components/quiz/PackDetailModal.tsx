"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Clock,
  Flame,
  HelpCircle,
  Loader2,
  Search,
  X,
  Zap,
} from "lucide-react";
import { getQuizPackDetail } from "../../services/quizPack.service";
import { packImages } from "../../lib/packImages";
import { useMatchQueue } from "../../hooks/useMatchQueue";
import { useAuth } from "../../contexts/AuthContext";
import MatchFoundCard from "../arena/MatchFoundCard";
import { storeActiveMatch } from "../../lib/activeMatch";
import Toast from "../Toast";
import type { QuizPack, QuizPackDetail } from "../../types/quizPack";
import type { QueueStatus } from "../../types/quizPackMatch";

interface PackDetailModalProps {
  pack: QuizPack;
  onClose: () => void;
}

export default function PackDetailModal({
  pack,
  onClose,
}: PackDetailModalProps) {
  const [detail, setDetail] = useState<QuizPackDetail | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { status, elapsedSeconds, search, cancel, reset } = useMatchQueue(
    pack.slug,
  );

  const startMatch = useCallback(() => {
    if (status.phase !== "matched") return;
    storeActiveMatch(status.match);
    router.push(`/play/quiz-pack/${pack.slug}`);
  }, [status, router, pack.slug]);

  // The socket would be rejected at the handshake without a token anyway —
  // catching it here turns a silent failure into an invitation to sign up.
  const handleSearch = () => {
    if (!user) {
      setToast("Log in to step into the arena! 🏏");
      return;
    }
    search();
  };

  useEffect(() => {
    getQuizPackDetail(pack.slug).then(setDetail);
  }, [pack.slug]);

  // Lock the page's scroll while this modal is open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  if (!detail) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-hero-dark/70 backdrop-blur-sm"
          onClick={onClose}
        />
        <Loader2 className="relative z-10 h-10 w-10 animate-spin text-gold" />
      </div>,
      document.body,
    );
  }

  if (status.phase === "matched") {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-hero-dark/70 backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md">
          <MatchFoundCard
            match={status.match}
            packImage={packImages[pack.slug]}
            onCountdownEnd={startMatch}
          />
        </div>
      </div>,
      document.body,
    );
  }

  const difficultyCounts = detail.questions.reduce<Record<string, number>>(
    (acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* blurred backdrop over the homepage behind it */}
      <div
        className="absolute inset-0 bg-hero-dark/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-xl border border-gold/30 bg-surface-raised shadow-2xl">
        <div className="relative h-64">
          <Image
            src={packImages[pack.slug]}
            alt={pack.title}
            fill
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/20 to-transparent" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 cursor-pointer rounded-full bg-hero-dark/60 p-1.5 text-foreground/80 transition hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="font-display text-glow text-2xl text-gold">
            {pack.title}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">{pack.description}</p>

          <div className="mt-4 flex items-center gap-5 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-gold" />
              {pack.questionCount} questions
            </span>
            <span className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-gold" />
              {pack.playCount.toLocaleString()} plays
            </span>
          </div>

          <div className="mt-6 rounded-lg border border-foreground/10 bg-hero-dark/30 p-4">
            <h3 className="font-display text-sm text-gold">HOW IT WORKS</h3>

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
                <Clock className="h-4 w-4 shrink-0 text-gold" />
                30 seconds to answer each question
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="h-4 w-4 shrink-0 text-gold" />
                Faster answers earn more — 50% to 100% of the points above
              </li>
              <li className="flex items-center gap-2.5">
                <X className="h-4 w-4 shrink-0 text-gold" />
                Wrong answers earn 0 points, no matter how fast
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-sm text-gold">
              DIFFICULTY BREAKDOWN
            </h3>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <span className="rounded-md border border-pitch-bright/40 bg-pitch-bright/10 px-3 py-1 text-pitch-bright">
                Easy: {difficultyCounts.EASY ?? 0}
              </span>
              <span className="rounded-md border border-gold/40 bg-gold/10 px-3 py-1 text-gold">
                Medium: {difficultyCounts.MEDIUM ?? 0}
              </span>
              <span className="rounded-md border border-ember/40 bg-ember/10 px-3 py-1 text-ember">
                Hard: {difficultyCounts.HARD ?? 0}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <ArenaAction
              status={status}
              elapsedSeconds={elapsedSeconds}
              onSearch={handleSearch}
              onCancel={cancel}
              onDismiss={reset}
            />
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>,
    document.body,
  );
}

function formatElapsed(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * The "Enter the Arena" button and everything it turns into — the button is
 * replaced in place by the live search, then by whatever the search came to.
 */
function ArenaAction({
  status,
  elapsedSeconds,
  onSearch,
  onCancel,
  onDismiss,
}: {
  status: Exclude<QueueStatus, { phase: "matched" }>;
  elapsedSeconds: number;
  onSearch: () => void;
  onCancel: () => void;
  onDismiss: () => void;
}) {
  if (status.phase === "searching") {
    return (
      <div className="animate-arena-rise rounded-md border border-gold/40 bg-hero-dark/40 p-4 text-center">
        <div className="flex items-center justify-center gap-2.5 text-gold">
          <Search className="h-4 w-4 animate-pulse" />
          <span className="font-display text-glow text-sm tracking-wide">
            FINDING AN OPPONENT
          </span>
        </div>
        <p
          key={elapsedSeconds}
          className="font-display text-glow animate-arena-tick mt-2 text-3xl text-gold tabular-nums"
        >
          {formatElapsed(elapsedSeconds)}
        </p>
        <button
          type="button"
          onClick={onCancel}
          className="btn-game font-display mt-4 w-full cursor-pointer rounded-md border border-ember/50 bg-ember/10 py-2.5 text-sm tracking-wide text-ember transition hover:border-ember hover:bg-ember/20"
        >
          <span className="relative z-10">CANCEL SEARCH</span>
        </button>
      </div>
    );
  }

  if (status.phase !== "idle") {
    const message =
      status.phase === "timed-out"
        ? "No opponent found — want to try again?"
        : status.phase === "already-engaged"
          ? `You're already in the arena on ${status.packTitle}.`
          : status.message;

    return (
      <div className="animate-arena-rise rounded-md border border-ember/40 bg-ember/10 p-4 text-center">
        <p className="text-sm text-foreground/80">{message}</p>
        <button
          type="button"
          onClick={status.phase === "timed-out" ? onSearch : onDismiss}
          className="font-display mt-3 cursor-pointer text-sm text-gold underline-offset-4 transition hover:underline"
        >
          {status.phase === "timed-out" ? "SEARCH AGAIN" : "OK"}
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onSearch}
      className="btn-game btn-gold font-display w-full cursor-pointer rounded-md py-3 text-lg text-foreground"
    >
      <span className="text-glow relative z-10">ENTER THE ARENA</span>
    </button>
  );
}
