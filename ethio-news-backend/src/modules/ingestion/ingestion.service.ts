import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
// import Parser from 'rss-parser';
import { ArticlesService } from '../articles/articles.service';
import { Cron, CronExpression } from '@nestjs/schedule';
// import { SummarizationService } from '../summarization/summarization.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Article, ArticleStatus } from '../articles/entities/article.entity';
// import { Repository } from 'typeorm';
// import { FreeNewsService } from './free-news.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, JOBS } from '../common/constants/queues';
import * as sourcesData from './sources.json';
import { Language, Type } from '../articles/entities/language.enum';

@Injectable()
export class IngestionService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IngestionService.name);
  // private parser: Parser;

  constructor(
    // @InjectRepository(Article)
    // private readonly articleRepository: Repository<Article>,
    private readonly articlesService: ArticlesService,
    // private readonly summarizationService: SummarizationService,
    // private readonly freeNewsService: FreeNewsService,
    @InjectQueue(QUEUES.INGESTION) private ingestionQueue: Queue,
  ) {
    // this.parser = new Parser({
    //   headers: {
    //     // Spoof a modern browser user agent
    //     'User-Agent':
    //       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    //     Accept:
    //       'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    //   },
    //   timeout: 10000,
    //   customFields: {
    //     item: [
    //       ['media:content', 'mediaContent'],
    //       ['media:thumbnail', 'mediaThumbnail'],
    //       'enclosure',
    //     ],
    //   },
    // });
  }

  async onApplicationBootstrap() {
    this.logger.log('🌱 Auto-seeding sources on startup...');
    const defaultSources = sourcesData.rssSources.map((source) => ({
      ...source,
      language: Language[source.language as keyof typeof Language],
      type: Type[source.type as keyof typeof Type],
    }));
    await this.articlesService.seedSources(defaultSources);
    this.logger.log('✅ Sources seeded. Adding initial fetch job...');
    await this.ingestionQueue.add(JOBS.FETCH_NEWS, {});
  }

  //auto fetch
  @Cron(CronExpression.EVERY_HOUR)
  async scheduledIngestion() {
    this.logger.log('⏰ Adding fetch job to queue...');
    await this.ingestionQueue.add(JOBS.FETCH_NEWS, {});
  }

  async fetchAndSaveNews() {
    await this.ingestionQueue.add(JOBS.FETCH_NEWS, {});
    return { message: 'Fetch job added to queue' };
    //   this.logger.log('Starting news ingestion cycle...');
    //   const sources = await this.articlesService.getActiveSources();

    //   let newArticlesCount = 0;

    //   for (const source of sources) {
    //     this.logger.log(`Fetching RSS for: ${source.name}`);
    //     try {
    //       const feed = await this.parser.parseURL(source.rssUrl);

    //       // reset failure count on success
    //       await this.articlesService.resetSourceFailures(source.id);

    //       for (const item of feed.items) {
    //         const sourceUrl = item.link?.trim();
    //         if (!sourceUrl) continue;

    //         const pubDate = item.pubDate ? new Date(item.pubDate) : null;
    //         if (!pubDate || isNaN(pubDate.getTime())) continue;

    //         const today = new Date();
    //         const isToday =
    //           pubDate.getDate() === today.getDate() &&
    //           pubDate.getMonth() === today.getMonth() &&
    //           pubDate.getFullYear() === today.getFullYear();

    //         if (!isToday) continue; // skip old articles

    //         const imageUrl =
    //           (item as any).mediaContent?.$.url ||
    //           (item as any).mediaThumbnail?.$.url ||
    //           item.enclosure?.url ||
    //           null;
    //         // Check for duplicates using our fast MD5 hash!
    //         const exists = await this.articlesService.articleExists(sourceUrl);
    //         if (!exists) {
    //           await this.articlesService.createArticle({
    //             title: item.title?.trim() || 'Untitled',
    //             sourceUrl: sourceUrl,
    //             pubDate: pubDate,
    //             sourceId: source.id,
    //             language: source.language,
    //             rawContent: item.contentSnippet || item.content || '',
    //             imageUrl: imageUrl,
    //           });
    //           newArticlesCount++;
    //         }
    //       }
    //     } catch (error: any) {
    //       this.logger.error(`Failed to fetch ${source.name}: ${error.message}`);
    //       await this.articlesService.handleSourceFailure(source.id);
    //     }
    //   }

    //   const freeResult = await this.freeNewsService.fetchAndSaveFreeNews();
    //   newArticlesCount += freeResult.newArticlesSaved;
    //   if (!freeResult.success) {
    //     this.logger.warn(
    //       `Free news API fetch completed with errors: ${freeResult.errors.join(
    //         ' | ',
    //       )}`,
    //     );
    //   }

    //   this.logger.log(
    //     `Ingestion complete! Saved ${newArticlesCount} new articles.`,
    //   );
    //   return { success: true, newArticlesSaved: newArticlesCount };
  }

  async clearSources() {
    await this.articlesService.clearAllSources();
    return { success: true };
  }
}
