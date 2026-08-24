import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import {
  QUEUE_TIMEOUT_MS,
  QuizPackMatchService,
} from './quiz-pack-match.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClockService } from '../clock/clock.service';
import { cleanDatabase } from '../../test/prisma-test.util';

describe('QuizPackMatchService', () => {
  let app: TestingModule;
  let service: QuizPackMatchService;
  let prisma: PrismaService;

  // The queue lives in memory on the service instance, so each test needs a
  // fresh one — truncating the database alone would leave queue state behind.
  beforeEach(async () => {
    app = await Test.createTestingModule({
      providers: [QuizPackMatchService, PrismaService, ClockService],
    }).compile();

    await app.init();

    service = app.get(QuizPackMatchService);
    prisma = app.get(PrismaService);
  });

  afterEach(async () => {
    jest.useRealTimers();
    await cleanDatabase(prisma);
    await app.close();
  });

  // Fake only the timers ClockService actually uses. Faking everything (Date,
  // nextTick, setInterval…) interferes with the Postgres driver, which needs
  // real ones to resolve queries while a test is mid-flight.
  function useQueueFakeTimers() {
    jest.useFakeTimers({
      doNotFake: [
        'Date',
        'hrtime',
        'nextTick',
        'performance',
        'queueMicrotask',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'requestIdleCallback',
        'cancelIdleCallback',
        'setImmediate',
        'clearImmediate',
        'setInterval',
        'clearInterval',
      ],
    });
  }

  let uniqueCounter = 0;
  function unique(prefix: string) {
    uniqueCounter += 1;
    return `${prefix}-${Date.now()}-${uniqueCounter}`;
  }

  async function seedPack(title = 'Test Pack') {
    return prisma.quizPack.create({
      data: { slug: unique('pack'), title, description: 'Test' },
    });
  }

  async function seedUser() {
    return prisma.user.create({
      data: { username: unique('user'), password: 'hashed-password' },
    });
  }

  const noop = () => {};

  describe('pairing', () => {
    it('queues the first player with no match created', async () => {
      const pack = await seedPack();
      const alice = await seedUser();

      const result = await service.joinQueue(alice.id, pack.slug, noop);

      expect(result.status).toBe('queued');
      expect(await prisma.quizPackMatch.count()).toBe(0);
    });

    it('pairs the second player into a persisted in-progress match', async () => {
      const pack = await seedPack('90s Legends');
      const alice = await seedUser();
      const bob = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      const result = await service.joinQueue(bob.id, pack.slug, noop);

      expect(result.status).toBe('matched');
      if (result.status !== 'matched') return;

      expect(result.match).toMatchObject({
        packSlug: pack.slug,
        packTitle: '90s Legends',
        // FIFO — Alice waited longer, so she is listed first
        players: [
          { userId: alice.id, username: alice.username },
          { userId: bob.id, username: bob.username },
        ],
      });

      const persisted = await prisma.quizPackMatch.findUniqueOrThrow({
        where: { id: result.match.matchId },
      });
      expect(persisted).toMatchObject({
        quizPackId: pack.id,
        player1Id: alice.id,
        player2Id: bob.id,
        player1Score: 0,
        player2Score: 0,
        winnerId: null,
        status: 'IN_PROGRESS',
      });
    });

    it('never exposes player password hashes in the match summary', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const bob = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      const result = await service.joinQueue(bob.id, pack.slug, noop);
      if (result.status !== 'matched') throw new Error('expected a match');

      expect(JSON.stringify(result.match)).not.toContain('hashed-password');
      for (const player of result.match.players) {
        expect(player).not.toHaveProperty('password');
      }
    });

    it('pairs players in arrival order across successive matches', async () => {
      const pack = await seedPack();
      const [alice, bob, carol, dave] = [
        await seedUser(),
        await seedUser(),
        await seedUser(),
        await seedUser(),
      ];

      await service.joinQueue(alice.id, pack.slug, noop);
      const firstMatch = await service.joinQueue(bob.id, pack.slug, noop);
      await service.joinQueue(carol.id, pack.slug, noop);
      const secondMatch = await service.joinQueue(dave.id, pack.slug, noop);

      expect(firstMatch.status).toBe('matched');
      expect(secondMatch.status).toBe('matched');
      if (firstMatch.status !== 'matched' || secondMatch.status !== 'matched') {
        return;
      }

      expect(firstMatch.match.players.map((p) => p.userId)).toEqual([
        alice.id,
        bob.id,
      ]);
      expect(secondMatch.match.players.map((p) => p.userId)).toEqual([
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

      const first = await service.joinQueue(alice.id, packA.slug, noop);
      const second = await service.joinQueue(bob.id, packB.slug, noop);

      expect(first.status).toBe('queued');
      expect(second.status).toBe('queued');
      expect(await prisma.quizPackMatch.count()).toBe(0);
    });

    it('leaves the queue empty after cancelling, so the next player waits', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const bob = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      service.leaveQueue(alice.id);
      const result = await service.joinQueue(bob.id, pack.slug, noop);

      expect(result.status).toBe('queued');
      expect(await prisma.quizPackMatch.count()).toBe(0);
    });

    it('rejects an unknown pack slug', async () => {
      const alice = await seedUser();

      await expect(
        service.joinQueue(alice.id, 'no-such-pack', noop),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('exclusivity', () => {
    it('blocks queuing for a second pack while already waiting, naming the first', async () => {
      const packA = await seedPack('90s Legends');
      const packB = await seedPack('PSL Trivia');
      const alice = await seedUser();

      await service.joinQueue(alice.id, packA.slug, noop);
      const result = await service.joinQueue(alice.id, packB.slug, noop);

      expect(result).toEqual({
        status: 'already-engaged',
        packSlug: packA.slug,
        packTitle: '90s Legends',
      });
      expect(await prisma.quizPackMatch.count()).toBe(0);
    });

    it('blocks re-queuing for the same pack, so a player never faces themselves', async () => {
      const pack = await seedPack();
      const alice = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      const result = await service.joinQueue(alice.id, pack.slug, noop);

      expect(result.status).toBe('already-engaged');
      expect(await prisma.quizPackMatch.count()).toBe(0);
    });

    it('blocks queuing while already in an in-progress match', async () => {
      const pack = await seedPack('World Cup Nights');
      const otherPack = await seedPack('The Rivalry');
      const alice = await seedUser();
      const bob = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      await service.joinQueue(bob.id, pack.slug, noop);

      // Both players are now mid-match, so neither can start another.
      for (const player of [alice, bob]) {
        const result = await service.joinQueue(player.id, otherPack.slug, noop);
        expect(result).toEqual({
          status: 'already-engaged',
          packSlug: pack.slug,
          packTitle: 'World Cup Nights',
        });
      }
    });

    it('allows queuing again once the previous match is no longer in progress', async () => {
      const pack = await seedPack();
      const otherPack = await seedPack();
      const alice = await seedUser();
      const bob = await seedUser();

      await service.joinQueue(alice.id, pack.slug, noop);
      const matched = await service.joinQueue(bob.id, pack.slug, noop);
      if (matched.status !== 'matched') throw new Error('expected a match');

      await prisma.quizPackMatch.update({
        where: { id: matched.match.matchId },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      const result = await service.joinQueue(alice.id, otherPack.slug, noop);
      expect(result.status).toBe('queued');
    });
  });

  describe('queue timeout', () => {
    it('drops a player from the queue and notifies them once the wait expires', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const bob = await seedUser();
      const onTimeout = jest.fn();

      useQueueFakeTimers();
      await service.joinQueue(alice.id, pack.slug, onTimeout);
      jest.advanceTimersByTime(QUEUE_TIMEOUT_MS);

      expect(onTimeout).toHaveBeenCalledTimes(1);

      // Alice is gone from the queue, so Bob waits rather than matching her.
      const result = await service.joinQueue(bob.id, pack.slug, noop);
      expect(result.status).toBe('queued');
    });

    it('does not notify before the wait has expired', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const onTimeout = jest.fn();

      useQueueFakeTimers();
      await service.joinQueue(alice.id, pack.slug, onTimeout);
      jest.advanceTimersByTime(QUEUE_TIMEOUT_MS - 1);

      expect(onTimeout).not.toHaveBeenCalled();
    });

    it('cancels the timeout once the player is matched', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const bob = await seedUser();
      const onTimeout = jest.fn();

      useQueueFakeTimers();
      await service.joinQueue(alice.id, pack.slug, onTimeout);
      await service.joinQueue(bob.id, pack.slug, noop);
      jest.advanceTimersByTime(QUEUE_TIMEOUT_MS * 2);

      expect(onTimeout).not.toHaveBeenCalled();
    });

    it('cancels the timeout when the player cancels the search', async () => {
      const pack = await seedPack();
      const alice = await seedUser();
      const onTimeout = jest.fn();

      useQueueFakeTimers();
      await service.joinQueue(alice.id, pack.slug, onTimeout);
      service.leaveQueue(alice.id);
      jest.advanceTimersByTime(QUEUE_TIMEOUT_MS * 2);

      expect(onTimeout).not.toHaveBeenCalled();
    });
  });
});
