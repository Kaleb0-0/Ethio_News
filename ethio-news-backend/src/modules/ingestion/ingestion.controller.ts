import {
  Controller,
  Delete,
  Get,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ArticlesService } from '../articles/articles.service';
import { Language } from '../articles/entities/language.enum';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../auth/user.entity';
import { UserRole } from '../auth/user-role.enum';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { PreferedLanguage } from '../auth/prefered-language.enum';
import { ConfigService } from '@nestjs/config';

@Controller('ingestion')
export class IngestionController {
  constructor(
    private readonly ingestionService: IngestionService,
    private readonly articlesService: ArticlesService,
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // POST http://localhost:3000/api/ingestion/seed
  // one time use, only for inserting sources
  @Post('seed')
  @UseGuards(AuthGuard())
  async seedSources(@GetUser() user: User) {
    if (user.role === UserRole.ADMIN) {
      const defaultSources = [
        // English sources
        {
          // too much short data not enough details
          name: 'Google News Ethiopia',
          rssUrl:
            'https://news.google.com/rss/search?q=ethiopia&hl=en-ET&gl=ET&ceid=ET:en',
          language: Language.ENGLISH,
          isActive: false,
        },
        {
          name: 'Addis Fortune',
          rssUrl: 'https://addisfortune.news/feed/',
          language: Language.ENGLISH,
          isActive: true,
        },
        {
          name: 'Ethiopia Insight',
          rssUrl: 'https://ethiopia-insight.com/feed/',
          language: Language.ENGLISH,
          isActive: true,
        },
        {
          name: 'Tadias',
          rssUrl: 'https://tadias.com/feed/atom/',
          language: Language.ENGLISH,
          isActive: true,
        },
        {
          name: 'AllAfrica Ethiopia',
          rssUrl:
            'https://allafrica.com/tools/headlines/rdf/ethiopia/headlines.rdf',
          language: Language.ENGLISH,
          isActive: true,
        },
        {
          name: 'Ethiopia Nege',
          rssUrl: 'https://ethiopianege.com/feed/',
          language: Language.ENGLISH,
          isActive: true,
        },
        {
          name: 'Maleda Times',
          rssUrl: 'https://maledatimes.com/feed/',
          language: Language.ENGLISH,
          isActive: true,
        },
        // Amharic sources
        {
          name: 'BBC Amharic',
          rssUrl: 'https://feeds.bbci.co.uk/amharic/rss.xml',
          language: Language.AMHARIC,
          isActive: true,
        },
        {
          name: 'DW Amharic',
          rssUrl: 'https://rss.dw.com/rdf/rss-eth-amh',
          language: Language.AMHARIC,
          isActive: false,
        },
      ];

      await this.articlesService.seedSources(defaultSources);
      return { message: 'Sources seeded successfully!' };
    } else {
      throw new UnauthorizedException();
    }
  }

  // GET http://localhost:3000/api/ingestion/fetch
  @Get('fetch')
  @UseGuards(AuthGuard())
  async fetchNews(@GetUser() user: User) {
    if (user.role === UserRole.ADMIN) {
      return await this.ingestionService.fetchAndSaveNews();
    } else {
      throw new UnauthorizedException();
    }
  }

  // ingestion.controller.ts
  @Post('summarize')
  @UseGuards(AuthGuard())
  async triggerSummarization(@GetUser() user: User) {
    if (user.role === UserRole.ADMIN) {
      return this.ingestionService.processPendingSummaries();
    } else {
      throw new UnauthorizedException();
    }
  }

  // @Get('completed')
  // async getCompleted() {
  //   return this.articlesService.getCompletedArticles();
  // }

  // articles.controller.ts
  @Get()
  async getArticles(
    // @GetUser() user: User,
    @Query('category') category?: string,
    @Query('since') since?: string,
    @Query('lang') lang?: PreferedLanguage, // fallback for unauthenticated users
    @Req() req?: any,
  ) {
    let language: PreferedLanguage = lang || PreferedLanguage.ENG; // default to English

    // if user is logged in, use their preferred language
    try {
      const token = req?.headers?.authorization?.split(' ')[1];
      if (token) {
        const userLang = await this.authService.getLang(token);

        if (userLang) language = userLang;
      }
    } catch (err: any) {
      // not logged in, use the lang param or default
      console.log('ERROR:', err.message);
    }

    return this.articlesService.getCompletedArticles(language, category, since);
  }

  @Delete('sources')
  @UseGuards(AuthGuard())
  async clearSources() {
    return this.ingestionService.clearSources();
  }
}
