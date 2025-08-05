import { QdrantClient } from '@qdrant/qdrant-client';

const client = new QdrantClient({
    url: process.env.QDRANT_URL || 'http://localhost:6333',
    apiKey: process.env.QDRANT_API_KEY,
});

export const storeVector = async (collectionName: string, vector: number[], payload: object) => {
    const response = await client.upsert({
        collection_name: collectionName,
        points: [
            {
                id: Date.now(), // or generate a unique ID
                vector: vector,
                payload: payload,
            },
        ],
    });
    return response;
};

export const retrieveVector = async (collectionName: string, vector: number[], limit: number = 5) => {
    const response = await client.search({
        collection_name: collectionName,
        vector: vector,
        limit: limit,
    });
    return response;
};