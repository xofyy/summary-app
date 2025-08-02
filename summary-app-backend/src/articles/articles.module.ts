import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from './articles.service';
import { Article, ArticleSchema } from '../content/schemas/article.schema';
import { Source, SourceSchema } from '../content/schemas/source.schema';
import { Summary, SummarySchema } from '../content/schemas/summary.schema';
import { QueueModule } from '../queue/queue.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Article.name, schema: ArticleSchema },
      { name: Source.name, schema: SourceSchema },
      { name: Summary.name, schema: SummarySchema },
    ]),
    QueueModule,
    SummaryModule,
  ],
  controllers: [ArticlesController],
  providers: [ArticlesService],
  exports: [ArticlesService],
})
export class ArticlesModule {}