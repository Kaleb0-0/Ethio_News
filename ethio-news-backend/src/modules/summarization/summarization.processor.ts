import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { QUEUES, JOBS } from '../common/constants/queues';
import { ArticlesService } from '../articles/articles.service';
import { SummarizationService } from './summarization.service';
import { AuthService } from '../auth/auth.service';
import { ArticleStatus } from '../articles/entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article } from '../articles/entities/article.entity';

@Processor(QUEUES.SUMMARIZATION, { concurrency: 1 })
export class SummarizationProcessor extends WorkerHost {
  private readonly logger = new Logger(SummarizationProcessor.name);
  private summarizedCount = 0;

  constructor(
    private readonly articlesService: ArticlesService,
    private readonly summarizationService: SummarizationService,
    private readonly authService: AuthService,
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case JOBS.SUMMARIZE_ARTICLE:
        return this.handleSummarize(job.data.articleId);
      case JOBS.SEND_PUSH:
        return this.handleSendPush(job.data.count);
      default:
        this.logger.warn(`Unknown job: ${job.name}`);
    }
  }

  private async handleSummarize(articleId: string) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const article = await this.articleRepository.findOne({
      where: { id: articleId },
    });

    if (!article || !article.rawContent || article.rawContent.trim() === '') {
      this.logger.warn(`Skipping article ${articleId} - no content`);
      await this.articlesService.markAsFailed(articleId);
      return; // don't throw, just skip
    }

    if (!article || !article.rawContent) {
      await this.articlesService.markAsFailed(articleId);
      return;
    }

    await this.articleRepository.update(articleId, {
      status: ArticleStatus.PROCESSING,
    });

    const result = await this.summarizationService.summarizeArticle(
      article.rawContent,
      article.title,
    );

    if (result) {
      await this.articlesService.saveSummary(articleId, result);
      this.summarizedCount++;
      this.logger.log(`✅ Summarized: ${article.title}`);
    } else {
      await this.articlesService.markAsFailed(articleId);
      throw new Error(`Summarization failed for article ${articleId}`);
    }
  }

  private async handleSendPush(count: number) {
    await this.authService.sendPushToAll(
      '📰 EthioNews Update',
      `${count} new article${count > 1 ? 's are' : ' is'} ready to read.`,
    );
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
