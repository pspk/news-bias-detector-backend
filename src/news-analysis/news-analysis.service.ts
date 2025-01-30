import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio'; // For web scraping
import { SourceTextModule } from 'vm';

@Injectable()
export class NewsAnalysisService {
  private OPENAI_API_KEY =
    'xxx';

  async analyzeBias(articleText: string): Promise<string> {
    const prompt = `
        Analyze the bias of the following news article and return the results in JSON format.
    
        Output Format:
        {
            "politicalLeaning": {
                "liberal": [numeric score between 0-100],
                "conservative": [numeric score between 0-100]
            },
            "biasIndicators": {
                "criticalLanguage": [numeric score between 0-100],
                "judgmentalPhrasing": [numeric score between 0-100],
                "oneSidedReporting": [numeric score between 0-100]
            },
            "explanation": "[Provide a detailed explanation of the scores]"
        }
    
        Analyze this article:
        "${articleText}"
        `;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        },
        {
          headers: { Authorization: `Bearer ${this.OPENAI_API_KEY}` },
        },
      );

      const responseContent = response.data.choices[0].message.content;
      const gptResult = JSON.parse(responseContent);

      // ✅ Generate and return the HTML content
      return this.generateHTML(gptResult, articleText);
    } catch (error) {
      console.error('Error analyzing bias:', error);
      throw new HttpException(
        'Failed to analyze bias',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  private generateHTML(gptResult: any, articleText: string): string {
    const { politicalLeaning, biasIndicators, explanation } = gptResult;

    return `
        <div id="result-container" class="analysis-result">
            <!-- Embed Liberal and Conservative scores for frontend -->
            <div class="bias-scores" style="display: none;">
                <span class="bias-liberal">${politicalLeaning.liberal}</span>
                <span class="bias-conservative">${politicalLeaning.conservative}</span>
            </div>

            <!-- Bias Speedometer -->
            <div class="chart-container">
                <h4>📊 Bias Speedometer</h4>
                <canvas id="biasGauge" width="500" height="250"></canvas>
            </div>

            <!-- Table with bias analysis -->
            <div class="dark-table-container">
                <table class="bias-table">
                    <thead>
                        <tr>
                            <th>Measurement</th>
                            <th>Score</th>
                            <th>Journalistic Disposition</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Overly Critical Language</td>
                            <td>${biasIndicators.criticalLanguage}/100</td>
                            <td>${this.getCriticalEmoji(biasIndicators.criticalLanguage)}</td>
                        </tr>
                        <tr>
                            <td>Judgmental Phrasing</td>
                            <td>${biasIndicators.judgmentalPhrasing}/100</td>
                            <td>${this.getJudgeEmoji(biasIndicators.judgmentalPhrasing)}</td>
                        </tr>
                        <tr>
                            <td>One-Sided Reporting</td>
                            <td>${biasIndicators.oneSidedReporting}/100</td>
                            <td>${this.getEmojiOneSided(biasIndicators.oneSidedReporting)}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>Overall Explanation:</strong> ${explanation}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Original article content -->
            <h4>📜 Original Article:</h4>
            <div id="original-article">${this.formatArticleText(articleText)}</div>
        </div>
    `;
}


  private getJudgeEmoji(score: number): string {
    if (score < 35) return '🤩'; // Positive emoji
    if (score <= 50) return '🙄'; // uncertain emoji
    return '😡'; // Negative emoji
  }

  private getCriticalEmoji(score: number): string {
    if (score < 35) return '🤩'; // Positive emoji
    if (score <= 60) return '🙄'; // uncertain emoji
    return '😡'; // Negative emoji
  }

  private getEmojiOneSided(score: number): string {
    if (score < 25 || score > 75) return '🙄'; // uncertain emoji
    return '😎'; // balanced emoji
  }

  private formatArticleText(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  

  private cleanArticleText(text: string): string {
    return (
      text
        // Remove excess whitespace and repeated <br> tags
        .replace(/(<br>\s*){2,}/gi, '<br>') // Reduce multiple <br> to one
        .replace(/\n{2,}/g, '\n') // Reduce multiple newlines to one
        .replace(/[ \t]+/g, ' ') // Remove extra spaces and tabs
        .replace(/^\s+|\s+$/gm, '') // Trim whitespace from each line
        .replace(/\n+/g, '\n') // Remove consecutive empty lines
        .trim()
    );
  }

  async fetchArticle(url: string): Promise<string> {
    try {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Extract the main content from the article tag or body tag
      let articleContent = $('article').text() || $('body').text();

      // Clean up the extracted content
      articleContent = this.cleanArticleText(articleContent);

      return articleContent;
    } catch (error) {
      throw new HttpException(
        'Unable to fetch article',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  
    
    
    
}

