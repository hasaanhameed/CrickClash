import { Module } from '@nestjs/common';
import { QuizPackMatchService } from './quiz-pack-match.service';
import { QuizPackMatchGateway } from './quiz-pack-match.gateway';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  providers: [QuizPackMatchService, QuizPackMatchGateway],
})
export class QuizPackMatchModule {}
