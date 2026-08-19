import { Injectable, Logger } from '@nestjs/common';
import Groq from 'groq-sdk';

@Injectable()
export class SummarizationService {
  private readonly logger = new Logger(SummarizationService.name);
  private readonly client: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error('GROQ_API_KEY is not set in your .env file');
    }
    this.client = new Groq({ apiKey });
  }

  async summarizeArticle(rawContent: string, title: string) {
    const truncatedContent = rawContent.slice(0, 1500);
    const prompt = `
You are an Ethiopian news analyst. Analyze the article below and respond ONLY with a valid JSON object. No markdown, no code fences, no extra text before or after the JSON.

Title: ${title}
Content: ${truncatedContent}

Respond with exactly this JSON structure:
{
  "headline": "A clear English headline",
  "headlineAmharic": "ዜና ርዕስ በአማርኛ",
  "summary": ["English bullet 1", "English bullet 2", "English bullet 3"],
  "summaryAmharic": ["አማርኛ ነጥብ 1", "አማርኛ ነጥብ 2", "አማርኛ ነጥብ 3"],
  "category": "Politics | Business | Sports | Health | Technology | Culture",
  "categoryAmharic": "ፖለቲካ | ቢዝነስ | ስፖርት | ጤና | ቴክኖሎጂ | ባህል",
  "keyEntities": ["names of people, places, or organizations mentioned"],
  "detectedLanguage": "amharic or english",
  "translatedToEnglish": true or false
}`;

    try {
      const completion = await this.client.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        // removed response_format
      });

      const text = completion.choices[0].message.content || '';
      // this.logger.log(`Raw response: ${text}`); // add this
      // strip markdown fences if model wraps response
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      const splitCategory = (value: any): string[] => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') {
          return value
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [];
      };

      return {
        ...parsed,
        category: splitCategory(parsed.category),
        categoryAmharic: splitCategory(parsed.categoryAmharic),
        summary: Array.isArray(parsed.summary)
          ? parsed.summary
          : [parsed.summary].filter(Boolean),
        summaryAmharic: Array.isArray(parsed.summaryAmharic)
          ? parsed.summaryAmharic
          : [parsed.summaryAmharic].filter(Boolean),
        keyEntities: Array.isArray(parsed.keyEntities)
          ? parsed.keyEntities
          : [parsed.keyEntities].filter(Boolean),
      };
    } catch (error: any) {
      this.logger.error(`Summarization failed: ${error.message}`);
      this.logger.error(`Full error: ${JSON.stringify(error)}`);
      return null;
    }
  }
}
