import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { QuizPacksModule } from './quiz-packs/quiz-packs.module';
import { DailyChallengeModule } from './daily-challenge/daily-challenge.module';
import { QuizPackMatchModule } from './quiz-pack-match/quiz-pack-match.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, QuizPacksModule, DailyChallengeModule, QuizPackMatchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
