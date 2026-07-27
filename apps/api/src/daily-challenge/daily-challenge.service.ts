import { ConflictException, Injectable } from '@nestjs/common';
import { Difficulty, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { computeNewStreak, pickDailyQuestionIds } from './daily-challenge.util';

const QUESTIONS_PER_CHALLENGE = 5;

const POINTS_BY_DIFFICULTY: Record<Difficulty, number> = {
  EASY: 10,
  MEDIUM: 20,
  HARD: 30,
};

function startOfTodayUtc(): Date {
  return new Date(new Date().toISOString().slice(0, 10));
}

@Injectable()
export class DailyChallengeService {
  constructor(private readonly prisma: PrismaService) {}

  // Looks up today's challenge, creating it on the first request of the day.
  private async ensureTodayChallenge() {
    const today = startOfTodayUtc();

    const existing = await this.prisma.dailyChallenge.findUnique({
      where: { date: today },
    });
    if (existing) return existing;

    // orderBy is required here: without a fixed order, Postgres could
    // hand back rows in a different order on different requests, which
    // would break the "same shuffle for everyone" guarantee.
    const allQuestions = await this.prisma.question.findMany({
      select: { id: true },
      orderBy: { id: 'asc' },
    });
    const questionIds = pickDailyQuestionIds(
      allQuestions.map((q) => q.id),
      today,
      QUESTIONS_PER_CHALLENGE,
    );

    try {
      return await this.prisma.dailyChallenge.create({
        data: { date: today, questionIds },
      });
    } catch (error) {
      // Two users' first request of the day can race to create the same
      // row. The `date` unique constraint blocks the loser — just re-read
      // what the winner created instead of failing the request.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return this.prisma.dailyChallenge.findUniqueOrThrow({
          where: { date: today },
        });
      }
      throw error;
    }
  }

  async getToday(userId: string) {
    const challenge = await this.ensureTodayChallenge();

    const attempt = await this.prisma.dailyChallengeAttempt.findUnique({
      where: {
        userId_dailyChallengeId: { userId, dailyChallengeId: challenge.id },
      },
    });

    if (attempt) {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      return {
        date: challenge.date,
        alreadyAttempted: true as const,
        score: attempt.score,
        streak: user.streak,
        totalQuestions: challenge.questionIds.length,
      };
    }

    const questions = await this.prisma.question.findMany({
      where: { id: { in: challenge.questionIds } },
    });
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    // `id: { in: [...] }` doesn't preserve array order, so re-sort by
    // the challenge's own question order instead of the query's order.
    const orderedQuestions = challenge.questionIds.map((id) => {
      const { correctAnswer, ...question } = questionsById.get(id)!;
      return question;
    });

    return {
      date: challenge.date,
      alreadyAttempted: false as const,
      questions: orderedQuestions,
    };
  }

  async submit(userId: string, answers: Record<string, string>) {
    const challenge = await this.ensureTodayChallenge();

    const existing = await this.prisma.dailyChallengeAttempt.findUnique({
      where: {
        userId_dailyChallengeId: { userId, dailyChallengeId: challenge.id },
      },
    });
    if (existing) {
      throw new ConflictException("You've already completed today's challenge");
    }

    const questions = await this.prisma.question.findMany({
      where: { id: { in: challenge.questionIds } },
    });
    const questionsById = new Map(questions.map((q) => [q.id, q]));

    let score = 0;
    let correctCount = 0;
    const results = challenge.questionIds.map((id) => {
      const question = questionsById.get(id)!;
      const correct = answers[id] === question.correctAnswer;
      if (correct) {
        score += POINTS_BY_DIFFICULTY[question.difficulty];
        correctCount++;
      }
      return { questionId: id, correct, correctAnswer: question.correctAnswer };
    });

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    const streak = computeNewStreak(user.lastChallengeDate, challenge.date, user.streak);

    await this.prisma.$transaction([
      this.prisma.dailyChallengeAttempt.create({
        data: { userId, dailyChallengeId: challenge.id, score },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { streak, lastChallengeDate: challenge.date },
      }),
    ]);

    return {
      score,
      correctCount,
      totalQuestions: challenge.questionIds.length,
      streak,
      results,
    };
  }
}
