import { Module } from '@nestjs/common';
import { QuizPacksController } from './quiz-packs.controller';
import { QuizPacksService } from './quiz-packs.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [QuizPacksController],
  providers: [QuizPacksService],
})
export class QuizPacksModule {}
