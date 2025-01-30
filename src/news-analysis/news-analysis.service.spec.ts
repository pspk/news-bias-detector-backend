import { Test, TestingModule } from '@nestjs/testing';
import { NewsAnalysisService } from './news-analysis.service';

describe('NewsAnalysisService', () => {
  let service: NewsAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewsAnalysisService],
    }).compile();

    service = module.get<NewsAnalysisService>(NewsAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
