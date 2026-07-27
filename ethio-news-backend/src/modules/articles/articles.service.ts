import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Article, ArticleStatus } from './entities/article.entity';
import { Source } from './entities/source.entity';

@Injectable()
export class ArticlesService {
  private readonly logger = new Logger(ArticlesService.name);

  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
    @InjectRepository(Source)
    private readonly sourceRepository: Repository<Source>,
  ) {}

  // Helper method: Creates a 32-character MD5 hash of any URL
  // helps for getting faster search result
  public hashUrl(url: string): string {
    return crypto.createHash('md5').update(url.trim()).digest('hex');
  }

  // Check if an article already exists in DB
  async articleExists(sourceUrl: string): Promise<boolean> {
    const urlHash = this.hashUrl(sourceUrl);
    const count = await this.articleRepository.count({ where: { urlHash } });
    return count > 0;
  }

  // Save new article
  async createArticle(data: Partial<Article>): Promise<Article> {
    // what does partial do? makes u able to use some or non of the Article properties
    if (!data.sourceUrl) {
      throw new Error('sourceUrl is required to create an article');
    }

    const urlHash = this.hashUrl(data.sourceUrl);
    const article = this.articleRepository.create({
      ...data,
      urlHash,
    });
    return await this.articleRepository.save(article);
  }

  // Overwrite your existing seedSources method with this:
  // one time use or if you add new sources
  async seedSources(sourcesData: Partial<Source>[]): Promise<void> {
    for (const source of sourcesData) {
      await this.sourceRepository.upsert(
        source,
        { conflictPaths: ['rssUrl'] }, // if rssUrl already exists, update it instead of inserting
      );
    }
  }

  async getActiveSources(): Promise<Source[]> {
    return this.sourceRepository.find({ where: { isActive: true } });
  }

  // get articles waiting to be summarized
  async getUnsummarizedArticles(): Promise<Article[]> {
    return this.articleRepository.find({
      where: { status: ArticleStatus.PENDING },
      take: 10,
    });
  }

  // save summary and mark as completed
  async saveSummary(id: string, summary: any): Promise<void> {
    await this.articleRepository.update(id, {
      headline: summary.headline,
      headlineAmharic: summary.headlineAmharic,
      summary: summary.summary,
      summaryAmharic: summary.summaryAmharic,
      category: summary.category,
      keyEntities: summary.keyEntities,
      detectedLanguage: summary.detectedLanguage,
      status: ArticleStatus.COMPLETED,
      summarizedAt: new Date(),
    });
  }

  // mark as failed if Gemini errors out
  async markAsFailed(id: string): Promise<void> {
    await this.articleRepository.update(id, {
      status: ArticleStatus.FAILED,
    });
  }

  async getCompletedArticles(category?: string, since?: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today midnight

    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999); // end of today

    return this.articleRepository.find({
      where: {
        status: ArticleStatus.COMPLETED,
        pubDate: Between(today, tomorrow),
        ...(category && { category }),
        ...(since && { summarizedAt: MoreThan(new Date(since)) }),
      },
      order: { pubDate: 'DESC' },
      take: 50,
    });
  }

  async handleSourceFailure(sourceId: string): Promise<void> {
    const source = await this.sourceRepository.findOne({
      where: { id: sourceId },
    });

    if (!source) return;

    const newFailureCount = source.failureCount + 1;

    await this.sourceRepository.update(sourceId, {
      failureCount: newFailureCount,
      // deactivate after 5 consecutive failures
      isActive: newFailureCount < 5,
    });

    if (newFailureCount >= 5) {
      this.logger.warn(
        `⚠️ Source deactivated after 5 failures: ${source.name}`,
      );
    }
  }

  async resetSourceFailures(sourceId: string): Promise<void> {
    await this.sourceRepository.update(sourceId, {
      failureCount: 0,
      isActive: true,
    });
  }
}
