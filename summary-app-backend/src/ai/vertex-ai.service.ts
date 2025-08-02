import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { VertexAI } from '@google-cloud/vertexai';

export interface SummaryResult {
  summary: string;
  keywords: string[];
}

export enum SummaryLength {
  SHORT = 'short',
  MEDIUM = 'medium', 
  LONG = 'long'
}

export enum SummaryStyle {
  FORMAL = 'formal',
  CASUAL = 'casual',
  TECHNICAL = 'technical',
  SIMPLIFIED = 'simplified'
}

export interface SummaryOptions {
  length?: SummaryLength;
  style?: SummaryStyle;
  language?: string;
  includeKeyQuotes?: boolean;
}

@Injectable()
export class VertexAIService {
  private readonly logger = new Logger(VertexAIService.name);
  private vertexAI: VertexAI;
  private model: any;

  constructor() {
    try {
      this.vertexAI = new VertexAI({
        project: process.env.GOOGLE_CLOUD_PROJECT_ID,
        location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
      });

      this.model = this.vertexAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
      });

      this.logger.log('VertexAI service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize VertexAI service', error);
      throw new InternalServerErrorException('AI service initialization failed');
    }
  }

  async summarizeText(text: string, options?: SummaryOptions): Promise<SummaryResult> {
    try {
      // Input validation
      if (!text || typeof text !== 'string') {
        throw new Error('Text input is required and must be a string');
      }

      const trimmedText = text.trim();
      if (trimmedText.length === 0) {
        throw new Error('Text input cannot be empty');
      }

      if (trimmedText.length > 50000) {
        this.logger.warn(`Text too long (${trimmedText.length} chars), truncating to 50000 chars`);
        text = trimmedText.substring(0, 50000);
      }

      this.logger.debug(`Summarizing text of length: ${text.length}`);

      const prompt = this.buildPrompt(text, options);

      // Add retry mechanism for API calls
      let lastError: Error | undefined;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const result = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1000,
              temperature: 0.1,
              topP: 0.8,
            },
          });

          const response = result?.response;
          if (!response) {
            throw new Error('No response received from VertexAI');
          }

          const candidates = response.candidates;
          if (!candidates || candidates.length === 0) {
            throw new Error('No candidates in VertexAI response');
          }

          const candidate = candidates[0];
          if (!candidate?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response structure from VertexAI');
          }

          const generatedText = candidate.content.parts[0].text;

          let parsedResult: SummaryResult;
          try {
            const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
            parsedResult = JSON.parse(cleanedText);
          } catch (parseError) {
            this.logger.warn('Failed to parse AI response as JSON, using fallback parsing');
            
            // Try to extract summary and keywords manually
            const summaryMatch = generatedText.match(/"summary":\s*"([^"]+)"/);
            const keywordsMatch = generatedText.match(/"keywords":\s*\[(.*?)\]/);
            
            if (summaryMatch) {
              const keywordsList = keywordsMatch 
                ? keywordsMatch[1].split(',').map(k => k.trim().replace(/"/g, ''))
                : this.extractKeywordsFromText(text);
              
              parsedResult = {
                summary: summaryMatch[1],
                keywords: keywordsList,
              };
            } else {
              // Last resort fallback
              parsedResult = {
                summary: this.createFallbackSummary(text),
                keywords: this.extractKeywordsFromText(text),
              };
            }
          }

          // Validate and sanitize result
          if (!parsedResult.summary || typeof parsedResult.summary !== 'string') {
            parsedResult.summary = this.createFallbackSummary(text);
          }

          if (!Array.isArray(parsedResult.keywords)) {
            parsedResult.keywords = this.extractKeywordsFromText(text);
          }

          // Ensure keywords are strings and not empty
          parsedResult.keywords = parsedResult.keywords
            .filter(k => k && typeof k === 'string')
            .map(k => k.trim())
            .filter(k => k.length > 0)
            .slice(0, 10); // Limit to 10 keywords

          if (parsedResult.keywords.length === 0) {
            parsedResult.keywords = this.extractKeywordsFromText(text);
          }

          this.logger.debug('Successfully generated summary');
          return parsedResult;

        } catch (attemptError) {
          lastError = attemptError;
          this.logger.warn(`Attempt ${attempt} failed:`, attemptError.message);
          
          if (attempt < 3) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
          }
        }
      }

      // If all attempts failed, return fallback summary
      this.logger.error('All attempts failed, using fallback summary', lastError || new Error('Unknown error'));
      return {
        summary: this.createFallbackSummary(text),
        keywords: this.extractKeywordsFromText(text),
      };

    } catch (error) {
      this.logger.error('Critical error in summarizeText', error);
      
      // Return fallback summary instead of throwing
      return {
        summary: this.createFallbackSummary(text),
        keywords: this.extractKeywordsFromText(text),
      };
    }
  }

  private createFallbackSummary(text: string): string {
    try {
      if (!text || typeof text !== 'string') {
        return 'İçerik özetlenemedi.';
      }

      const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

      if (sentences.length === 0) {
        return 'Özet oluşturulamadı: Geçerli cümle bulunamadı.';
      }

      // Take first 2-3 sentences as fallback summary
      const summaryLength = Math.min(3, sentences.length);
      const summary = sentences.slice(0, summaryLength).join('. ') + '.';
      
      // Truncate if too long
      return summary.length > 500 ? summary.substring(0, 497) + '...' : summary;
    } catch (error) {
      this.logger.error('Error creating fallback summary', error);
      return 'Özet oluşturulamadı.';
    }
  }

  private buildPrompt(text: string, options?: SummaryOptions): string {
    const length = options?.length || SummaryLength.MEDIUM;
    const style = options?.style || SummaryStyle.FORMAL;
    const language = options?.language || 'Turkish';
    const includeKeyQuotes = options?.includeKeyQuotes || false;

    let lengthInstruction = '';
    switch (length) {
      case SummaryLength.SHORT:
        lengthInstruction = '1-2 sentences maximum';
        break;
      case SummaryLength.MEDIUM:
        lengthInstruction = '3-4 sentences';
        break;
      case SummaryLength.LONG:
        lengthInstruction = '5-7 sentences with more detail';
        break;
    }

    let styleInstruction = '';
    switch (style) {
      case SummaryStyle.FORMAL:
        styleInstruction = 'Use formal, professional language';
        break;
      case SummaryStyle.CASUAL:
        styleInstruction = 'Use casual, conversational language';
        break;
      case SummaryStyle.TECHNICAL:
        styleInstruction = 'Use technical terminology and precise language';
        break;
      case SummaryStyle.SIMPLIFIED:
        styleInstruction = 'Use simple, easy-to-understand language';
        break;
    }

    let quotesInstruction = '';
    if (includeKeyQuotes) {
      quotesInstruction = '3. Key quotes from the text (if any noteworthy quotes exist)';
    }

    return `
      Please analyze the following text and provide:
      1. A summary (${lengthInstruction}) in ${language}
      2. Key topics/keywords (in ${language})
      ${quotesInstruction}

      Writing style: ${styleInstruction}
      
      Format your response as JSON with the following structure:
      {
        "summary": "Your summary here...",
        "keywords": ["keyword1", "keyword2", "keyword3"]${includeKeyQuotes ? ',\n        "quotes": ["quote1", "quote2"]' : ''}
      }

      Text to analyze:
      ${text}
    `;
  }

  private extractKeywordsFromText(text: string): string[] {
    try {
      if (!text || typeof text !== 'string') {
        return ['içerik', 'haber'];
      }

      // Common Turkish stop words to filter out
      const stopWords = new Set([
        'bir', 'bu', 'şu', 've', 'ile', 'için', 'olan', 'olarak', 'da', 'de',
        'daha', 'çok', 'tüm', 'her', 'gibi', 'kadar', 'sonra', 'önce', 'ama',
        'fakat', 'ancak', 'veya', 'yahut', 'hem', 'hep', 'hiç', 'şey', 'zaman'
      ]);

      const words = text
        .toLowerCase()
        .replace(/[^\wşçğüöıİĞÜŞÖÇ\s]/g, '') // Include Turkish characters
        .split(/\s+/)
        .filter(word => word.length > 3 && !stopWords.has(word))
        .filter(word => !/^\d+$/.test(word)); // Filter out pure numbers

      if (words.length === 0) {
        return ['makale', 'haber'];
      }

      const wordFreq = new Map<string, number>();
      words.forEach(word => {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      });

      const keywords = Array.from(wordFreq.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word]) => word)
        .filter(word => word.length > 2);

      return keywords.length > 0 ? keywords : ['genel', 'haber'];
    } catch (error) {
      this.logger.warn('Error extracting keywords from text', error);
      return ['haber', 'makale'];
    }
  }

  async testConnection(): Promise<{ status: string; message: string }> {
    try {
      const testText = 'This is a simple test to verify that the VertexAI service is working properly.';
      const result = await this.summarizeText(testText);
      
      return {
        status: 'success',
        message: 'VertexAI connection successful',
      };
    } catch (error) {
      this.logger.error('VertexAI connection test failed', error);
      return {
        status: 'error',
        message: 'VertexAI connection failed',
      };
    }
  }
}