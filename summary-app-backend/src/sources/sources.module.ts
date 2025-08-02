import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SourcesController } from './sources.controller';
import { SourcesService } from './sources.service';
import { Source, SourceSchema } from '../content/schemas/source.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Article, ArticleSchema } from '../content/schemas/article.schema';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Source.name, schema: SourceSchema },
      { name: User.name, schema: UserSchema },
      { name: Article.name, schema: ArticleSchema },
    ]),
    QueueModule,
  ],
  controllers: [SourcesController],
  providers: [SourcesService],
  exports: [SourcesService],
})
export class SourcesModule {}