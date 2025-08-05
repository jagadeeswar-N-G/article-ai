import express from 'express';
import { extractArticleFromURL } from '../utils/scraper';

const router = express.Router();

/**
 * @route POST /extract
 * @desc Accepts a URL, extracts article content
 * @body { url: string }
 */
router.post('/', async (req, res) => {
  const { url } = req.body;

  // 1. Validate
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    // 2. Scrape + extract content
    const article = await extractArticleFromURL(url);

    // 3. Check if it’s a valid article
    if (!article || !article.content || article.content.length < 300) {
      return res.status(400).json({ error: 'Not a valid article URL or content too short' });
    }

    // 4. Send structured response
    return res.status(200).json({
      title: article.title,
      author: article.author || '',
      published: article.published || '',
      content: article.content,
    });
  } catch (err) {
    console.error('❌ /extract error:', err);
    return res.status(500).json({ error: 'Something went wrong while extracting article' });
  }
});

export default router;
