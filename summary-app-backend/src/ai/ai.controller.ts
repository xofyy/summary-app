import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { VertexAIService } from './vertex-ai.service';
import { SummarizeTextDto } from './dto/summarize-text.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
export class AiController {
  constructor(private vertexAIService: VertexAIService) {}

  @UseGuards(JwtAuthGuard)
  @Post('summarize')
  async summarizeText(@Body() summarizeTextDto: SummarizeTextDto) {
    const { text, ...options } = summarizeTextDto;
    return this.vertexAIService.summarizeText(text, options);
  }

  @Get('test')
  async testConnection() {
    return this.vertexAIService.testConnection();
  }
}