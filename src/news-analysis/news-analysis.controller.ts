import {
    Controller,
    Get,
    Query,
    Res,
    Req,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { Response, Request } from 'express';
  import { NewsAnalysisService } from './news-analysis.service';
  
  @Controller('news-analysis')
  export class NewsAnalysisController {
    constructor(private readonly newsAnalysisService: NewsAnalysisService) {}
  
    @Get()
    async analyzeNews(
      @Query('url') url: string,
      @Req() req: Request,
      @Res() res: Response,
    ) {
      try {
        if (!url || !this.isValidUrl(url)) {
          throw new HttpException(
            'Invalid URL provided. Please provide a well-formed URL.',
            HttpStatus.BAD_REQUEST,
          );
        }
  
        console.log(`Fetching article for URL: ${url}`);
  
        const articleText = await this.newsAnalysisService.fetchArticle(url);
  
        if (!articleText) {
          throw new HttpException(
            'Failed to extract content from the provided URL.',
            HttpStatus.NOT_FOUND,
          );
        }
  
        const htmlResponse =
          await this.newsAnalysisService.analyzeBias(articleText);
  
        // Handle AJAX (frontend) request case
        if (req.headers.accept?.includes('application/json')) {
          return res.json({ success: true, html: htmlResponse });
        }
  
        // Serve raw HTML if accessed directly via browser
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlResponse);
      } catch (error) {
        console.error('Error in analysis:', error);
  
        // Send a more specific error response if available
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : HttpStatus.INTERNAL_SERVER_ERROR;
        const errorMessage = error.message || 'Internal Server Error';
  
        res.status(statusCode).json({
          success: false,
          error: errorMessage,
        });
      }
    }
  
    /**
     * Helper function to validate URLs.
     */
    private isValidUrl(url: string): boolean {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
  }
  

