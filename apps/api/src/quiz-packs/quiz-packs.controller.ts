import { Controller, Get, Param } from '@nestjs/common';
import { QuizPacksService } from './quiz-packs.service';

@Controller('quiz-packs')
export class QuizPacksController {
  constructor(private readonly quizPacksService: QuizPacksService) {}

  @Get()
  findAll() {
    return this.quizPacksService.findAll();
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.quizPacksService.findBySlug(slug);
  }
}
