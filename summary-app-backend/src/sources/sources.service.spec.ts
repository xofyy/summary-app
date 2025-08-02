import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { SourcesService } from './sources.service';
import { Source } from '../content/schemas/source.schema';
import { Model } from 'mongoose';

describe('SourcesService', () => {
  let service: SourcesService;
  let sourceModel: Model<Source>;

  const mockSource = {
    _id: 'source-id',
    name: 'Test Source',
    url: 'https://example.com',
    rssFeedUrl: 'https://example.com/rss',
  };

  const mockSourceModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourcesService,
        {
          provide: getModelToken(Source.name),
          useValue: mockSourceModel,
        },
      ],
    }).compile();

    service = module.get<SourcesService>(SourcesService);
    sourceModel = module.get<Model<Source>>(getModelToken(Source.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllSources', () => {
    it('should return all sources', async () => {
      const mockSources = [mockSource];

      mockSourceModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockSources),
      });

      const result = await service.getAllSources();

      expect(mockSourceModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockSources);
    });
  });

  describe('createSource', () => {
    it('should create a new source', async () => {
      const sourceData = {
        name: 'New Source',
        url: 'https://newsource.com',
        rssFeedUrl: 'https://newsource.com/rss',
      };

      mockSourceModel.create.mockResolvedValue(mockSource);

      const result = await service.createSource(sourceData);

      expect(mockSourceModel.create).toHaveBeenCalledWith(sourceData);
      expect(result).toEqual(mockSource);
    });
  });

  describe('createDefaultSources', () => {
    it('should create default sources if they do not exist', async () => {
      // Mock that no sources exist
      mockSourceModel.findOne.mockResolvedValue(null);
      mockSourceModel.create.mockResolvedValue(mockSource);

      await service.createDefaultSources();

      // Should check for each default source
      expect(mockSourceModel.findOne).toHaveBeenCalledTimes(4);
      
      // Should create each default source
      expect(mockSourceModel.create).toHaveBeenCalledTimes(4);
      
      // Check that TechCrunch source is created
      expect(mockSourceModel.create).toHaveBeenCalledWith({
        name: 'TechCrunch',
        url: 'https://techcrunch.com',
        rssFeedUrl: 'https://techcrunch.com/feed/'
      });
    });

    it('should not create sources that already exist', async () => {
      // Mock that all sources already exist
      mockSourceModel.findOne.mockResolvedValue(mockSource);

      await service.createDefaultSources();

      // Should check for each default source
      expect(mockSourceModel.findOne).toHaveBeenCalledTimes(4);
      
      // Should not create any sources
      expect(mockSourceModel.create).not.toHaveBeenCalled();
    });
  });
});