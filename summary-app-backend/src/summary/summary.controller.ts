import { Controller, Get, Post, Param, Query, UseGuards, Request } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('summaries')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Post('article/:articleId')
  async createSummary(@Param('articleId') articleId: string) {
    return this.summaryService.createSummaryDirect(articleId);
  }

  @Get()
  async getSummaries(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const userInterests = req.user.interests || [];
    
    return this.summaryService.getSummariesByUserInterests(userInterests, pageNum, limitNum);
  }

  @Get(':id')
  async getSummary(@Param('id') id: string) {
    return this.summaryService.getSummaryById(id);
  }

  @Get('article/:articleId')
  async getSummaryByArticle(@Param('articleId') articleId: string) {
    return this.summaryService.getSummaryByArticleId(articleId);
  }
}