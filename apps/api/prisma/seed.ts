import { Difficulty, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

interface SeedQuestion {
  difficulty: Difficulty;
  text: string;
  options: string[];
  correctAnswer: string;
}

interface SeedPack {
  slug: string;
  title: string;
  description: string;
  questions: SeedQuestion[];
}

const packs: SeedPack[] = [
  {
    slug: "90s-legends",
    title: "90s Legends",
    description: "Wasim, Waqar, Saeed Anwar — the golden generation.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "Which Pakistani fast bowler is nicknamed the 'Sultan of Swing'?",
        options: ["Wasim Akram", "Waqar Younis", "Imran Khan", "Shoaib Akhtar"],
        correctAnswer: "Wasim Akram",
      },
      {
        difficulty: Difficulty.HARD,
        text: "How many wickets did Wasim Akram take in his ODI career?",
        options: ["350", "414", "502", "469"],
        correctAnswer: "502",
      },
    ],
  },
  {
    slug: "world-cup-nights",
    title: "World Cup Nights",
    description: "From MCG '92 to the T20 thrillers. Relive every night.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "Who captained Pakistan to their 1992 Cricket World Cup victory?",
        options: ["Imran Khan", "Javed Miandad", "Wasim Akram", "Zaheer Abbas"],
        correctAnswer: "Imran Khan",
      },
      {
        difficulty: Difficulty.MEDIUM,
        text: "In which year did Pakistan first win the ICC T20 World Cup?",
        options: ["2007", "2009", "2012", "2016"],
        correctAnswer: "2009",
      },
    ],
  },
  {
    slug: "psl-trivia",
    title: "PSL Trivia",
    description: "Franchises, finals and last-over drama since 2016.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "In which year was the first edition of the Pakistan Super League held?",
        options: ["2015", "2016", "2017", "2018"],
        correctAnswer: "2016",
      },
      {
        difficulty: Difficulty.MEDIUM,
        text: "Which franchise won the inaugural PSL title in 2016?",
        options: [
          "Islamabad United",
          "Karachi Kings",
          "Lahore Qalandars",
          "Peshawar Zalmi",
        ],
        correctAnswer: "Islamabad United",
      },
    ],
  },
  {
    slug: "pak-india-rivalry",
    title: "The Rivalry",
    description: "Pakistan vs India — the matches that stopped time.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "Who hit the last-ball six off Chetan Sharma to win the 1986 Austral-Asia Cup final against India?",
        options: ["Javed Miandad", "Imran Khan", "Saleem Malik", "Ramiz Raja"],
        correctAnswer: "Javed Miandad",
      },
      {
        difficulty: Difficulty.MEDIUM,
        text: "In which city was Javed Miandad's famous last-ball six hit in 1986?",
        options: ["Dubai", "Sharjah", "Abu Dhabi", "Karachi"],
        correctAnswer: "Sharjah",
      },
    ],
  },
  {
    slug: "captains-corner",
    title: "Captains' Corner",
    description: "Imran to Babar — leaders, decisions, legacies.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "Who was Pakistan's captain during their 1992 World Cup triumph?",
        options: ["Imran Khan", "Javed Miandad", "Wasim Akram", "Saleem Malik"],
        correctAnswer: "Imran Khan",
      },
      {
        difficulty: Difficulty.MEDIUM,
        text: "Which Pakistani captain led the Test side to the ICC's number one ranking in 2016?",
        options: [
          "Misbah-ul-Haq",
          "Younis Khan",
          "Shahid Afridi",
          "Sarfaraz Ahmed",
        ],
        correctAnswer: "Misbah-ul-Haq",
      },
    ],
  },
  {
    slug: "record-breakers",
    title: "Record Breakers",
    description: "Fastest, highest, youngest — Pakistan's record books.",
    questions: [
      {
        difficulty: Difficulty.EASY,
        text: "Which Pakistani pacer holds the record for the fastest ball ever bowled in international cricket?",
        options: [
          "Shoaib Akhtar",
          "Wasim Akram",
          "Waqar Younis",
          "Mohammad Sami",
        ],
        correctAnswer: "Shoaib Akhtar",
      },
      {
        difficulty: Difficulty.MEDIUM,
        text: "What was the speed, in km/h, of Shoaib Akhtar's record-breaking delivery?",
        options: ["155.2", "158.4", "161.3", "164.0"],
        correctAnswer: "161.3",
      },
    ],
  },
];

async function main() {
  for (const { questions, ...packData } of packs) {
    const pack = await prisma.quizPack.upsert({
      where: { slug: packData.slug },
      update: packData,
      create: packData,
    });

    // Wipe and re-insert this pack's questions so the script is safely re-runnable
    await prisma.question.deleteMany({ where: { quizPackId: pack.id } });
    await prisma.question.createMany({
      data: questions.map((q) => ({ ...q, quizPackId: pack.id })),
    });

    console.log(`Seeded ${questions.length} questions for "${pack.title}"`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
