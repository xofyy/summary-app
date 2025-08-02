import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Source, SourceDocument } from '../content/schemas/source.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Article, ArticleDocument } from '../content/schemas/article.schema';
import { QueueService } from '../queue/queue.service';
import * as Parser from 'rss-parser';

@Injectable()
export class SourcesService {
  private parser = new Parser();

  constructor(
    @InjectModel(Source.name) private sourceModel: Model<SourceDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Article.name) private articleModel: Model<ArticleDocument>,
    private queueService: QueueService,
  ) {}

  async createDefaultSources() {
    const defaultSources = [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com',
        rssFeedUrl: 'https://techcrunch.com/feed/',
        isDefault: true
      },
      {
        name: 'BBC News',
        url: 'https://www.bbc.com/news',
        rssFeedUrl: 'http://feeds.bbci.co.uk/news/rss.xml',
        isDefault: true
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com',
        rssFeedUrl: 'https://www.theverge.com/rss/index.xml',
        isDefault: true
      },
      {
        name: 'Ars Technica',
        url: 'https://arstechnica.com',
        rssFeedUrl: 'http://feeds.arstechnica.com/arstechnica/index',
        isDefault: true
      }
    ];

    for (const sourceData of defaultSources) {
      const existingSource = await this.sourceModel.findOne({ name: sourceData.name });
      if (!existingSource) {
        await this.sourceModel.create(sourceData);
      }
    }
  }

  async getAllSources() {
    return this.sourceModel.find().exec();
  }

  async createSource(sourceData: { name: string; url: string; rssFeedUrl: string }) {
    return this.sourceModel.create(sourceData);
  }

  async validateRssFeed(url: string): Promise<boolean> {
    try {
      await this.parser.parseURL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  async addUserCustomSource(userId: string, sourceData: { name: string; url: string; rssFeedUrl: string }) {
    // RSS feed'i doğrula
    const isValidRss = await this.validateRssFeed(sourceData.rssFeedUrl);
    if (!isValidRss) {
      throw new BadRequestException('Invalid RSS feed URL');
    }

    // Aynı isimde kaynak var mı kontrol et
    const existingSource = await this.sourceModel.findOne({ 
      name: sourceData.name,
      $or: [
        { createdBy: userId },
        { isDefault: true }
      ]
    });

    if (existingSource) {
      throw new BadRequestException('Source with this name already exists');
    }

    // Yeni kaynak oluştur
    const newSource = await this.sourceModel.create({
      ...sourceData,
      createdBy: userId,
      isDefault: false
    });

    // Kullanıcının customSources listesine ekle
    await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { customSources: newSource._id } }
    );

    // Yeni kaynak için RSS'i hemen işle
    await this.processNewSourceRss(newSource);

    return newSource;
  }

  async getUserSources(userId: string) {
    // Kullanıcının özel kaynakları + varsayılan kaynaklar
    const userSources = await this.sourceModel.find({
      $or: [
        { createdBy: userId },
        { isDefault: true }
      ]
    }).exec();

    return userSources;
  }

  async removeUserCustomSource(userId: string, sourceId: string) {
    const source = await this.sourceModel.findOne({
      _id: sourceId,
      createdBy: userId
    });

    if (!source) {
      throw new NotFoundException('Custom source not found');
    }

    // Kullanıcının customSources listesinden çıkar
    await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { customSources: sourceId } }
    );

    // Kaynağı sil
    await this.sourceModel.findByIdAndDelete(sourceId);

    return { message: 'Source removed successfully' };
  }

  async updateUserCustomSource(userId: string, sourceId: string, updateData: { name?: string; url?: string; rssFeedUrl?: string }) {
    const source = await this.sourceModel.findOne({
      _id: sourceId,
      createdBy: userId
    });

    if (!source) {
      throw new NotFoundException('Custom source not found');
    }

    // RSS feed güncelleniyorsa doğrula
    if (updateData.rssFeedUrl) {
      const isValidRss = await this.validateRssFeed(updateData.rssFeedUrl);
      if (!isValidRss) {
        throw new BadRequestException('Invalid RSS feed URL');
      }
    }

    // İsim güncelleniyorsa çakışma kontrolü
    if (updateData.name && updateData.name !== source.name) {
      const existingSource = await this.sourceModel.findOne({ 
        name: updateData.name,
        _id: { $ne: sourceId },
        $or: [
          { createdBy: userId },
          { isDefault: true }
        ]
      });

      if (existingSource) {
        throw new BadRequestException('Source with this name already exists');
      }
    }

    return this.sourceModel.findByIdAndUpdate(sourceId, updateData, { new: true });
  }

  async processNewSourceRss(source: SourceDocument) {
    if (!source.rssFeedUrl) {
      return;
    }

    try {
      console.log(`Processing RSS for new source: ${source.name}`);
      const feed = await this.parser.parseURL(source.rssFeedUrl);
      
      // Limit to first 10 articles for new sources to avoid overwhelming the system
      const items = feed.items.slice(0, 10);
      
      for (const item of items) {
        if (!item.link) continue; // Skip items without URLs
        
        try {
          const existingArticle = await this.articleModel.findOne({ url: item.link });
          
          if (!existingArticle) {
            const article = await this.articleModel.create({
              title: item.title || 'Untitled',
              url: item.link,
              source: source._id,
              description: item.contentSnippet || item.description || '',
              originalContent: item['content:encoded'] || item.content || item.contentSnippet || '',
              publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
              isSummarized: false
            });

            // Özetleme için kuyruğa ekle
            if (article.originalContent && article.originalContent.length > 100) {
              try {
                await this.queueService.addSummarizeJob({
                  articleId: (article._id as any).toString(),
                  content: article.originalContent,
                });
              } catch (queueError) {
                console.error(`Failed to queue article ${article._id} for summarization:`, queueError);
              }
            }
          }
        } catch (articleError) {
          if (articleError.code === 11000) {
            // Duplicate key error - article already exists, skip silently
            continue;
          } else {
            console.error(`Error processing article ${item.link}:`, articleError);
          }
        }
      }
      
      console.log(`Processed ${items.length} articles from ${source.name}`);
    } catch (error) {
      console.error(`Error processing RSS for ${source.name}:`, error);
    }
  }
}