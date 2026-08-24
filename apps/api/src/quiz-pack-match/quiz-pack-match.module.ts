import { Module } from '@nestjs/common';
import { QuizPackMatchService } from './quiz-pack-match.service';
import { QuizPackMatchGateway } from './quiz-pack-match.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ClockModule } from '../clock/clock.module';

@Module({
  imports: [AuthModule, PrismaModule, ClockModule],
  providers: [QuizPackMatchService, QuizPackMatchGateway],
})
export class QuizPackMatchModule {}
