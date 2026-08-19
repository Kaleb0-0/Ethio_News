// src/modules/summarization/summarization.module.ts
import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';
import { BullModule } from '@nestjs/bullmq';
import { QUEUES } from '../common/constants/queues';
import { SummarizationProcessor } from './summarization.processor';
import { ArticlesModule } from '../articles/articles.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: QUEUES.SUMMARIZATION }),
    ArticlesModule,
    AuthModule,
  ],
  providers: [SummarizationService, SummarizationProcessor],
  exports: [SummarizationService], // export so other modules can use it
})
export class SummarizationModule {}
