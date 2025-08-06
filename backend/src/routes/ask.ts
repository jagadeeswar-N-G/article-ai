import express from 'express';
import { embedQuestion } from '../utils/embedder';
import { searchSimilarChunks } from '../utils/qdrant';
import { OpenAI } from 'openai';

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

router.post('/', async (req, res) => {
  const { articleId, question } = req.body;

  if (!articleId || !question) {
    return res.status(400).json({ error: 'articleId and question are required' });
  }

  try {
    console.log(`Received question for article ${articleId}: ${question}`);
    // 1. Embed the question
    const questionEmbedding = await embedQuestion(question);

    console.log(`Generated embedding for question: ${questionEmbedding.length} dimensions`);

    // 2. Find top matching chunks
    const matchedChunks = await searchSimilarChunks(questionEmbedding, 5);

    if (matchedChunks.length === 0) {
      return res.status(404).json({ error: 'No relevant context found' });
    }

    // 3. Combine chunks into context
    const context = matchedChunks.join('\n\n');

    // 4. Send to OpenAI for answer
    const prompt = `
Answer the following question based ONLY on the context below.
if they as anything other than the article, roast them then and tell them to ask about the article.


Context:
${context}

Question: ${question}
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview', // or gpt-3.5-turbo
      messages: [
        { role: 'system', content: 'You are a helpful assistant that only uses the given context.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
    });

    const answer = completion.choices[0].message.content?.trim() || 'No answer found';

    res.status(200).json({ answer });
  } catch (err) {
    console.error('❌ Error in /ask route:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

export default router;
