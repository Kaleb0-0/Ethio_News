import { Controller, Get, Post, Query } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ArticlesService } from '../articles/articles.service';
import { Language } from '../articles/entities/language.enum';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly articlesService: ArticlesService,
  ) {}

  // POST http://localhost:3000/api/ingestion/seed
  // one time use, only for inserting sources
  @Post('seed')
  async seedSources() {
    const defaultSources = [
      {
        name: 'Capital Ethiopia',
        rssUrl: 'https://capitalethiopia.com/feed/',
        language: Language.ENGLISH,
      },
      {
        name: 'BBC Amharic',
        rssUrl: 'https://feeds.bbci.co.uk/amharic/rss.xml', // 100% Reliable
        language: Language.AMHARIC,
      },
      {
        name: 'Borkena',
        rssUrl: 'https://borkena.com/feed/', // Reliable English Ethiopian News
        language: Language.ENGLISH,
      },
    ];

    await this.articlesService.seedSources(defaultSources);
    return { message: 'Sources seeded successfully!' };
  }

  // GET http://localhost:3000/api/ingestion/fetch
  @Get('fetch')
  async fetchNews() {
    return await this.ingestionService.fetchAndSaveNews();
  }

  // ingestion.controller.ts
  @Post('summarize')
  async triggerSummarization() {
    return this.ingestionService.processPendingSummaries();
  }

  // @Get('completed')
  // async getCompleted() {
  //   return this.articlesService.getCompletedArticles();
  // }

  // articles.controller.ts
  @Get()
  async getArticles(
    @Query('category') category?: string,
    @Query('since') since?: string, // timestamp of last fetch
  ) {
    return this.articlesService.getCompletedArticles(category, since);
  }
}
