// src/modules/summarization/summarization.module.ts
import { Module } from '@nestjs/common';
import { SummarizationService } from './summarization.service';

@Module({
  providers: [SummarizationService],
  exports: [SummarizationService], // export so other modules can use it
})
export class SummarizationModule {}
