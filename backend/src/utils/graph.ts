// src/utils/graph.ts

import { extractArticleFromURL } from './scraper';
import { splitIntoChunks, generateEmbeddings } from './embedder';
import { ensureCollection, storeChunks } from './qdrant';
import { summarizeArticle } from './summarizer'; // We'll write next
import { generateQuiz } from './quizzer';        // We'll write next

export type GraphInput = {
  articleId: string;
  url: string;
};

export type MCQ = {
  question: string;
  options: string[];
  answer: string;
};

export type GraphState = {
  articleId: string;
  url: string;
  article?: any;
  chunks?: string[];
  vectors?: number[][];
  summary?: string;
  quiz?: MCQ[];
};

// ✅ Node 1: Extract
async function extractNode(state: GraphState): Promise<GraphState> {
  const article = await extractArticleFromURL(state.url);
  if (!article?.content) throw new Error('Extraction failed');
  return { ...state, article };
}

// ✅ Node 2: Chunk + Embed
async function chunkAndEmbedNode(state: GraphState): Promise<GraphState> {
  if (!state.article?.content) throw new Error('No content to embed');
  const chunks = splitIntoChunks(state.article.content);
  const vectors = await generateEmbeddings(chunks);
  return { ...state, chunks, vectors };
}

// ✅ Node 3: Store in Qdrant
async function storeNode(state: GraphState): Promise<GraphState> {
  if (!state.chunks || !state.vectors) throw new Error('No embeddings to store');
  await ensureCollection();
  await storeChunks(state.articleId, state.vectors, state.chunks);
  return state;
}

// ✅ Node 4: Summarize
async function summaryNode(state: GraphState): Promise<GraphState> {
  if (!state.article?.content) throw new Error('No content for summary');
  const summary = await summarizeArticle(state.article.content);
  return { ...state, summary };
}

// ✅ Node 5: Quiz
async function quizNode(state: GraphState): Promise<GraphState> {
  if (!state.article?.content) throw new Error('No content for quiz');
  const quiz = await generateQuiz(state.article.content);
  return { ...state, quiz };
}

// ✅ Execute graph
export async function runGraph(input: GraphInput): Promise<GraphState> {
  const state = await extractNode(input)
    .then(chunkAndEmbedNode)
    .then(storeNode)
    .then(summaryNode)
    .then(quizNode);

  return state;
}
