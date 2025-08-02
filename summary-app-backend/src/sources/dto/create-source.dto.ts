import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateSourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  url: string;

  @IsUrl()
  rssFeedUrl: string;
}