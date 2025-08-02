import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { VertexAIService } from '../../ai/vertex-ai.service';
import { SummaryService } from '../../summary/summary.service';
import { SummarizeJobData } from '../queue.service';

@Processor('summary')
export class SummaryProcessor {
  private readonly logger = new Logger(SummaryProcessor.name);

  constructor(
    private readonly vertexAIService: VertexAIService,
    private readonly summaryService: SummaryService,
  ) {}

  @Process('summarize-article')
  async handleSummarizeArticle(job: Job<SummarizeJobData>) {
    const { articleId, content } = job.data;
    
    try {
      this.logger.log(`Starting summarization for article: ${articleId}`);
      
      // AI ile özetleme ve anahtar kelime çıkarma
      const result = await this.vertexAIService.summarizeText(content);
      
      // Özeti veritabanına kaydet
      await this.summaryService.createSummary({
        article: articleId,
        text: result.summary,
        keywords: result.keywords,
      });
      
      this.logger.log(`Summarization completed for article: ${articleId}`);
      
      return { success: true, articleId };
    } catch (error) {
      this.logger.error(`Summarization failed for article: ${articleId}`, error.stack);
      throw error;
    }
  }
}