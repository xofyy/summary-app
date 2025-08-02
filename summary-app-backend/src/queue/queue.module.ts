import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SummaryProcessor } from './processors/summary.processor';
import { QueueService } from './queue.service';
import { AiModule } from '../ai/ai.module';
import { SummaryModule } from '../summary/summary.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: configService.get('REDIS_PORT') || 6379,
          maxRetriesPerRequest: 3,
          retryDelayOnFailover: 100,
          enableReadyCheck: false,
          lazyConnect: true,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'summary',
    }),
    AiModule,
    SummaryModule,
  ],
  providers: [SummaryProcessor, QueueService],
  exports: [QueueService],
})
export class QueueModule {}