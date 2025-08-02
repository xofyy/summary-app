import { Controller, Get, Post, Body, UseGuards, Request, Param, Put, Delete } from '@nestjs/common';
import { SourcesService } from './sources.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';

@Controller('sources')
@UseGuards(JwtAuthGuard)
export class SourcesController {
  constructor(private readonly sourcesService: SourcesService) {}

  @Get()
  async getUserSources(@Request() req) {
    return this.sourcesService.getUserSources(req.user.id);
  }

  @Get('all')
  async getAllSources() {
    return this.sourcesService.getAllSources();
  }

  @Post('init')
  async initDefaultSources() {
    await this.sourcesService.createDefaultSources();
    return { message: 'Default sources initialized' };
  }

  @Post('validate-rss')
  async validateRssFeed(@Body() body: { url: string }) {
    const isValid = await this.sourcesService.validateRssFeed(body.url);
    return { isValid };
  }

  @Post('custom')
  async addCustomSource(
    @Request() req,
    @Body() createSourceDto: CreateSourceDto
  ) {
    return this.sourcesService.addUserCustomSource(req.user.id, createSourceDto);
  }

  @Put('custom/:id')
  async updateCustomSource(
    @Request() req,
    @Param('id') sourceId: string,
    @Body() updateSourceDto: UpdateSourceDto
  ) {
    return this.sourcesService.updateUserCustomSource(req.user.id, sourceId, updateSourceDto);
  }

  @Delete('custom/:id')
  async removeCustomSource(
    @Request() req,
    @Param('id') sourceId: string
  ) {
    return this.sourcesService.removeUserCustomSource(req.user.id, sourceId);
  }

  @Post()
  async createSource(
    @Body() sourceData: { name: string; url: string; rssFeedUrl: string }
  ) {
    return this.sourcesService.createSource(sourceData);
  }

}