import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUES, JOBS } from '../common/constants/queues';
import { ArticlesService } from '../articles/articles.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import Parser from 'rss-parser';

@Processor(QUEUES.INGESTION)
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);
  private parser: Parser;

  constructor(
    private readonly articlesService: ArticlesService,
    @InjectQueue(QUEUES.SUMMARIZATION) private summarizationQueue: Queue,
  ) {
    super();
    this.parser = new Parser({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      timeout: 10000,
    });
  }

  async process(job: Job) {
    switch (job.name) {
      case JOBS.FETCH_NEWS:
        return this.handleFetchNews();
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleFetchNews() {
    this.logger.log('🔄 Background fetch started...');
    const sources = await this.articlesService.getActiveSources();
    let newArticlesCount = 0;

    for (const source of sources) {
      this.logger.log(`Fetching RSS for: ${source.name}`);
      try {
        const feed = await this.parser.parseURL(source.rssUrl);
        await this.articlesService.resetSourceFailures(source.id);

        for (const item of feed.items) {
          const sourceUrl = item.link?.trim();
          if (!sourceUrl) continue;

          const pubDate = item.pubDate ? new Date(item.pubDate) : null;
          if (!pubDate || isNaN(pubDate.getTime())) continue;

          const exists = await this.articlesService.articleExists(sourceUrl);
          if (!exists) {
            const article = await this.articlesService.createArticle({
              title: item.title?.trim() || 'Untitled',
              sourceUrl,
              pubDate,
              sourceId: source.id,
              language: source.language,
              rawContent: item.contentSnippet || item.content || '',
            });

            // add summarization job for each new article
            await this.summarizationQueue.add(
              JOBS.SUMMARIZE_ARTICLE,
              { articleId: article.id },
              {
                jobId: article.id,
                attempts: 3,
                backoff: { type: 'exponential', delay: 15000 },
              },
            );

            newArticlesCount++;
          }
        }
      } catch (error: any) {
        this.logger.error(`Failed to fetch ${source.name}: ${error.message}`);
        await this.articlesService.handleSourceFailure(source.id);
      }
    }

    this.logger.log(
      `✅ Fetch complete. ${newArticlesCount} new articles queued.`,
    );
    return { newArticlesCount };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.name} completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.name} failed: ${error.message}`);
  }
}
