import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Summary, SummaryDocument } from '../content/schemas/summary.schema';
import { Article, ArticleDocument } from '../content/schemas/article.schema';

export interface SearchResult {
  summaries: SummaryDocument[];
  articles: ArticleDocument[];
  totalCount: number;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'readCount';
  userInterests?: string[];
}

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Summary.name) private summaryModel: Model<SummaryDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
  ) {}

  async searchAll(query: string, options: SearchOptions = {}): Promise<SearchResult> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'relevance',
      userInterests = []
    } = options;
    
    const skip = (page - 1) * limit;

    // MongoDB text search
    const [summaries, articles] = await Promise.all([
      this.searchSummaries(query, skip, limit, sortBy, userInterests),
      this.searchArticles(query, skip, limit, sortBy, userInterests)
    ]);

    // Toplam count hesaplama
    const totalCount = summaries.length + articles.length;

    return {
      summaries,
      articles,
      totalCount
    };
  }

  async searchSummaries(
    query: string, 
    skip: number = 0, 
    limit: number = 10, 
    sortBy: string = 'relevance',
    userInterests: string[] = []
  ): Promise<SummaryDocument[]> {
    let searchFilter: any = {};

    if (query.trim()) {
      // MongoDB text search
      searchFilter.$text = { $search: query };
    }

    // Kullanıcı ilgi alanlarına göre filtreleme
    if (userInterests.length > 0) {
      searchFilter.$or = [
        { keywords: { $in: userInterests } },
        ...(searchFilter.$or || [])
      ];
    }

    let sortOptions: any = {};
    
    switch (sortBy) {
      case 'date':
        sortOptions.createdAt = -1;
        break;
      case 'readCount':
        sortOptions.readCount = -1;
        break;
      case 'relevance':
      default:
        if (query.trim()) {
          sortOptions.score = { $meta: 'textScore' };
        } else {
          sortOptions.createdAt = -1;
        }
        break;
    }

    const queryBuilder = this.summaryModel
      .find(searchFilter)
      .populate({
        path: 'article',
        populate: {
          path: 'source'
        }
      })
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Text search score'u da döndür
    if (query.trim() && sortBy === 'relevance') {
      queryBuilder.select({ score: { $meta: 'textScore' } });
    }

    return queryBuilder.exec();
  }

  async searchArticles(
    query: string, 
    skip: number = 0, 
    limit: number = 10, 
    sortBy: string = 'relevance',
    userInterests: string[] = []
  ): Promise<ArticleDocument[]> {
    let searchFilter: any = {};

    if (query.trim()) {
      searchFilter.$text = { $search: query };
    }

    // Kullanıcı ilgi alanlarına göre filtreleme
    if (userInterests.length > 0) {
      searchFilter.$or = [
        { categories: { $in: userInterests } },
        { title: { $regex: userInterests.join('|'), $options: 'i' } },
        ...(searchFilter.$or || [])
      ];
    }

    // Sadece özetlenmiş makaleleri getir
    searchFilter.isSummarized = true;

    let sortOptions: any = {};
    
    switch (sortBy) {
      case 'date':
        sortOptions.publishedAt = -1;
        break;
      case 'readCount':
        // Articles'da readCount yok, createdAt kullan
        sortOptions.createdAt = -1;
        break;
      case 'relevance':
      default:
        if (query.trim()) {
          sortOptions.score = { $meta: 'textScore' };
        } else {
          sortOptions.publishedAt = -1;
        }
        break;
    }

    const queryBuilder = this.articleModel
      .find(searchFilter)
      .populate('source')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Text search score'u da döndür
    if (query.trim() && sortBy === 'relevance') {
      queryBuilder.select({ score: { $meta: 'textScore' } });
    }

    return queryBuilder.exec();
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    // Arama önerileri için keywords'leri analiz et
    const pipeline: any[] = [
      {
        $match: {
          $or: [
            { keywords: { $regex: query, $options: 'i' } },
            { text: { $regex: query, $options: 'i' } }
          ]
        }
      },
      { $unwind: '$keywords' },
      {
        $match: {
          keywords: { $regex: query, $options: 'i' }
        }
      },
      {
        $group: {
          _id: '$keywords',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          suggestion: '$_id'
        }
      }
    ];

    const results = await this.summaryModel.aggregate(pipeline);
    return results.map(r => r.suggestion);
  }

  async getPopularKeywords(): Promise<{ keyword: string; count: number }[]> {
    const pipeline: any[] = [
      { $unwind: '$keywords' },
      {
        $group: {
          _id: '$keywords',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          keyword: '$_id',
          count: 1
        }
      }
    ];

    return this.summaryModel.aggregate(pipeline);
  }
}