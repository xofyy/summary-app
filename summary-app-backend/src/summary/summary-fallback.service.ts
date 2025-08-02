import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../content/schemas/article.schema';
import { Summary, SummaryDocument } from '../content/schemas/summary.schema';
import { VertexAIService, SummaryLength, SummaryStyle } from '../ai/vertex-ai.service';

@Injectable()
export class SummaryFallbackService {
  private readonly logger = new Logger(SummaryFallbackService.name);

  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Summary.name) private summaryModel: Model<SummaryDocument>,
    private vertexAiService: VertexAIService,
  ) {}

  async processUnsummarizedArticles(): Promise<void> {
    this.logger.log('Processing unsummarized articles (fallback mode)');
    
    try {
      // Get articles that haven't been summarized yet
      const unsummarizedArticles = await this.articleModel
        .find({ 
          isSummarized: false,
          originalContent: { $exists: true, $ne: '' }
        })
        .limit(5) // Process max 5 articles at a time
        .exec();

      this.logger.log(`Found ${unsummarizedArticles.length} unsummarized articles`);

      for (const article of unsummarizedArticles) {
        try {
          await this.processSingleArticle(article);
        } catch (error) {
          this.logger.error(`Failed to process article ${article._id}:`, error);
        }
      }
    } catch (error) {
      this.logger.error('Failed to process unsummarized articles:', error);
    }
  }

  private async processSingleArticle(article: ArticleDocument): Promise<void> {
    try {
      // Check if summary already exists
      const existingSummary = await this.summaryModel.findOne({ article: article._id });
      if (existingSummary) {
        // Mark as summarized if summary exists
        await this.articleModel.findByIdAndUpdate(article._id, { isSummarized: true });
        return;
      }

      // Check if article has content to summarize
      if (!article.originalContent || article.originalContent.trim().length === 0) {
        this.logger.warn(`Article ${article._id} has no content to summarize`);
        return;
      }

      // Generate summary using AI
      const summaryResult = await this.vertexAiService.summarizeText(
        article.originalContent,
        {
          length: SummaryLength.MEDIUM,
          style: SummaryStyle.FORMAL,
          language: 'Turkish'
        }
      );

      // Extract summary text and keywords from the result
      const summaryText = summaryResult.summary;
      const keywords = summaryResult.keywords;

      // Create summary record
      await this.summaryModel.create({
        article: article._id,
        text: summaryText,
        keywords: keywords.slice(0, 10), // Limit to 10 keywords
        readCount: 0
      });

      // Mark article as summarized
      await this.articleModel.findByIdAndUpdate(article._id, { isSummarized: true });

      this.logger.log(`Successfully summarized article: ${article.title}`);
    } catch (error) {
      this.logger.error(`Failed to summarize article ${article._id}:`, error);
      throw error;
    }
  }

}