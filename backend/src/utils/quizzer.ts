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
 * Extracts JSON from a string that might be wrapped in markdown code blocks
 */
function extractJSON(content: string): string {
  // Remove markdown code block markers if present
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    return jsonMatch[1].trim();
  }
  
  // If no code blocks, return the content as-is
  return content.trim();
}

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
    "answer": "Option A"
  }
]

IMPORTANT: Return ONLY the JSON array. Do not wrap it in markdown code blocks or add any explanations.

---

${content}
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // or gpt-3.5-turbo if needed
      messages: [
        { role: 'system', content: 'You generate factual MCQs from articles. Always return pure JSON without markdown formatting.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3, // more factual
    });

    const raw = response.choices[0].message.content?.trim();

    if (!raw) throw new Error('No quiz returned');

    // Extract JSON from potential markdown wrapper
    const cleanJson = extractJSON(raw);
    
    // Validate that it starts with [ and ends with ]
    if (!cleanJson.startsWith('[') || !cleanJson.endsWith(']')) {
      throw new Error(`Invalid JSON format. Expected array, got: ${cleanJson.substring(0, 100)}...`);
    }

    // Try to parse the returned JSON
    const quiz: MCQ[] = JSON.parse(cleanJson);
    
    // Validate the structure
    if (!Array.isArray(quiz) || quiz.length === 0) {
      throw new Error('Quiz must be a non-empty array');
    }
    
    // Validate each MCQ
    for (const mcq of quiz) {
      if (!mcq.question || !mcq.options || !mcq.answer) {
        throw new Error('Each MCQ must have question, options, and answer properties');
      }
      if (!Array.isArray(mcq.options) || mcq.options.length !== 4) {
        throw new Error('Each MCQ must have exactly 4 options');
      }
      if (!mcq.options.includes(mcq.answer)) {
        throw new Error('The answer must be one of the provided options');
      }
    }
    
    return quiz;
  } catch (err) {
    console.error('❌ Quiz generation error:', err);
    if (err instanceof SyntaxError) {
      console.error('Raw response was:',);
    }
    return [];
  }
}