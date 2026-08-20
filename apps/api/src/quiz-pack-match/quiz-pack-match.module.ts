import { Module } from '@nestjs/common';
import { QuizPackMatchService } from './quiz-pack-match.service';
import { QuizPackMatchGateway } from './quiz-pack-match.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [QuizPackMatchService, QuizPackMatchGateway],
})
export class QuizPackMatchModule {}
