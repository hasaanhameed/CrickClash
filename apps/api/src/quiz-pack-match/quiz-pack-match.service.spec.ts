import { Test, TestingModule } from '@nestjs/testing';
import { QuizPackMatchService } from './quiz-pack-match.service';

describe('QuizPackMatchService', () => {
  let service: QuizPackMatchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizPackMatchService],
    }).compile();

    service = module.get<QuizPackMatchService>(QuizPackMatchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
