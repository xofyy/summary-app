import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateSourceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsUrl()
  @IsOptional()
  rssFeedUrl?: string;
}