// src/utils/quizzer.ts

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Define the output format
export type MCQ = {
  question: string;
  options: string[];
  answer: string;
};

/**
 * Generates 3–5 MCQs from the given article content
 * @param content The full article text
 * @returns List of MCQs
 */
export async function generateQuiz(content: string): Promise<MCQ[]> {
  if (!content) throw new Error('No content to generate quiz from');

  const prompt = `
You are a quiz creator AI.

Read the following article and generate 3 to 5 multiple-choice questions (MCQs).

Each question must have:
- a clear and factual question
- 4 options
- exactly 1 correct answer
- answers must be derived from the article content

Return the output in **strict JSON format** like this:

[
  {
    "question": "What is the main topic of the article?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B"
  },
  ...
]

Do not explain anything else. Strictly return only the JSON array.

---

${content}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // or gpt-3.5-turbo if needed
      messages: [
        { role: 'system', content: 'You generate factual MCQs from articles.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // more factual
    });

    const raw = response.choices[0].message.content?.trim();

    if (!raw) throw new Error('No quiz returned');

    // Try to parse the returned JSON
    const quiz: MCQ[] = JSON.parse(raw);
    return quiz;
  } catch (err) {
    console.error('❌ Quiz generation error:', err);
    return [];
  }
}

