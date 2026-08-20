-- CreateEnum
CREATE TYPE "QuizPackMatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FORFEITED', 'ABANDONED');

-- CreateTable
CREATE TABLE "QuizPackMatch" (
    "id" TEXT NOT NULL,
    "quizPackId" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player2Id" TEXT NOT NULL,
    "player1Score" INTEGER NOT NULL DEFAULT 0,
    "player2Score" INTEGER NOT NULL DEFAULT 0,
    "winnerId" TEXT,
    "status" "QuizPackMatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuizPackMatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizPackMatch" ADD CONSTRAINT "QuizPackMatch_quizPackId_fkey" FOREIGN KEY ("quizPackId") REFERENCES "QuizPack"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizPackMatch" ADD CONSTRAINT "QuizPackMatch_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizPackMatch" ADD CONSTRAINT "QuizPackMatch_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
