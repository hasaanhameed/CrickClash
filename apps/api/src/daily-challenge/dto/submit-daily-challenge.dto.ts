import { IsObject } from 'class-validator';

export class SubmitDailyChallengeDto {
  @IsObject()
  answers!: Record<string, string>;
}
