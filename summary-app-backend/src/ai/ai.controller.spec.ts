import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { VertexAIService } from './vertex-ai.service';
import { SummarizeTextDto } from './dto/summarize-text.dto';

describe('AiController', () => {
  let controller: AiController;
  let vertexAIService: VertexAIService;

  const mockVertexAIService = {
    summarizeText: jest.fn(),
    testConnection: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: VertexAIService,
          useValue: mockVertexAIService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
    vertexAIService = module.get<VertexAIService>(VertexAIService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('summarizeText', () => {
    it('should summarize text successfully', async () => {
      const summarizeTextDto: SummarizeTextDto = {
        text: 'Bu uzun bir metin örneğidir. AI bu metni özetleyecektir.',
      };

      const expectedResult = {
        summary: 'Bu bir özet metnidir.',
        keywords: ['metin', 'özet', 'ai'],
      };

      mockVertexAIService.summarizeText.mockResolvedValue(expectedResult);

      const result = await controller.summarizeText(summarizeTextDto);

      expect(vertexAIService.summarizeText).toHaveBeenCalledWith(summarizeTextDto.text);
      expect(result).toEqual(expectedResult);
    });

    it('should handle summarization errors', async () => {
      const summarizeTextDto: SummarizeTextDto = {
        text: 'Test metin',
      };

      mockVertexAIService.summarizeText.mockRejectedValue(
        new Error('AI service unavailable'),
      );

      await expect(controller.summarizeText(summarizeTextDto)).rejects.toThrow(
        'AI service unavailable',
      );
    });
  });

  describe('testConnection', () => {
    it('should test AI connection successfully', async () => {
      const expectedResult = {
        status: 'success',
        message: 'VertexAI connection successful',
      };

      mockVertexAIService.testConnection.mockResolvedValue(expectedResult);

      const result = await controller.testConnection();

      expect(vertexAIService.testConnection).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle connection test failure', async () => {
      const expectedResult = {
        status: 'error',
        message: 'VertexAI connection failed',
      };

      mockVertexAIService.testConnection.mockResolvedValue(expectedResult);

      const result = await controller.testConnection();

      expect(result).toEqual(expectedResult);
    });
  });
});