import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuizPacksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const packs = await this.prisma.quizPack.findMany({
      include: {
        _count: { select: { questions: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return packs.map(({ _count, ...pack }) => ({
      ...pack,
      questionCount: _count.questions,
    }));
  }

  async findBySlug(slug: string) {
    const pack = await this.prisma.quizPack.findUnique({
      where: { slug },
      include: { questions: true },
    });

    if (!pack) {
      throw new NotFoundException('Quiz pack not found');
    }

    // Never send the answer key to the client
    const questions = pack.questions.map(
      ({ correctAnswer, ...question }) => question,
    );

    return { ...pack, questions };
  }
}
