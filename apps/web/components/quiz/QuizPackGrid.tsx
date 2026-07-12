"use client";

import { useState } from "react";
import Image from "next/image";
import { Flame, Swords } from "lucide-react";
import { packImages } from "../../lib/packImages";
import type { QuizPack } from "../../types/quizPack";
import PackDetailModal from "./PackDetailModal";

interface QuizPackGridProps {
  quizPacks: QuizPack[];
}

export default function QuizPackGrid({ quizPacks }: QuizPackGridProps) {
  const [selectedPack, setSelectedPack] = useState<QuizPack | null>(null);

  return (
    <>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {quizPacks.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setSelectedPack(pack)}
            className="card-game group relative cursor-pointer overflow-hidden rounded-xl border border-foreground/10 bg-surface-raised text-left hover:border-gold/60"
          >
            <div className="relative h-40 overflow-hidden">
              <Image
                src={packImages[pack.slug]}
                alt={pack.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/10 to-transparent" />
            </div>
            <div className="relative p-5">
              <h3 className="font-display text-glow text-2xl text-gold">
                {pack.title}
              </h3>
              <p className="mt-2 min-h-10 text-sm text-foreground/65">
                {pack.description}
              </p>
              <div className="mt-4 flex items-center gap-5 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Swords className="h-4 w-4 text-gold" />
                  {pack.questionCount} questions
                </span>
                <span className="flex items-center gap-1.5">
                  <Flame className="h-4 w-4 text-gold" />
                  {pack.playCount.toLocaleString()} plays
                </span>
              </div>
              <span className="font-display absolute right-5 bottom-5 text-sm text-gold opacity-0 transition group-hover:opacity-100">
                EXPLORE PACK →
              </span>
            </div>
          </button>
        ))}
      </div>

      {selectedPack && (
        <PackDetailModal
          pack={selectedPack}
          onClose={() => setSelectedPack(null)}
        />
      )}
    </>
  );
}
