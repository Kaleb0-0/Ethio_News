import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { ArticlesModule } from '../articles/articles.module';
import { SummarizationModule } from '../summarization/summarization.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';

@Module({
  imports: [
    ArticlesModule,
    SummarizationModule,
    TypeOrmModule.forFeature([Article]),
  ],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
