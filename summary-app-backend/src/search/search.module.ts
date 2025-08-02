import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { Summary, SummarySchema } from '../content/schemas/summary.schema';
import { Article, ArticleSchema } from '../content/schemas/article.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Summary.name, schema: SummarySchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}