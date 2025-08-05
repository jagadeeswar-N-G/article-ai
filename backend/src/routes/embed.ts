import express from 'express';
import { extractArticleFromURL } from '../utils/scraper';
import { splitIntoChunks, generateEmbeddings } from '../utils/embedder';
import { ensureCollection, storeChunks } from '../utils/qdrant';

const router = express.Router();

/**
 * @route POST /embed
 * @desc Extract, chunk, embed, and store article in Qdrant
 * @body { url: string, articleId: string }
 */
router.post('/', async (req, res) => {
  const { url, articleId } = req.body;

  if (!url || !articleId) {
    return res.status(400).json({ error: 'Both url and articleId are required' });
  }

  try {
    // 1. Extract article
    const article = await extractArticleFromURL(url);
    if (!article || !article.content || article.content.length < 300) {
      return res.status(400).json({ error: 'Invalid or non-article URL' });
    }

    // 2. Chunk article
    const chunks = splitIntoChunks(article.content);
    if (!chunks.length) {
      return res.status(400).json({ error: 'Failed to split article into chunks' });
    }

    // 3. Generate embeddings
    const vectors = await generateEmbeddings(chunks);
    if (!vectors.length) {
      return res.status(500).json({ error: 'Failed to generate embeddings' });
    }

    // 4. Store in Qdrant
    await ensureCollection();
    await storeChunks(articleId, vectors, chunks);

    return res.status(200).json({
      message: 'Article embedded and stored successfully',
      chunksStored: chunks.length,
    });
  } catch (err) {
    console.error('❌ /embed error:', err);
    return res.status(500).json({ error: 'Something went wrong during embedding' });
  }
});

export default router;
