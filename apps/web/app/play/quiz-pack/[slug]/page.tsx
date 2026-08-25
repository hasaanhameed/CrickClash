"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import AuthButtons from "../../../../components/auth/AuthButtons";
import MatchQuestionCard from "../../../../components/arena/MatchQuestionCard";
import { getQuizPackDetail } from "../../../../services/quizPack.service";
import { packImages } from "../../../../lib/packImages";
import { readActiveMatch } from "../../../../lib/activeMatch";
import type { QuizPackDetail } from "../../../../types/quizPack";
import type { MatchSummary } from "../../../../types/quizPackMatch";

export default function QuizPackMatchPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user, isLoadingUser } = useAuth();
  const [pack, setPack] = useState<QuizPackDetail | null>(null);
  const [match, setMatch] = useState<MatchSummary | null>(null);

  useEffect(() => {
    const active = readActiveMatch();
    getQuizPackDetail(slug).then((detail) => {
      setPack(detail);
      setMatch(active);
    });
  }, [slug]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Same floodlit-pitch backdrop as the Daily Challenge */}
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
        <AuthButtons hideLogout />
      </header>

      <div className="relative z-10 flex flex-1 items-start justify-center px-4 pt-3 pb-8">
        {isLoadingUser || (user && !pack) ? (
          <Loader2 className="h-10 w-10 animate-spin text-gold" />
        ) : !user || !pack || !match ? (
          <NoMatch />
        ) : (
          <MatchPreview
            pack={pack}
            match={match}
            currentUserId={user.userId}
          />
        )}
      </div>
    </main>
  );
}

function NoMatch() {
  return (
    <div className="w-full max-w-sm rounded-xl border-2 border-gold/40 bg-surface-raised p-8 text-center shadow-[0_0_40px_rgba(232,181,58,0.2)]">
      <h1 className="font-display text-glow text-2xl text-gold">
        NO ACTIVE MATCH
      </h1>
      <p className="mt-2 text-sm text-foreground/70">
        Head back and enter the arena from a quiz pack to get matched.
      </p>
      <Link
        href="/"
        className="btn-game btn-gold font-display mt-6 inline-block w-full cursor-pointer rounded-md py-3 text-lg text-foreground"
      >
        <span className="text-glow relative z-10">BACK TO PACKS</span>
      </Link>
    </div>
  );
}

/**
 * Design preview of the live question phase. The real match is server-driven
 * (issue #10) — until that lands this renders the first question with a local
 * countdown purely so the layout can be seen and tweaked.
 */
function MatchPreview({
  pack,
  match,
  currentUserId,
}: {
  pack: QuizPackDetail;
  match: MatchSummary;
  currentUserId: string;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(20);

  useEffect(() => {
    const id = setInterval(
      () => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(id);
  }, []);

  if (pack.questions.length === 0) return null;

  const you = match.players.find((p) => p.userId === currentUserId);
  const opponent = match.players.find((p) => p.userId !== currentUserId);

  return (
    <MatchQuestionCard
      question={pack.questions[0]}
      questionNumber={1}
      totalQuestions={pack.questions.length}
      packImage={packImages[pack.slug]}
      secondsLeft={secondsLeft}
      you={{
        username: you?.username ?? "You",
        score: 0,
        answered: selected !== null,
      }}
      opponent={{
        username: opponent?.username ?? "Opponent",
        score: 0,
        answered: false,
      }}
      selectedOption={selected}
      onSelect={setSelected}
      locked={secondsLeft === 0}
    />
  );
}
