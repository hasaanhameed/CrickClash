import Image from "next/image";
import Link from "next/link";

// Mock data — will come from the API later
const quizPacks = [
  {
    id: "90s-legends",
    title: "90s Legends",
    description: "Wasim, Waqar, Saeed Anwar — the golden generation.",
    difficulty: "Medium",
    questions: 20,
    plays: 4821,
    accent: "from-emerald-800/80",
  },
  {
    id: "world-cup-nights",
    title: "World Cup Nights",
    description: "From MCG '92 to the T20 thrillers. Relive every night.",
    difficulty: "Hard",
    questions: 25,
    plays: 6310,
    accent: "from-yellow-800/70",
  },
  {
    id: "psl-trivia",
    title: "PSL Trivia",
    description: "Franchises, finals and last-over drama since 2016.",
    difficulty: "Easy",
    questions: 15,
    plays: 9204,
    accent: "from-teal-800/80",
  },
  {
    id: "pak-india-rivalry",
    title: "The Rivalry",
    description: "Pakistan vs India — the matches that stopped time.",
    difficulty: "Hard",
    questions: 20,
    plays: 11876,
    accent: "from-orange-900/70",
  },
  {
    id: "captains-corner",
    title: "Captains' Corner",
    description: "Imran to Babar — leaders, decisions, legacies.",
    difficulty: "Medium",
    questions: 18,
    plays: 3542,
    accent: "from-lime-900/80",
  },
  {
    id: "record-breakers",
    title: "Record Breakers",
    description: "Fastest, highest, youngest — Pakistan's record books.",
    difficulty: "Easy",
    questions: 15,
    plays: 5127,
    accent: "from-amber-900/70",
  },
];

const difficultyStyles: Record<string, string> = {
  Easy: "bg-pitch-bright/20 text-pitch-bright border-pitch-bright/40",
  Medium: "bg-gold/15 text-gold border-gold/40",
  Hard: "bg-ember/15 text-ember border-ember/40",
};

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="absolute top-0 left-0 right-0 z-30">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-display text-2xl text-foreground">
            CRICK<span className="text-gold">CLASH</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-foreground/80 md:flex">
            <Link href="#quizzes" className="transition hover:text-gold">
              Quizzes
            </Link>
            <Link href="#modes" className="transition hover:text-gold">
              Game Modes
            </Link>
            <Link href="/leaderboard" className="transition hover:text-gold">
              Leaderboard
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="btn-game rounded-lg px-4 py-2 text-sm font-semibold text-foreground/90 hover:text-gold"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="btn-game rounded-lg bg-gold px-4 py-2 text-sm font-bold text-background shadow-[0_4px_0_var(--gold-deep)]"
            >
              Sign up
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="clip-slant relative flex min-h-[92vh] items-center overflow-hidden">
        <Image
          src="/images/stadium.png"
          alt="Cricket stadium under floodlights"
          fill
          priority
          className="object-cover"
        />
        {/* dark overlay so text pops */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-8 px-6 pt-24 lg:grid-cols-2">
          <div>
            <p className="mb-3 inline-block rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-gold">
              Pakistan Cricket Quiz Arena
            </p>
            <h1 className="font-display text-glow text-5xl leading-tight text-foreground sm:text-6xl lg:text-7xl">
              CRICK<span className="text-gold">CLASH</span>
            </h1>
            <p className="mt-4 max-w-md text-lg text-foreground/80">
              Every legend. Every final. Every record.
              <span className="text-gold"> Prove you were watching.</span>
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="btn-game rounded-xl bg-gold px-8 py-4 font-display text-lg text-background shadow-[0_6px_0_var(--gold-deep)]"
              >
                PLAY NOW
              </Link>
              <Link
                href="/play?guest=true"
                className="btn-game rounded-xl border-2 border-foreground/25 bg-surface/60 px-8 py-4 font-display text-lg text-foreground backdrop-blur-sm hover:border-gold/60"
              >
                PLAY AS GUEST
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted">
              No account needed to try a match — sign up to keep your stats.
            </p>
          </div>

          {/* Mascot */}
          <div className="relative hidden h-[420px] lg:block">
            <Image
              src="/images/mascot.png"
              alt="CrickClash batsman mascot"
              fill
              className="object-contain object-bottom drop-shadow-[0_0_45px_rgba(232,181,58,0.25)]"
            />
          </div>
        </div>
      </section>

      {/* ── Game Modes ──────────────────────────────────── */}
      <section id="modes" className="relative mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-3xl text-foreground sm:text-4xl">
          PICK YOUR <span className="text-gold">BATTLE</span>
        </h2>
        <p className="mt-2 text-muted">
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
                className="object-cover object-top transition duration-300 group-hover:scale-105"
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
                className="object-cover object-center transition duration-300 group-hover:scale-105"
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
        {/* grass texture backdrop */}
        <Image
          src="/images/grass.png"
          alt=""
          fill
          className="object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-background/70" />

        <div className="relative mx-auto max-w-7xl px-6">
          <h2 className="font-display text-3xl text-foreground sm:text-4xl">
            QUIZ <span className="text-gold">PACKS</span>
          </h2>
          <p className="mt-2 text-muted">
            Curated question banks — pick an era, pick a battle.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {quizPacks.map((pack) => (
              <Link
                key={pack.id}
                href={`/quiz/${pack.id}`}
                className="card-game group relative overflow-hidden rounded-xl border border-foreground/10 bg-surface-raised p-5 hover:border-gold/60"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pack.accent} to-transparent opacity-40`}
                />
                <div className="relative">
                  <div className="flex items-start justify-between">
                    <h3 className="font-display text-lg text-foreground">
                      {pack.title}
                    </h3>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${difficultyStyles[pack.difficulty]}`}
                    >
                      {pack.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm text-foreground/65">
                    {pack.description}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-muted">
                    <span>🏏 {pack.questions} questions</span>
                    <span>🔥 {pack.plays.toLocaleString()} plays</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-muted sm:flex-row">
        <span className="font-display text-foreground/70">
          CRICK<span className="text-gold">CLASH</span>
        </span>
        <span>Built for the fans. Har match yaad hai. 🏏</span>
      </footer>
    </main>
  );
}
