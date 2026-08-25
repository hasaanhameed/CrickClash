"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Swords } from "lucide-react";
import type { MatchSummary } from "../../types/quizPackMatch";

const COUNTDOWN_SECONDS = 5;

/**
 * The beat between pairing and playing: shows who you drew, then counts down
 * into the match so nobody is dropped into question one unprepared.
 */
export default function MatchFoundCard({
  match,
  packImage,
  onCountdownEnd,
}: {
  match: MatchSummary;
  packImage: string;
  onCountdownEnd: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);

  useEffect(() => {
    if (secondsLeft === 0) {
      onCountdownEnd();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, onCountdownEnd]);

  const [player1, player2] = match.players;

  return (
    <div className="animate-arena-rise overflow-hidden rounded-xl border-2 border-gold/50 shadow-[0_0_50px_rgba(232,181,58,0.3)]">
      <div className="relative h-40">
        <Image src={packImage} alt="" fill className="object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/30 to-transparent" />
      </div>

      <div className="bg-surface-raised/95 px-6 pt-2 pb-6 text-center">
        <div className="animate-arena-slam flex items-center justify-center gap-3">
          <Swords className="h-7 w-7 text-gold" />
          <h2 className="font-display text-glow text-3xl tracking-wide text-gold">
            MATCH FOUND
          </h2>
        </div>

        <div className="animate-arena-rise mt-5 flex items-center justify-center gap-4 [animation-delay:0.15s]">
          <span className="font-display max-w-[9rem] truncate text-lg text-foreground">
            {player1.username}
          </span>
          <span className="font-display text-glow text-xl text-ember">VS</span>
          <span className="font-display max-w-[9rem] truncate text-lg text-foreground">
            {player2.username}
          </span>
        </div>

        <p className="mt-6 text-xs tracking-widest text-foreground/50 uppercase">
          Starting in
        </p>
        <p
          key={secondsLeft}
          className="font-display text-glow animate-arena-tick text-6xl text-gold tabular-nums"
        >
          {secondsLeft}
        </p>
      </div>
    </div>
  );
}
