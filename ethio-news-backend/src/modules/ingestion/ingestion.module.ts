import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { IngestionController } from './ingestion.controller';
import { ArticlesModule } from '../articles/articles.module';
import { SummarizationModule } from '../summarization/summarization.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../articles/entities/article.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ArticlesModule,
    SummarizationModule,
    AuthModule,
    JwtModule,
    ConfigModule,
    TypeOrmModule.forFeature([Article]),
  ],
  providers: [IngestionService],
  controllers: [IngestionController],
})
export class IngestionModule {}
