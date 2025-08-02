import { Controller, Get } from '@nestjs/common';
import { Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get()
  async checkHealth() {
    const isMongoHealthy = this.mongoConnection.readyState === 1;
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      database: {
        mongodb: isMongoHealthy ? 'connected' : 'disconnected',
      },
      memory: process.memoryUsage(),
    };
  }

  @Get('ready')
  async checkReadiness() {
    const isMongoReady = this.mongoConnection.readyState === 1;
    
    if (!isMongoReady) {
      throw new Error('Database not ready');
    }
    
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('live')
  checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}