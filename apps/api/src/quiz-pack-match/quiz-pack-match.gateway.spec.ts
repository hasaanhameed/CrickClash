import { Test, TestingModule } from '@nestjs/testing';
import { QuizPackMatchGateway } from './quiz-pack-match.gateway';

describe('QuizPackMatchGateway', () => {
  let gateway: QuizPackMatchGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuizPackMatchGateway],
    }).compile();

    gateway = module.get<QuizPackMatchGateway>(QuizPackMatchGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
