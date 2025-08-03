import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Summary, SummaryDocument } from '../content/schemas/summary.schema';
import { Article, ArticleDocument } from '../content/schemas/article.schema';
import { Source, SourceDocument } from '../content/schemas/source.schema';
import { VertexAIService } from '../ai/vertex-ai.service';

@Injectable()
export class SummaryService {
  constructor(
    @InjectModel(Summary.name) private summaryModel: Model<SummaryDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    private vertexAIService: VertexAIService,
  ) {}

  async createSummary(data: { article: string; text: string; keywords: string[] }) {
    const summary = await this.summaryModel.create({
      article: data.article,
      text: data.text,
      keywords: data.keywords,
      readCount: 0
    });

    await this.articleModel.findByIdAndUpdate(data.article, { isSummarized: true });

    return summary;
  }

  async createSummaryDirect(articleId: string) {
    const article = await this.articleModel.findById(articleId);
    if (!article || !article.originalContent) {
      throw new Error('Article not found or has no content');
    }

    const result = await this.vertexAIService.summarizeText(article.originalContent);

    const summary = await this.summaryModel.create({
      article: articleId,
      text: result.summary,
      keywords: result.keywords,
      readCount: 0
    });

    await this.articleModel.findByIdAndUpdate(articleId, { isSummarized: true });

    return summary;
  }

  async getSummaryByArticleId(articleId: string) {
    return this.summaryModel
      .findOne({ article: articleId })
      .populate({
        path: 'article',
        populate: {
          path: 'source'
        }
      })
      .exec();
  }

  async getSummariesByUserInterests(userInterests: string[], page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    return this.summaryModel
      .find({
        $or: [
          { keywords: { $in: userInterests } },
          { text: { $regex: userInterests.join('|'), $options: 'i' } }
        ]
      })
      .populate({
        path: 'article',
        populate: {
          path: 'source'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async incrementReadCount(summaryId: string) {
    return this.summaryModel.findByIdAndUpdate(
      summaryId,
      { $inc: { readCount: 1 } },
      { new: true }
    ).exec();
  }

  async getSummaryById(id: string) {
    const summary = await this.summaryModel
      .findById(id)
      .populate({
        path: 'article',
        populate: {
          path: 'source'
        }
      })
      .exec();

    if (summary) {
      await this.incrementReadCount(id);
    }

    return summary;
  }

  async getStats(userId?: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [
        totalSummaries, 
        totalSources, 
        todaySummaries, 
        avgReadTime,
        totalReadCount,
        lastWeekSummaries
      ] = await Promise.all([
        this.summaryModel.countDocuments().exec(),
        this.sourceModel.countDocuments().exec(),
        this.summaryModel.countDocuments({
          createdAt: { $gte: today }
        }).exec(),
        this.summaryModel.aggregate([
          { $group: { _id: null, avgReads: { $avg: '$readCount' } } }
        ]).exec(),
        this.summaryModel.aggregate([
          { $group: { _id: null, totalReads: { $sum: '$readCount' } } }
        ]).exec(),
        this.summaryModel.countDocuments({
          createdAt: { 
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }).exec()
      ]);

      // Calculate average read time based on actual data
      const avgReadTimeMinutes = avgReadTime.length > 0 
        ? Math.max(1, Math.round(avgReadTime[0].avgReads * 0.3)) 
        : 2;

      const totalReads = totalReadCount.length > 0 ? totalReadCount[0].totalReads : 0;

      return {
        totalSummaries,
        totalSources,
        todaySummaries,
        avgReadTime: avgReadTimeMinutes,
        totalReads,
        lastWeekSummaries,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting stats:', error);
      // Return fallback stats
      return {
        totalSummaries: 0,
        totalSources: 0,
        todaySummaries: 0,
        avgReadTime: 2,
        totalReads: 0,
        lastWeekSummaries: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  private extractKeywords(text: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
    
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word));

    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(wordFreq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);
  }
}