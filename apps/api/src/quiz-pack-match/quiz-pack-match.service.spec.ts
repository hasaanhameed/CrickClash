import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { QuizPackMatchService } from './quiz-pack-match.service';
import { PrismaService } from '../prisma/prisma.service';
import { cleanDatabase } from '../../test/prisma-test.util';

describe('QuizPackMatchService', () => {
  let app: TestingModule;
  let service: QuizPackMatchService;
  let prisma: PrismaService;

  // The queue lives in memory on the service instance, so each test needs a
  // fresh one — truncating the database alone would leave queue state behind.
  beforeEach(async () => {
    app = await Test.createTestingModule({
      providers: [QuizPackMatchService, PrismaService],
    }).compile();

    await app.init();

    service = app.get(QuizPackMatchService);
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
    await app.close();
  });

  let uniqueCounter = 0;
  function unique(prefix: string) {
    uniqueCounter += 1;
    return `${prefix}-${Date.now()}-${uniqueCounter}`;
  }

  async function seedPack() {
    return prisma.quizPack.create({
      data: {
        slug: unique('pack'),
        title: 'Test Pack',
        description: 'Test',
      },
    });
  }

  async function seedUser() {
    return prisma.user.create({
      data: { username: unique('user'), password: 'hashed-password' },
    });
  }

  it('queues the first player with no match created', async () => {
    const pack = await seedPack();
    const alice = await seedUser();

    const result = await service.joinQueue(alice.id, pack.slug);

    expect(result.status).toBe('queued');
    expect(await prisma.quizPackMatch.count()).toBe(0);
  });

  it('pairs the second player into a persisted in-progress match', async () => {
    const pack = await seedPack();
    const alice = await seedUser();
    const bob = await seedUser();

    await service.joinQueue(alice.id, pack.slug);
    const result = await service.joinQueue(bob.id, pack.slug);

    expect(result.status).toBe('matched');
    if (result.status !== 'matched') return;

    expect(result.match).toMatchObject({
      quizPackId: pack.id,
      // FIFO — Alice waited longer, so she takes the player1 slot
      player1Id: alice.id,
      player2Id: bob.id,
      player1Score: 0,
      player2Score: 0,
      winnerId: null,
      status: 'IN_PROGRESS',
    });

    const persisted = await prisma.quizPackMatch.findUniqueOrThrow({
      where: { id: result.match.id },
    });
    expect(persisted.player1Id).toBe(alice.id);
    expect(persisted.player2Id).toBe(bob.id);
  });

  it('pairs players in arrival order across successive matches', async () => {
    const pack = await seedPack();
    const [alice, bob, carol, dave] = [
      await seedUser(),
      await seedUser(),
      await seedUser(),
      await seedUser(),
    ];

    await service.joinQueue(alice.id, pack.slug);
    const firstMatch = await service.joinQueue(bob.id, pack.slug);
    await service.joinQueue(carol.id, pack.slug);
    const secondMatch = await service.joinQueue(dave.id, pack.slug);

    expect(firstMatch.status).toBe('matched');
    expect(secondMatch.status).toBe('matched');
    if (firstMatch.status !== 'matched' || secondMatch.status !== 'matched') {
      return;
    }

    expect([firstMatch.match.player1Id, firstMatch.match.player2Id]).toEqual([
      alice.id,
      bob.id,
    ]);
    expect([secondMatch.match.player1Id, secondMatch.match.player2Id]).toEqual([
      carol.id,
      dave.id,
    ]);
    expect(await prisma.quizPackMatch.count()).toBe(2);
  });

  it('keeps queues separate per pack', async () => {
    const packA = await seedPack();
    const packB = await seedPack();
    const alice = await seedUser();
    const bob = await seedUser();

    const first = await service.joinQueue(alice.id, packA.slug);
    const second = await service.joinQueue(bob.id, packB.slug);

    expect(first.status).toBe('queued');
    expect(second.status).toBe('queued');
    expect(await prisma.quizPackMatch.count()).toBe(0);
  });

  it('never pairs a player against themselves', async () => {
    const pack = await seedPack();
    const alice = await seedUser();

    await service.joinQueue(alice.id, pack.slug);
    const result = await service.joinQueue(alice.id, pack.slug);

    expect(result.status).toBe('queued');
    expect(await prisma.quizPackMatch.count()).toBe(0);
  });

  it('leaves the queue empty after cancelling, so the next player waits', async () => {
    const pack = await seedPack();
    const alice = await seedUser();
    const bob = await seedUser();

    await service.joinQueue(alice.id, pack.slug);
    service.leaveQueue(alice.id);
    const result = await service.joinQueue(bob.id, pack.slug);

    expect(result.status).toBe('queued');
    expect(await prisma.quizPackMatch.count()).toBe(0);
  });

  it('rejects an unknown pack slug', async () => {
    const alice = await seedUser();

    await expect(service.joinQueue(alice.id, 'no-such-pack')).rejects.toThrow(
      NotFoundException,
    );
  });
});
