import { Test, TestingModule } from '@nestjs/testing';
import { QuizPacksService } from './quiz-packs.service';

describe('QuizPacksService', () => {
  let service: QuizPacksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizPacksService],
    }).compile();

    service = module.get<QuizPacksService>(QuizPacksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
