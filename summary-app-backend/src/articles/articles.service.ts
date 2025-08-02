import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Article, ArticleDocument } from '../content/schemas/article.schema';
import { Source, SourceDocument } from '../content/schemas/source.schema';
import { Summary, SummaryDocument } from '../content/schemas/summary.schema';
import { QueueService } from '../queue/queue.service';
import * as Parser from 'rss-parser';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);
  private parser = new Parser({
    customFields: {
      item: ['description', 'content:encoded']
    },
    timeout: 10000, // 10 second timeout
    maxRedirects: 5
  });

  constructor(
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    @InjectModel(Summary.name) private summaryModel: Model<SummaryDocument>,
    private queueService: QueueService,
  ) {}

  async fetchArticlesFromRss(): Promise<{ success: boolean; message: string; articlesProcessed: number; errors: string[] }> {
    const errors: string[] = [];
    let articlesProcessed = 0;
    
    try {
      const sources = await this.sourceModel.find().exec();
      
      if (!sources || sources.length === 0) {
        this.logger.warn('No RSS sources found');
        return {
          success: true,
          message: 'No RSS sources configured',
          articlesProcessed: 0,
          errors: []
        };
      }

      this.logger.log(`Starting RSS fetch for ${sources.length} sources`);
      
      for (const source of sources) {
        if (!source.rssFeedUrl) {
          this.logger.warn(`Source ${source.name} has no RSS feed URL`);
          continue;
        }

        try {
          this.logger.log(`Fetching RSS from ${source.name}: ${source.rssFeedUrl}`);
          
          const feed = await this.parser.parseURL(source.rssFeedUrl);
          
          if (!feed || !feed.items) {
            this.logger.warn(`No items found in RSS feed for ${source.name}`);
            continue;
          }

          this.logger.log(`Found ${feed.items.length} items from ${source.name}`);
          
          for (const item of feed.items) {
            if (!item.link || !item.link.trim()) {
              this.logger.debug('Skipping item without URL');
              continue;
            }
            
            try {
              const existingArticle = await this.articleModel.findOne({ url: item.link }).exec();
              
              if (!existingArticle) {
                // Validate and clean article data
                const title = this.sanitizeText(item.title) || 'Başlık mevcut değil';
                const description = this.sanitizeText(item.contentSnippet || item.description) || '';
                const originalContent = this.sanitizeText(
                  item['content:encoded'] || item.content || item.contentSnippet
                ) || description;
                
                const publishedAt = this.parseDate(item.pubDate) || new Date();

                const article = await this.articleModel.create({
                  title,
                  url: item.link.trim(),
                  source: source._id,
                  description,
                  originalContent,
                  publishedAt,
                  isSummarized: false
                });

                articlesProcessed++;
                this.logger.debug(`Created article: ${title}`);

                // Queue for summarization with fallback
                if (originalContent && originalContent.length > 100) {
                  try {
                    await this.queueService.addSummarizeJob({
                      articleId: (article._id as any).toString(),
                      content: originalContent,
                    });
                  } catch (queueError) {
                    this.logger.error(`Failed to queue article ${article._id} for summarization`, queueError);
                    errors.push(`Queue error for article ${article._id}: ${queueError.message}`);
                  }
                }
              }
            } catch (articleError) {
              if (articleError.code === 11000) {
                // Duplicate key error - article already exists, skip silently
                this.logger.debug(`Article already exists: ${item.link}`);
                continue;
              } else {
                this.logger.error(`Error processing article ${item.link}`, articleError);
                errors.push(`Article processing error for ${item.link}: ${articleError.message}`);
              }
            }
          }
        } catch (feedError) {
          this.logger.error(`Error fetching RSS for ${source.name}`, feedError);
          errors.push(`RSS fetch error for ${source.name}: ${feedError.message}`);
        }
      }

      const message = `RSS fetch completed. Processed ${articlesProcessed} new articles from ${sources.length} sources`;
      this.logger.log(message);
      
      return {
        success: true,
        message,
        articlesProcessed,
        errors
      };
    } catch (error) {
      this.logger.error('Critical error in fetchArticlesFromRss', error);
      throw error;
    }
  }

  private sanitizeText(text: string | undefined): string {
    if (!text || typeof text !== 'string') return '';
    return text.trim().replace(/\s+/g, ' ').substring(0, 5000); // Limit length and normalize whitespace
  }

  private parseDate(dateString: string | undefined): Date | null {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      // Validate reasonable date range (not in the future, not too old)
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      if (date > now || date < oneYearAgo) {
        this.logger.warn(`Invalid date range for article: ${dateString}`);
        return null;
      }
      
      return date;
    } catch (error) {
      this.logger.warn(`Failed to parse date: ${dateString}`, error);
      return null;
    }
  }

  async getArticlesByUserInterests(userInterests: string[], page: number = 1, limit: number = 10): Promise<ArticleDocument[]> {
    try {
      // Validate input parameters
      if (!Array.isArray(userInterests) || userInterests.length === 0) {
        this.logger.warn('No user interests provided, returning empty array');
        return [];
      }

      const validPage = Math.max(1, page);
      const validLimit = Math.max(1, Math.min(100, limit)); // Limit between 1 and 100
      const skip = (validPage - 1) * validLimit;

      // Sanitize interests for regex
      const sanitizedInterests = userInterests
        .filter(interest => interest && typeof interest === 'string')
        .map(interest => interest.trim())
        .filter(interest => interest.length > 0);

      if (sanitizedInterests.length === 0) {
        this.logger.warn('No valid interests after sanitization');
        return [];
      }

      const query = {
        $or: [
          { categories: { $in: sanitizedInterests } },
          { title: { $regex: sanitizedInterests.join('|'), $options: 'i' } },
          { description: { $regex: sanitizedInterests.join('|'), $options: 'i' } }
        ],
        isSummarized: true
      };

      const articles = await this.articleModel
        .find(query)
        .populate('source')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(validLimit)
        .exec();

      return articles || [];
    } catch (error) {
      this.logger.error('Error getting articles by user interests', error);
      return []; // Return empty array as fallback
    }
  }

  async getArticleById(id: string): Promise<ArticleDocument | null> {
    try {
      if (!id || typeof id !== 'string') {
        this.logger.warn('Invalid article ID provided');
        return null;
      }

      const article = await this.articleModel.findById(id).populate('source').exec();
      return article;
    } catch (error) {
      this.logger.error(`Error getting article by ID ${id}`, error);
      return null;
    }
  }

  async getUnsummarizedArticles(): Promise<ArticleDocument[]> {
    try {
      const articles = await this.articleModel
        .find({ isSummarized: false })
        .populate('source')
        .exec();
      
      return articles || [];
    } catch (error) {
      this.logger.error('Error getting unsummarized articles', error);
      return [];
    }
  }

  async markAsSummarized(articleId: string): Promise<ArticleDocument | null> {
    try {
      if (!articleId || typeof articleId !== 'string') {
        this.logger.warn('Invalid article ID for marking as summarized');
        return null;
      }

      const article = await this.articleModel.findByIdAndUpdate(
        articleId, 
        { isSummarized: true }, 
        { new: true }
      ).exec();

      if (!article) {
        this.logger.warn(`Article not found for ID: ${articleId}`);
      }

      return article;
    } catch (error) {
      this.logger.error(`Error marking article ${articleId} as summarized`, error);
      return null;
    }
  }
}