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
    const prompt = `
      You are an Ethiopian news analyst. Analyze the article below and respond ONLY with a valid JSON object, no markdown, no extra text.

      Title: ${title}
      Content: ${rawContent}

      Respond with this exact structure:
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
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }, // clean JSON, no markdown fences needed
      });

      const text = completion.choices[0].message.content || '';
      return JSON.parse(text);
    } catch (error: any) {
      this.logger.error(`Summarization failed: ${error.message}`);
      return null;
    }
  }
}
