import { Module } from '@nestjs/common';
import { QuizPacksController } from './quiz-packs.controller';
import { QuizPacksService } from './quiz-packs.service';

@Module({
  controllers: [QuizPacksController],
  providers: [QuizPacksService]
})
export class QuizPacksModule {}
