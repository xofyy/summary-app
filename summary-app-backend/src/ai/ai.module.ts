import { Module } from '@nestjs/common';
import { VertexAIService } from './vertex-ai.service';
import { AiController } from './ai.controller';

@Module({
  providers: [VertexAIService],
  controllers: [AiController],
  exports: [VertexAIService],
})
export class AiModule {}