import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Source } from './entities/source.entity';
import { Article } from './entities/article.entity';
import { ArticlesService } from './articles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Source, Article])],
  providers: [ArticlesService],
  exports: [ArticlesService, TypeOrmModule],
})
export class ArticlesModule {}
