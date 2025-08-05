// src/utils/embedder.ts

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Splits a large text into chunks of ~500 tokens (~1500 chars)
 */
export function splitIntoChunks(content: string, maxLength = 1500): string[] {
  const paragraphs = content.split('\n').map(p => p.trim()).filter(Boolean);
  const chunks: string[] = [];

  let currentChunk = '';
  for (const para of paragraphs) {
    if ((currentChunk + para).length <= maxLength) {
      currentChunk += para + '\n';
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = para + '\n';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Generates embeddings for a list of chunks
 */
export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 3072-dimension
    input: chunks,
  });

  return response.data.map(d => d.embedding);
}

/**
 * Embeds a single question or string
 */
export async function embedQuestion(question: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question,
  });

  return response.data[0].embedding;
}
