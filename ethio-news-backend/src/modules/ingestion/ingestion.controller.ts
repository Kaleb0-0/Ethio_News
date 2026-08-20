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
import * as sourcesData from './sources.json';
import { IngestionService } from './ingestion.service';
import { ArticlesService } from '../articles/articles.service';
import { Language, Type } from '../articles/entities/language.enum';
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
      const defaultSources = sourcesData.rssSources.map((source) => ({
        ...source,
        language: Language[source.language as keyof typeof Language],
        type: Type[source.type as keyof typeof Type],
      }));

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
  // @Post('summarize')
  // @UseGuards(AuthGuard())
  // async triggerSummarization(@GetUser() user: User) {
  //   if (user.role === UserRole.ADMIN) {
  //     return this.ingestionService.fetchAndSaveNews();
  //   } else {
  //     throw new UnauthorizedException();
  //   }
  // }

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
    @Query('lang') lang?: PreferedLanguage,
    @Query('take') take?: string,
    @Query('skip') skip?: string,
    @Req() req?: any,
  ) {
    let language: PreferedLanguage = lang || PreferedLanguage.ENG;

    // if user is logged in and no explicit lang param was provided, use their preferred language
    if (!lang) {
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
    }

    return this.articlesService.getCompletedArticles(language, category, since);
  }

  @Delete('sources')
  @UseGuards(AuthGuard())
  async clearSources() {
    return this.ingestionService.clearSources();
  }

  @Post('reset-failed')
  @UseGuards(AuthGuard())
  async resetFailed(@GetUser() user: User) {
    if (user.role !== UserRole.ADMIN) throw new UnauthorizedException();
    return this.articlesService.resetFailedArticles();
  }
}
