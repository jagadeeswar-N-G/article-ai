// src/utils/qdrant.ts

import {QdrantClient} from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';


dotenv.config();

const client = new QdrantClient({ url: process.env.QDRANT_URL || 'http://localhost:6333', apiKey: process.env.QDRANT_API });

export const qdrant = client;

export const COLLECTION_NAME = 'articles';

/**
 * Create collection if not exists
 */
export async function ensureCollection(): Promise<void> {
  const exists = await client.getCollections()
    .then(res => res.collections.some(c => c.name === COLLECTION_NAME));

  if (!exists) {
    await client.createCollection(COLLECTION_NAME, {
      vectors: {
        size: 1536, // OR 3072 for embedding-3-small if configured
        distance: 'Cosine',
      },
    });

    console.log('✅ Qdrant collection created');
  }
}

/**
 * Store article chunks as points in Qdrant
 */

export async function storeChunks(articleId: string, vectors: number[][], chunks: string[]): Promise<void> {
  const points = vectors.map((vector, i) => ({
    id: uuidv4(), // Generate UUID for each point
    vector,
    payload: {
      articleId,
      chunkIndex: i,
      text: chunks[i],
    },
  }));

  await client.upsert(COLLECTION_NAME, { points });
  console.log(`✅ Stored ${points.length} chunks to Qdrant`);
}

/**
 * Search top-k similar chunks given a query vector
 */
export async function searchSimilarChunks(queryVector: number[], topK = 5): Promise<string[]> {
  const result = await client.search(COLLECTION_NAME, {
    vector: queryVector,
         limit: 3,

  });

  return result.map(res => res.payload?.text as string).filter(Boolean) ;
}
