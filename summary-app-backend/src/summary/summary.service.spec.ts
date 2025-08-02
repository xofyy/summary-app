import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SummaryService } from './summary.service';
import { Summary } from '../content/schemas/summary.schema';
import { Article } from '../content/schemas/article.schema';
import { VertexAIService } from '../ai/vertex-ai.service';
import { Model } from 'mongoose';

describe('SummaryService', () => {
  let service: SummaryService;
  let summaryModel: Model<Summary>;
  let articleModel: Model<Article>;
  let vertexAIService: VertexAIService;

  const mockArticle = {
    _id: 'article-id',
    title: 'Test Article',
    originalContent: 'This is a long article content that needs to be summarized.',
    url: 'https://example.com/article',
    source: 'source-id',
    isSummarized: false,
  };

  const mockSummary = {
    _id: 'summary-id',
    article: 'article-id',
    text: 'This is a summary of the article.',
    keywords: ['test', 'article', 'summary'],
    readCount: 0,
    createdAt: new Date(),
  };

  const mockSummaryModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    populate: jest.fn(),
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    exec: jest.fn(),
  };

  const mockArticleModel = {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockVertexAIService = {
    summarizeText: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SummaryService,
        {
          provide: getModelToken(Summary.name),
          useValue: mockSummaryModel,
        },
        {
          provide: getModelToken(Article.name),
          useValue: mockArticleModel,
        },
        {
          provide: VertexAIService,
          useValue: mockVertexAIService,
        },
      ],
    }).compile();

    service = module.get<SummaryService>(SummaryService);
    summaryModel = module.get<Model<Summary>>(getModelToken(Summary.name));
    articleModel = module.get<Model<Article>>(getModelToken(Article.name));
    vertexAIService = module.get<VertexAIService>(VertexAIService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSummary', () => {
    it('should create a summary for an article', async () => {
      const articleId = 'article-id';
      const summaryText = 'This is a generated summary.';

      mockArticleModel.findById.mockResolvedValue(mockArticle);
      mockVertexAIService.summarizeText.mockResolvedValue(summaryText);
      mockSummaryModel.create.mockResolvedValue(mockSummary);
      mockArticleModel.findByIdAndUpdate.mockResolvedValue(mockArticle);

      const result = await service.createSummary(articleId);

      expect(mockArticleModel.findById).toHaveBeenCalledWith(articleId);
      expect(mockVertexAIService.summarizeText).toHaveBeenCalledWith(mockArticle.originalContent);
      expect(mockSummaryModel.create).toHaveBeenCalledWith({
        article: articleId,
        text: summaryText,
        keywords: expect.any(Array),
        readCount: 0,
      });
      expect(mockArticleModel.findByIdAndUpdate).toHaveBeenCalledWith(
        articleId,
        { isSummarized: true }
      );
      expect(result).toEqual(mockSummary);
    });

    it('should throw error if article not found', async () => {
      const articleId = 'non-existent-id';

      mockArticleModel.findById.mockResolvedValue(null);

      await expect(service.createSummary(articleId)).rejects.toThrow(
        'Article not found or has no content'
      );
    });

    it('should throw error if article has no content', async () => {
      const articleId = 'article-id';
      const articleWithoutContent = { ...mockArticle, originalContent: null };

      mockArticleModel.findById.mockResolvedValue(articleWithoutContent);

      await expect(service.createSummary(articleId)).rejects.toThrow(
        'Article not found or has no content'
      );
    });
  });

  describe('getSummaryByArticleId', () => {
    it('should return summary by article id', async () => {
      const articleId = 'article-id';

      mockSummaryModel.findOne.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSummary),
        }),
      });

      const result = await service.getSummaryByArticleId(articleId);

      expect(mockSummaryModel.findOne).toHaveBeenCalledWith({ article: articleId });
      expect(result).toEqual(mockSummary);
    });
  });

  describe('getSummaryById', () => {
    it('should return summary by id and increment read count', async () => {
      const summaryId = 'summary-id';

      mockSummaryModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockSummary),
        }),
      });

      const incrementReadCountSpy = jest.spyOn(service, 'incrementReadCount').mockResolvedValue(mockSummary as any);

      const result = await service.getSummaryById(summaryId);

      expect(mockSummaryModel.findById).toHaveBeenCalledWith(summaryId);
      expect(incrementReadCountSpy).toHaveBeenCalledWith(summaryId);
      expect(result).toEqual(mockSummary);
    });

    it('should return null if summary not found', async () => {
      const summaryId = 'non-existent-id';

      mockSummaryModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.getSummaryById(summaryId);

      expect(result).toBeNull();
    });
  });

  describe('incrementReadCount', () => {
    it('should increment read count for a summary', async () => {
      const summaryId = 'summary-id';
      const updatedSummary = { ...mockSummary, readCount: 1 };

      mockSummaryModel.findByIdAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedSummary),
      });

      const result = await service.incrementReadCount(summaryId);

      expect(mockSummaryModel.findByIdAndUpdate).toHaveBeenCalledWith(
        summaryId,
        { $inc: { readCount: 1 } },
        { new: true }
      );
      expect(result).toEqual(updatedSummary);
    });
  });
});