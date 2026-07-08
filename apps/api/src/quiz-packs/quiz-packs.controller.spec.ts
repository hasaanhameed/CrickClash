import { Test, TestingModule } from '@nestjs/testing';
import { QuizPacksController } from './quiz-packs.controller';

describe('QuizPacksController', () => {
  let controller: QuizPacksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizPacksController],
    }).compile();

    controller = module.get<QuizPacksController>(QuizPacksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
