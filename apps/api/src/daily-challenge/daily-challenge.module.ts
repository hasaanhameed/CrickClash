import { Module } from '@nestjs/common';
import { DailyChallengeController } from './daily-challenge.controller';
import { DailyChallengeService } from './daily-challenge.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DailyChallengeController],
  providers: [DailyChallengeService],
})
export class DailyChallengeModule {}
