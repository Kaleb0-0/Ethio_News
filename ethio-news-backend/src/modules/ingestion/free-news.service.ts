import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import { ArticlesService } from '../articles/articles.service';
import { ArticleStatus } from '../articles/entities/article.entity';

@Injectable()
export class FreeNewsService {
  private readonly logger = new Logger(FreeNewsService.name);
  private readonly endpoint: string;
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly articlesService: ArticlesService,
  ) {
    this.endpoint = this.configService.get<string>(
      'FREE_NEWS_API_ENDPOINT',
      'https://gnews.io/api/v4/search?q=ethiopia&lang=en&max=25',
    );
    this.apiKey = this.configService.get<string>('FREE_NEWS_API_KEY', '');
  }

  async fetchAndSaveFreeNews(): Promise<{
    success: boolean;
    newArticlesSaved: number;
    errors: string[];
  }> {
    if (!this.apiKey) {
      const warning =
        'FREE_NEWS_API_KEY is not configured. Free news fetch skipped.';
      this.logger.warn(warning);
      return { success: false, newArticlesSaved: 0, errors: [warning] };
    }

    try {
      const response = await axios.get(this.endpoint, {
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
        params: {
          apikey: this.apiKey,
        },
      });

      const items =
        Array.isArray(response.data.articles) && response.data.articles.length
          ? response.data.articles
          : Array.isArray(response.data.results)
            ? response.data.results
            : [];

      let newArticlesCount = 0;

      for (const item of items) {
        const sourceUrl = item.url?.trim();
        if (!sourceUrl) continue;

        const pubDate = this.parsePublishedAt(
          item.publishedAt || item.published_at,
        );
        if (!pubDate) continue;

        const exists = await this.articlesService.articleExists(sourceUrl);
        if (exists) continue;

        await this.articlesService.createArticle({
          title: item.title?.trim() || 'Untitled',
          sourceUrl,
          pubDate,
          rawContent: item.content || item.description || '',
          imageUrl: item.image || null,
          status: ArticleStatus.PENDING,
          language: item.language || undefined,
        });

        newArticlesCount++;
      }

      return { success: true, newArticlesSaved: newArticlesCount, errors: [] };
    } catch (error: any) {
      const message =
        error?.message || 'Unknown error while fetching free news API';
      this.logger.error(`Free news fetch failed: ${message}`);
      return { success: false, newArticlesSaved: 0, errors: [message] };
    }
  }

  private parsePublishedAt(value: unknown): Date | null {
    if (!value) return null;
    const date = new Date(String(value));
    return isNaN(date.getTime()) ? null : date;
  }
}
