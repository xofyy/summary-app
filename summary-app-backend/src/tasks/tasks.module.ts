import { Module, forwardRef } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ArticlesModule } from '../articles/articles.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [ArticlesModule, SummaryModule],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}