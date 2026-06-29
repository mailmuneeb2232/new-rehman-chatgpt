import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSettingDto {
  @IsString()
  key: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}
