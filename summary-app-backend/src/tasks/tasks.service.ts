import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ArticlesService } from '../articles/articles.service';
import { SummaryFallbackService } from '../summary/summary-fallback.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private articlesService: ArticlesService,
    private summaryFallbackService: SummaryFallbackService,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleRssFetch() {
    this.logger.log('Starting RSS fetch task...');
    try {
      await this.articlesService.fetchArticlesFromRss();
      this.logger.log('RSS fetch task completed successfully');
    } catch (error) {
      this.logger.error('RSS fetch task failed:', error);
    }
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleSummaryFallback() {
    this.logger.log('Starting summary fallback task...');
    try {
      await this.summaryFallbackService.processUnsummarizedArticles();
      this.logger.log('Summary fallback task completed successfully');
    } catch (error) {
      this.logger.error('Summary fallback task failed:', error);
    }
  }

  // Manual trigger for immediate RSS fetch
  async triggerRssFetch() {
    this.logger.log('Manual RSS fetch triggered');
    try {
      await this.articlesService.fetchArticlesFromRss();
      this.logger.log('Manual RSS fetch completed successfully');
      return { message: 'RSS fetch completed successfully' };
    } catch (error) {
      this.logger.error('Manual RSS fetch failed:', error);
      throw error;
    }
  }

  // Manual trigger for summary processing
  async triggerSummaryProcessing() {
    this.logger.log('Manual summary processing triggered');
    try {
      await this.summaryFallbackService.processUnsummarizedArticles();
      this.logger.log('Manual summary processing completed successfully');
      return { message: 'Summary processing completed successfully' };
    } catch (error) {
      this.logger.error('Manual summary processing failed:', error);
      throw error;
    }
  }
}