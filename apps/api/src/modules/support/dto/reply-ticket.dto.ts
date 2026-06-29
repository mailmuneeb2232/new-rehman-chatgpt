import { IsString, MinLength } from 'class-validator';

export class ReplyTicketDto {
  @IsString()
  @MinLength(5)
  message: string;
}
