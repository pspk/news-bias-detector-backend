import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsAnalysisModule } from './news-analysis/news-analysis.module';

@Module({
  imports: [NewsAnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
