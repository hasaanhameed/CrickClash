import Image from "next/image";
import Link from "next/link";
import { Flame, Swords } from "lucide-react";
import AuthButtons from "../components/auth/AuthButtons";
import ScrollLink from "../components/ScrollLink";
import { getQuizPacks } from "../services/quizPack.service";

// Purely visual — backend doesn't (and shouldn't) store card artwork paths
const packImages: Record<string, string> = {
  "90s-legends": "/images/90s-legends.png",
  "world-cup-nights": "/images/worldcup.png",
  "psl-trivia": "/images/psl.png",
  "pak-india-rivalry": "/images/pakvsindia.png",
  "captains-corner": "/images/captains.png",
  "record-breakers": "/images/records.png",
};

export default async function Home() {
  const quizPacks = await getQuizPacks();

  return (
    <main className="flex-1">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <nav className="flex w-full items-center justify-between px-8 py-6">
          <Link
            href="/"
            className="font-display flex items-center gap-1 text-4xl text-foreground"
          >
            <Image
              src="/images/logo.png"
              alt=""
              width={72}
              height={72}
            />
            CRICK<span className="text-gold">CLASH</span>
          </Link>

          <div className="hidden items-center gap-10 text-lg font-medium text-foreground/80 md:flex">
            <ScrollLink targetId="quizzes" className="transition hover:text-gold">
              Quizzes
            </ScrollLink>
            <ScrollLink targetId="quizzes" className="transition hover:text-gold">
              Game Modes
            </ScrollLink>
            <Link href="/leaderboard" className="transition hover:text-gold">
              Leaderboard
            </Link>
          </div>

          <AuthButtons />
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="relative flex min-h-[64vh] items-center overflow-hidden bg-hero-dark">
        <Image
          src="/images/stadium.png"
          alt="Cricket stadium under floodlights"
          fill
          priority
          className="object-cover"
        />
        {/* dark overlay so text pops */}
        <div className="absolute inset-0 bg-gradient-to-r from-hero-dark via-hero-dark/80 to-hero-dark/30" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-hero-dark to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20">
          <div className="max-w-xl">
            <h1 className="font-display text-glow text-6xl leading-tight text-foreground sm:text-7xl lg:text-8xl">
              CRICK<span className="text-gold">CLASH</span>
            </h1>
            <p className="mt-5 max-w-md text-xl text-foreground/80">
              Every legend. Every moment. Every record.
              <span className="text-gold"> Prove you were watching.</span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <ScrollLink
                targetId="modes"
                className="btn-game btn-gold font-display rounded-md px-10 py-4 text-2xl text-foreground"
              >
                <span className="text-glow relative z-10">PLAY NOW</span>
              </ScrollLink>
            </div>
          </div>
        </div>

        {/* Mascot — anchored to the bottom edge, pulled in closer to the text */}
        <div className="pointer-events-none absolute inset-0 z-[5] hidden lg:flex">
          <div className="mx-auto flex w-full max-w-7xl items-end justify-end px-6">
            <div className="relative h-[68vh] w-[38rem] max-w-[46vw]">
              {/* warm gold ambient glow behind the mascot */}
              <div className="absolute inset-x-0 bottom-0 top-1/4 rounded-full bg-gold/30 blur-[100px]" />
              <Image
                src="/images/mascot.png"
                alt="CrickClash batsman mascot"
                fill
                className="relative object-contain object-bottom drop-shadow-[0_0_90px_rgba(232,181,58,0.55)]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Game Modes ──────────────────────────────────── */}
      <section id="modes" className="relative mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl text-ink sm:text-4xl">
          PICK YOUR <span className="text-gold-deep">BATTLE</span>
        </h2>
        <p className="mt-2 text-ink-muted">
          Two ways to play. One leaderboard. Zero excuses.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Quick Match */}
          <Link
            href="/play/quick-match"
            className="card-game group relative overflow-hidden rounded-2xl border-2 border-pitch/60 bg-surface hover:border-gold/70"
          >
            <div className="relative h-64">
              <Image
                src="/images/face-off.png"
                alt="Two batsmen facing off"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>
            <div className="relative -mt-10 p-6">
              <span className="mb-2 inline-block rounded-md bg-ember/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-ember">
                Live · 1v1
              </span>
              <h3 className="font-display text-2xl text-foreground">
                QUICK MATCH
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                Get paired with another fan in seconds. Same questions, same
                clock — fastest correct answer takes the points.
              </p>
              <span className="mt-4 inline-block font-display text-sm text-gold">
                FIND OPPONENT →
              </span>
            </div>
          </Link>

          {/* Daily Challenge */}
          <Link
            href="/play/daily"
            className="card-game group relative overflow-hidden rounded-2xl border-2 border-pitch/60 bg-surface hover:border-gold/70"
          >
            <div className="relative h-64">
              <Image
                src="/images/ball.png"
                alt="Cricket ball on fire"
                fill
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
            </div>
            <div className="relative -mt-10 p-6">
              <span className="mb-2 inline-block rounded-md bg-gold/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-gold">
                Daily · Solo
              </span>
              <h3 className="font-display text-2xl text-foreground">
                DAILY CHALLENGE
              </h3>
              <p className="mt-2 text-sm text-foreground/70">
                Five questions. One shot. Same set for everyone — keep the
                streak alive and climb today&apos;s global board.
              </p>
              <span className="mt-4 inline-block font-display text-sm text-gold">
                PLAY TODAY&apos;S SET →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Quiz Packs ──────────────────────────────────── */}
      <section id="quizzes" className="clip-slant-reverse relative py-20">
        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl text-ink sm:text-4xl">
            QUIZ <span className="text-gold-deep">PACKS</span>
          </h2>
          <p className="mt-2 text-ink-muted">
            Curated question banks — pick an era, pick a battle.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizPacks.map((pack) => (
              <Link
                key={pack.id}
                href={`/quiz/${pack.slug}`}
                className="card-game group relative overflow-hidden rounded-xl border border-foreground/10 bg-surface-raised hover:border-gold/60"
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="bg-hero-dark">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span className="font-display text-glow flex items-center gap-1 text-2xl text-foreground">
              <Image src="/images/logo.png" alt="" width={52} height={52} />
              CRICK<span className="text-gold">CLASH</span>
            </span>
            <span className="text-xs text-foreground/40">
              © {new Date().getFullYear()} CrickClash. Not affiliated with the
              PCB or ICC.
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-foreground/60">
            Real-time Pakistan cricket trivia battles. Built for the fans who
            never miss a ball.
          </p>
        </div>
      </footer>
    </main>
  );
}
