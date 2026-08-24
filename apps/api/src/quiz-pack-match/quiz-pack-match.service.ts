import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizPackMatch } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type JoinQueueResult =
  { status: 'queued' } | { status: 'matched'; match: QuizPackMatch };

@Injectable()
export class QuizPackMatchService {
  // Waiting players per pack, oldest first. Deliberately in-memory and
  // single-instance — only formed matches are persisted, so a restart
  // just means anyone waiting has to queue again. See README's
  // "Known limitations" for the scaling tradeoff this represents.
  private readonly queues = new Map<string, string[]>();

  constructor(private readonly prisma: PrismaService) {}

  async joinQueue(userId: string, packSlug: string): Promise<JoinQueueResult> {
    const pack = await this.prisma.quizPack.findUnique({
      where: { slug: packSlug },
    });

    if (!pack) {
      throw new NotFoundException('Quiz pack not found');
    }

    const waiting = this.queues.get(pack.id) ?? [];

    // Re-queuing while already waiting for this pack is a no-op — without
    // this a user could be paired against themselves.
    if (waiting.includes(userId)) {
      return { status: 'queued' };
    }

    const opponentId = waiting.shift();

    if (opponentId === undefined) {
      this.queues.set(pack.id, [userId]);
      return { status: 'queued' };
    }

    this.queues.set(pack.id, waiting);

    // FIFO: whoever waited longer takes the player1 slot.
    const match = await this.prisma.quizPackMatch.create({
      data: {
        quizPackId: pack.id,
        player1Id: opponentId,
        player2Id: userId,
      },
    });

    return { status: 'matched', match };
  }

  leaveQueue(userId: string): void {
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
}
