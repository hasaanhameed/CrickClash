import { IsString } from 'class-validator';

export class JoinQueueDto {
  @IsString()
  packSlug!: string;
}
