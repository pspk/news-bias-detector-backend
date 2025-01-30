import { Test, TestingModule } from '@nestjs/testing';
import { NewsAnalysisController } from './news-analysis.controller';

describe('NewsAnalysisController', () => {
  let controller: NewsAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsAnalysisController],
    }).compile();

    controller = module.get<NewsAnalysisController>(NewsAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
