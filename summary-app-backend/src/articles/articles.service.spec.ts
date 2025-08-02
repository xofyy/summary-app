import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ArticlesService } from './articles.service';
import { Article } from '../content/schemas/article.schema';
import { Source } from '../content/schemas/source.schema';
import { Summary } from '../content/schemas/summary.schema';
import { Model } from 'mongoose';

describe('ArticlesService', () => {
  let service: ArticlesService;
  let articleModel: Model<Article>;
  let sourceModel: Model<Source>;
  let summaryModel: Model<Summary>;

  const mockArticle = {
    _id: 'article-id',
    title: 'Test Article',
    url: 'https://example.com/article',
    source: 'source-id',
    description: 'Test description',
    isSummarized: false,
    publishedAt: new Date(),
  };

  const mockSource = {
    _id: 'source-id',
    name: 'Test Source',
    url: 'https://example.com',
    rssFeedUrl: 'https://example.com/rss',
  };

  const mockArticleModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  const mockSourceModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockSummaryModel = {
    find: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticlesService,
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
        {
          provide: getModelToken(Source.name),
          useValue: mockSourceModel,
        },
        {
          provide: getModelToken(Summary.name),
          useValue: mockSummaryModel,
        },
      ],
    }).compile();

    service = module.get<ArticlesService>(ArticlesService);
    articleModel = module.get<Model<Article>>(getModelToken(Article.name));
    sourceModel = module.get<Model<Source>>(getModelToken(Source.name));
    summaryModel = module.get<Model<Summary>>(getModelToken(Summary.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getArticlesByUserInterests', () => {
    it('should return articles matching user interests', async () => {
      const userInterests = ['technology', 'science'];
      const mockArticles = [mockArticle];

      // Mock the chain of methods
      mockArticleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockArticles),
              }),
            }),
          }),
        }),
      });

      const result = await service.getArticlesByUserInterests(userInterests, 1, 10);

      expect(mockArticleModel.find).toHaveBeenCalledWith({
        $or: [
          { categories: { $in: userInterests } },
          { title: { $regex: userInterests.join('|'), $options: 'i' } },
          { description: { $regex: userInterests.join('|'), $options: 'i' } }
        ],
        isSummarized: true
      });
      expect(result).toEqual(mockArticles);
    });
  });

  describe('getArticleById', () => {
    it('should return an article by id', async () => {
      const articleId = 'article-id';

      mockArticleModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockArticle),
        }),
      });

      const result = await service.getArticleById(articleId);

      expect(mockArticleModel.findById).toHaveBeenCalledWith(articleId);
      expect(result).toEqual(mockArticle);
    });
  });

  describe('markAsSummarized', () => {
    it('should mark an article as summarized', async () => {
      const articleId = 'article-id';
      const updatedArticle = { ...mockArticle, isSummarized: true };

      mockArticleModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedArticle),
      });

      const result = await service.markAsSummarized(articleId);

      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        articleId,
        { isSummarized: true },
        { new: true }
      );
      expect(result).toEqual(updatedArticle);
    });
  });

  describe('getUnsummarizedArticles', () => {
    it('should return unsummarized articles', async () => {
      const mockUnsummarizedArticles = [{ ...mockArticle, isSummarized: false }];

      mockArticleModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUnsummarizedArticles),
        }),
      });

      const result = await service.getUnsummarizedArticles();

      expect(mockArticleModel.find).toHaveBeenCalledWith({ isSummarized: false });
      expect(result).toEqual(mockUnsummarizedArticles);
    });
  });
});