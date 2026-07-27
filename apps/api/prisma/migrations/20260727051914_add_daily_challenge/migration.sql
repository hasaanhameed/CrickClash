-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastChallengeDate" DATE,
ADD COLUMN     "streak" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "DailyChallengeAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dailyChallengeId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "questionIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallengeAttempt_userId_dailyChallengeId_key" ON "DailyChallengeAttempt"("userId", "dailyChallengeId");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_date_key" ON "DailyChallenge"("date");

-- AddForeignKey
ALTER TABLE "DailyChallengeAttempt" ADD CONSTRAINT "DailyChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallengeAttempt" ADD CONSTRAINT "DailyChallengeAttempt_dailyChallengeId_fkey" FOREIGN KEY ("dailyChallengeId") REFERENCES "DailyChallenge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
