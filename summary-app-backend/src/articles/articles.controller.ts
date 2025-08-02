import { Controller, Get, Post, Query, Param, UseGuards, Request } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { SummaryFallbackService } from '../summary/summary-fallback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly summaryFallbackService: SummaryFallbackService,
  ) {}

  @Post('fetch')
  async fetchArticles() {
    await this.articlesService.fetchArticlesFromRss();
    return { message: 'Articles fetched and queued for summarization' };
  }

  @Get()
  async getArticles(
    @Request() req,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const userInterests = req.user.interests || [];
    
    return this.articlesService.getArticlesByUserInterests(userInterests, pageNum, limitNum);
  }

  @Get(':id')
  async getArticle(@Param('id') id: string) {
    return this.articlesService.getArticleById(id);
  }

  @Get('unsummarized/list')
  async getUnsummarizedArticles() {
    return this.articlesService.getUnsummarizedArticles();
  }

  @Post('process-summaries')
  async processSummaries() {
    await this.summaryFallbackService.processUnsummarizedArticles();
    return { message: 'Summary processing completed successfully' };
  }
}