import { Module } from '@nestjs/common';
import { NewsAnalysisController } from './news-analysis.controller';
import { NewsAnalysisService } from './news-analysis.service';

@Module({
  controllers: [NewsAnalysisController],
  providers: [NewsAnalysisService]
})
export class NewsAnalysisModule {}
