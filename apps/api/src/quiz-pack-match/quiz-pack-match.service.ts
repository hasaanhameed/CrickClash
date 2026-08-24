import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { QuizPackMatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClockService } from '../clock/clock.service';

/** How long a player waits for an opponent before the search gives up. */
export const QUEUE_TIMEOUT_MS = 2 * 60 * 1000;

/** Called when a player's wait expires without an opponent turning up. */
export type QueueTimeoutCallback = () => void;

/**
 * What both players are told when a match forms. Deliberately built by hand
 * rather than passing the database row through — the `User` rows behind it
 * carry password hashes.
 */
export interface MatchSummary {
  matchId: string;
  packSlug: string;
  packTitle: string;
  /** In pairing order: the longer-waiting player first. */
  players: { userId: string; username: string }[];
}

export type JoinQueueResult =
  | { status: 'queued' }
  | { status: 'matched'; match: MatchSummary }
  | { status: 'already-engaged'; packSlug: string; packTitle: string };

@Injectable()
export class QuizPackMatchService implements OnModuleDestroy {
  // Waiting players per pack, oldest first. Deliberately in-memory and
  // single-instance — only formed matches are persisted, so a restart
  // just means anyone waiting has to queue again. See README's
  // "Known limitations" for the scaling tradeoff this represents.
  private readonly queues = new Map<string, string[]>();

  // Pending give-up timers, keyed by the waiting player.
  private readonly queueTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  async joinQueue(
    userId: string,
    packSlug: string,
    onTimeout: QueueTimeoutCallback,
  ): Promise<JoinQueueResult> {
    const pack = await this.prisma.quizPack.findUnique({
      where: { slug: packSlug },
    });

    if (!pack) {
      throw new NotFoundException('Quiz pack not found');
    }

    // One search or match at a time. This also covers re-queuing for the pack
    // you're already waiting on, which would otherwise pair you with yourself.
    const engagement = await this.findCurrentEngagement(userId);
    if (engagement) {
      return { status: 'already-engaged', ...engagement };
    }

    const waiting = this.queues.get(pack.id) ?? [];
    const opponentId = waiting.shift();

    if (opponentId === undefined) {
      this.queues.set(pack.id, [userId]);
      this.startTimeout(userId, onTimeout);
      return { status: 'queued' };
    }

    this.queues.set(pack.id, waiting);
    // The opponent is no longer waiting, so their give-up timer is moot.
    this.cancelTimeout(opponentId);

    // FIFO: whoever waited longer takes the player1 slot.
    const match = await this.prisma.quizPackMatch.create({
      data: {
        quizPackId: pack.id,
        player1Id: opponentId,
        player2Id: userId,
      },
      // Select rather than include — a bare `include` would pull the players'
      // password hashes along with them.
      include: {
        player1: { select: { id: true, username: true } },
        player2: { select: { id: true, username: true } },
      },
    });

    return {
      status: 'matched',
      match: {
        matchId: match.id,
        packSlug: pack.slug,
        packTitle: pack.title,
        players: [
          { userId: match.player1.id, username: match.player1.username },
          { userId: match.player2.id, username: match.player2.username },
        ],
      },
    };
  }

  // Pending give-up timers would otherwise keep the process alive for up to
  // QUEUE_TIMEOUT_MS after shutdown is requested.
  onModuleDestroy(): void {
    for (const handle of this.queueTimers.values()) {
      this.clock.clearTimeout(handle);
    }
    this.queueTimers.clear();
    this.queues.clear();
  }

  leaveQueue(userId: string): void {
    this.cancelTimeout(userId);

    for (const [packId, waiting] of this.queues) {
      const remaining = waiting.filter((id) => id !== userId);
      if (remaining.length === waiting.length) continue;

      if (remaining.length === 0) {
        this.queues.delete(packId);
      } else {
        this.queues.set(packId, remaining);
      }
    }
  }

  /** The pack this player is already queued for or mid-match on, if any. */
  private async findCurrentEngagement(
    userId: string,
  ): Promise<{ packSlug: string; packTitle: string } | undefined> {
    const queuedPackId = this.findQueuedPackId(userId);

    if (queuedPackId !== undefined) {
      const pack = await this.prisma.quizPack.findUniqueOrThrow({
        where: { id: queuedPackId },
      });
      return { packSlug: pack.slug, packTitle: pack.title };
    }

    const activeMatch = await this.prisma.quizPackMatch.findFirst({
      where: {
        status: QuizPackMatchStatus.IN_PROGRESS,
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      include: { quizPack: true },
    });

    if (!activeMatch) return undefined;

    return {
      packSlug: activeMatch.quizPack.slug,
      packTitle: activeMatch.quizPack.title,
    };
  }

  private findQueuedPackId(userId: string): string | undefined {
    for (const [packId, waiting] of this.queues) {
      if (waiting.includes(userId)) return packId;
    }
    return undefined;
  }

  private startTimeout(userId: string, onTimeout: QueueTimeoutCallback): void {
    const handle = this.clock.setTimeout(() => {
      this.leaveQueue(userId);
      onTimeout();
    }, QUEUE_TIMEOUT_MS);

    this.queueTimers.set(userId, handle);
  }

  private cancelTimeout(userId: string): void {
    const handle = this.queueTimers.get(userId);
    if (handle === undefined) return;

    this.clock.clearTimeout(handle);
    this.queueTimers.delete(userId);
  }
}
