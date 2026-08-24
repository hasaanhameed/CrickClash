import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DailyChallengeService } from './daily-challenge.service';
import { PrismaService } from '../prisma/prisma.service';
import { cleanDatabase } from '../../test/prisma-test.util';

describe('DailyChallengeService', () => {
  let app: TestingModule;
  let service: DailyChallengeService;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      providers: [DailyChallengeService, PrismaService],
    }).compile();

    await app.init();

    service = app.get(DailyChallengeService);
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await app.close();
  });

  async function seedPackWithQuestions() {
    const pack = await prisma.quizPack.create({
      data: {
        slug: `pack-${Date.now()}`,
        title: 'Test Pack',
        description: 'Test',
      },
    });

    return Promise.all(
      Array.from({ length: 5 }).map((_, i) =>
        prisma.question.create({
          data: {
            quizPackId: pack.id,
            difficulty: 'EASY',
            text: `Question ${i}`,
            options: ['A', 'B'],
            correctAnswer: 'A',
          },
        }),
      ),
    );
  }

  async function seedUser() {
    return prisma.user.create({
      data: {
        username: `user-${Date.now()}-${Math.random()}`,
        password: 'hashed-password',
      },
    });
  }

  it("creates today's challenge lazily and strips correctAnswer from returned questions", async () => {
    await seedPackWithQuestions();
    const user = await seedUser();

    const result = await service.getToday(user.id);

    expect(result.alreadyAttempted).toBe(false);
    if (!result.alreadyAttempted) {
      expect(result.questions).toHaveLength(5);
      for (const q of result.questions) {
        expect(q).not.toHaveProperty('correctAnswer');
      }
    }
  });

  it('scores a submission correctly and updates streak', async () => {
    const questions = await seedPackWithQuestions();
    const user = await seedUser();

    await service.getToday(user.id);

    const answers: Record<string, string> = {};
    for (const q of questions) {
      answers[q.id] = q.correctAnswer;
    }

    const result = await service.submit(user.id, answers);

    expect(result.correctCount).toBe(5);
    expect(result.score).toBe(50);
    expect(result.streak).toBe(1);
  });

  it('rejects a second submission for the same day', async () => {
    await seedPackWithQuestions();
    const user = await seedUser();
    await service.getToday(user.id);
    await service.submit(user.id, {});

    await expect(service.submit(user.id, {})).rejects.toThrow(
      ConflictException,
    );
  });
});
