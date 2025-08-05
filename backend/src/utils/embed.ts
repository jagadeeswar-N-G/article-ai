// src/utils/embedder.ts

import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 1️⃣ Chunk text into smaller pieces (based on character length)
export function splitIntoChunks(text: string, chunkSize = 1000): string[] {
  const chunks: string[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const chunk = text.slice(currentIndex, currentIndex + chunkSize);
    chunks.push(chunk.trim());
    currentIndex += chunkSize;
  }

  return chunks;
}

// 2️⃣ Generate embeddings for each chunk using OpenAI
export async function generateEmbeddings(chunks: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const chunk of chunks) {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: chunk,
      });

      embeddings.push(response.data[0].embedding);
    } catch (err) {
      console.error('❌ Error embedding chunk:', err);
      embeddings.push([]); // fallback empty array
    }
  }

  return embeddings;
}
