import { Injectable, Logger } from '@nestjs/common';
import Parser from 'rss-parser';
import { ArticlesService } from '../articles/articles.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SummarizationService } from '../summarization/summarization.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Article, ArticleStatus } from '../articles/entities/article.entity';
import { Repository } from 'typeorm';
import { FreeNewsService } from './free-news.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);
  private parser: Parser;

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    private readonly articlesService: ArticlesService,
    private readonly summarizationService: SummarizationService,
    private readonly freeNewsService: FreeNewsService,
  ) {
    this.parser = new Parser({
      headers: {
        // Spoof a modern browser user agent
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      },
      timeout: 10000,
      customFields: {
        item: [
          ['media:content', 'mediaContent'],
          ['media:thumbnail', 'mediaThumbnail'],
          'enclosure',
        ],
      },
    });
  }

  //auto fetch
  @Cron(CronExpression.EVERY_HOUR) // runs every hour automatically NOTE: take user opinion on this
  async scheduledIngestion() {
    this.logger.log('⏰ Scheduled ingestion triggered...');
    await this.fetchAndSaveNews();
  }

  //auto summarizes every hour after 5 min
  @Cron('5 * * * *')
  async processPendingSummaries() {
    this.logger.log('🤖 Processing unsummarized articles...');

    let totalSummarized = 0;

    while (true) {
      const pending = await this.articlesService.getUnsummarizedArticles();

      if (pending.length === 0) break; // no more pending, stop

      this.logger.log(`Found ${pending.length} articles to summarize`);

      for (const article of pending) {
        if (!article.rawContent) {
          await this.articlesService.markAsFailed(article.id);
          continue;
        }

        await this.articleRepository.update(article.id, {
          status: ArticleStatus.PROCESSING,
        });

        const result = await this.summarizationService.summarizeArticle(
          article.rawContent,
          article.title,
        );

        if (result) {
          await this.articlesService.saveSummary(article.id, result);
          this.logger.log(`✅ Summarized: ${article.title}`);
          totalSummarized++;
        } else {
          await this.articlesService.markAsFailed(article.id);
          this.logger.warn(`❌ Failed: ${article.title}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    this.logger.log(
      `✅ Summarization cycle complete. Total: ${totalSummarized}`,
    );
  }

  async fetchAndSaveNews() {
    this.logger.log('Starting news ingestion cycle...');
    const sources = await this.articlesService.getActiveSources();

    let newArticlesCount = 0;

    for (const source of sources) {
      this.logger.log(`Fetching RSS for: ${source.name}`);
      try {
        const feed = await this.parser.parseURL(source.rssUrl);

        // reset failure count on success
        await this.articlesService.resetSourceFailures(source.id);

        for (const item of feed.items) {
          const sourceUrl = item.link?.trim();
          if (!sourceUrl) continue;

          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          if (!pubDate || isNaN(pubDate.getTime())) continue;

          const today = new Date();
          const isToday =
            pubDate.getDate() === today.getDate() &&
            pubDate.getMonth() === today.getMonth() &&
            pubDate.getFullYear() === today.getFullYear();

          if (!isToday) continue; // skip old articles

          const imageUrl =
            (item as any).mediaContent?.$.url ||
            (item as any).mediaThumbnail?.$.url ||
            item.enclosure?.url ||
            null;
          // Check for duplicates using our fast MD5 hash!
          const exists = await this.articlesService.articleExists(sourceUrl);
          if (!exists) {
            await this.articlesService.createArticle({
              title: item.title?.trim() || 'Untitled',
              sourceUrl: sourceUrl,
              pubDate: pubDate,
              sourceId: source.id,
              language: source.language,
              rawContent: item.contentSnippet || item.content || '',
              imageUrl: imageUrl,
            });
            newArticlesCount++;
          }
        }
      } catch (error: any) {
        this.logger.error(`Failed to fetch ${source.name}: ${error.message}`);
        await this.articlesService.handleSourceFailure(source.id);
      }
    }

    const freeResult = await this.freeNewsService.fetchAndSaveFreeNews();
    newArticlesCount += freeResult.newArticlesSaved;
    if (!freeResult.success) {
      this.logger.warn(
        `Free news API fetch completed with errors: ${freeResult.errors.join(
          ' | ',
        )}`,
      );
    }

    this.logger.log(
      `Ingestion complete! Saved ${newArticlesCount} new articles.`,
    );
    return { success: true, newArticlesSaved: newArticlesCount };
  }

  async clearSources() {
    await this.articlesService.clearAllSources();
    return { success: true };
  }
}
