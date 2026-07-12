"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Flame, HelpCircle, X } from "lucide-react";
import { getQuizPackDetail } from "../../services/quizPack.service";
import { packImages } from "../../lib/packImages";
import type { QuizPack, QuizPackDetail } from "../../types/quizPack";

interface PackDetailModalProps {
  pack: QuizPack;
  onClose: () => void;
}

export default function PackDetailModal({
  pack,
  onClose,
}: PackDetailModalProps) {
  const [detail, setDetail] = useState<QuizPackDetail | null>(null);

  useEffect(() => {
    getQuizPackDetail(pack.slug).then(setDetail);
  }, [pack.slug]);

  const difficultyCounts = detail
    ? detail.questions.reduce<Record<string, number>>((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
        return acc;
      }, {})
    : null;

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
            className="absolute top-4 right-4 rounded-full bg-hero-dark/60 p-1.5 text-foreground/80 transition hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <h2 className="font-display text-glow text-2xl text-gold">
            {pack.title}
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            {pack.description}
          </p>

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
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              <li>• You get 30 seconds to answer each question.</li>
              <li>• Faster correct answers earn more points.</li>
              <li>
                • Harder questions are worth more — Easy: 10pts, Medium:
                20pts, Hard: 30pts.
              </li>
            </ul>
          </div>

          <div className="mt-4">
            <h3 className="font-display text-sm text-gold">
              DIFFICULTY BREAKDOWN
            </h3>
            {!difficultyCounts ? (
              <p className="mt-2 text-sm text-foreground/50">Loading...</p>
            ) : (
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
            )}
          </div>

          <button
            type="button"
            className="btn-game btn-gold font-display mt-6 w-full rounded-md py-3 text-lg text-foreground"
          >
            <span className="text-glow relative z-10">
              ENTER THE ARENA →
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
