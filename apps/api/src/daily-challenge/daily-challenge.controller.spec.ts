import { Test, TestingModule } from '@nestjs/testing';
import { DailyChallengeController } from './daily-challenge.controller';

describe('DailyChallengeController', () => {
  let controller: DailyChallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyChallengeController],
    }).compile();

    controller = module.get<DailyChallengeController>(DailyChallengeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
