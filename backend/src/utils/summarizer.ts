// src/utils/summarizer.ts

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Generates a summary of the given article content
 * @param content Full article text
 * @returns Summary in plain English
 */
export async function summarizeArticle(content: string): Promise<string> {
  if (!content) throw new Error('No content to summarize');

  try {
    const prompt = `
You are a helpful assistant.

Summarize the following article in 5-7 sentences.

Make it easy to understand, even for a 12-year-old.

Start with: "This article is about..."

---

${content}
`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // You can use gpt-3.5-turbo if needed
      messages: [
        { role: 'system', content: 'You are an expert article summarizer.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
    });

    const summary = response.choices[0].message.content?.trim();
    if (!summary) throw new Error('No summary returned');

    return summary;
  } catch (err) {
    console.error('❌ Summary error:', err);
    return 'Summary unavailable.';
  }
}
