import { Controller, Get, Head } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/ping')
  @Head('/ping')
  ping(): { status: string; timestamp: number } {
    return {
      status: 'ok',
      timestamp: Date.now()
    };
  }
}
