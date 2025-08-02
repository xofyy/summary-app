import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { SearchService } from './search.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: 'relevance' | 'date' | 'readCount' = 'relevance',
    @Request() req
  ) {
    const user = req.user;
    const userInterests = user.interests || [];

    return this.searchService.searchAll(query, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      userInterests
    });
  }

  @Get('summaries')
  async searchSummaries(
    @Query('q') query: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('sortBy') sortBy: string = 'relevance',
    @Request() req
  ) {
    const user = req.user;
    const userInterests = user.interests || [];
    const skip = (parseInt(page) - 1) * parseInt(limit);

    return this.searchService.searchSummaries(
      query,
      skip,
      parseInt(limit),
      sortBy,
      userInterests
    );
  }

  @Get('suggestions')
  async getSearchSuggestions(@Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.searchService.getSearchSuggestions(query.trim());
  }

  @Get('popular-keywords')
  async getPopularKeywords() {
    return this.searchService.getPopularKeywords();
  }
}