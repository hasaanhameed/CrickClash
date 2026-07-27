import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DailyChallengeService } from './daily-challenge.service';
import { SubmitDailyChallengeDto } from './dto/submit-daily-challenge.dto';

@UseGuards(JwtAuthGuard)
@Controller('daily-challenge')
export class DailyChallengeController {
  constructor(private readonly dailyChallengeService: DailyChallengeService) {}

  @Get('today')
  getToday(@CurrentUser() user: { userId: string }) {
    return this.dailyChallengeService.getToday(user.userId);
  }

  @Post('submit')
  @HttpCode(200)
  submit(
    @CurrentUser() user: { userId: string },
    @Body() dto: SubmitDailyChallengeDto,
  ) {
    return this.dailyChallengeService.submit(user.userId, dto.answers);
  }
}
