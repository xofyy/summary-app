import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface SummarizeJobData {
  articleId: string;
  content: string;
}

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(@InjectQueue('summary') private summaryQueue: Queue) {}

  async addSummarizeJob(data: SummarizeJobData): Promise<void> {
    try {
      await this.summaryQueue.add('summarize-article', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10, // Keep only last 10 completed jobs
        removeOnFail: 5, // Keep only last 5 failed jobs
      });
      this.logger.log(`Added article ${data.articleId} to summarization queue`);
    } catch (error) {
      this.logger.error(`Failed to add article ${data.articleId} to queue:`, error);
      // Don't throw error to prevent RSS processing from failing
      // The article will still be saved, just not summarized immediately
    }
  }

  async getSummaryQueueStats() {
    try {
      const waiting = await this.summaryQueue.getWaiting();
      const active = await this.summaryQueue.getActive();
      const completed = await this.summaryQueue.getCompleted();
      const failed = await this.summaryQueue.getFailed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        status: 'connected'
      };
    } catch (error) {
      this.logger.error('Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        status: 'disconnected',
        error: error.message
      };
    }
  }
}