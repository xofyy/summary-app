import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { SummaryFallbackService } from './summary-fallback.service';
import { Summary, SummarySchema } from '../content/schemas/summary.schema';
import { Article, ArticleSchema } from '../content/schemas/article.schema';
import { Source, SourceSchema } from '../content/schemas/source.schema';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Summary.name, schema: SummarySchema },
      { name: Article.name, schema: ArticleSchema },
      { name: Source.name, schema: SourceSchema },
    ]),
    AiModule,
  ],
  controllers: [SummaryController],
  providers: [SummaryService, SummaryFallbackService],
  exports: [SummaryService, SummaryFallbackService],
})
export class SummaryModule {}