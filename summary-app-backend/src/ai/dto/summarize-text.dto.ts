import { IsString, MinLength, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { SummaryLength, SummaryStyle } from '../vertex-ai.service';

export class SummarizeTextDto {
  @IsString()
  @MinLength(10)
  text: string;

  @IsOptional()
  @IsEnum(SummaryLength)
  length?: SummaryLength;

  @IsOptional()
  @IsEnum(SummaryStyle)
  style?: SummaryStyle;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsBoolean()
  includeKeyQuotes?: boolean;
}