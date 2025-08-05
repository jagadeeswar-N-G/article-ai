import express from 'express';
import { extractArticleFromURL } from '../utils/scraper';
import { generateQuiz } from '../utils/quizzer';

const router = express.Router();

/**
 * @route POST /quiz
 * @desc Extracts article and generates MCQs based on content
 * @body { url: string, articleId: string }
 */
router.post('/', async (req, res) => {
  const { url, articleId } = req.body;

  if (!url || !articleId) {
    return res.status(400).json({ error: 'Both url and articleId are required' });
  }

  try {
    // 1. Extract the article
    const article = await extractArticleFromURL(url);

    if (!article || !article.content) {
      return res.status(400).json({ error: 'Invalid or non-article URL' });
    }

    // 2. Generate the quiz
    const quiz = await generateQuiz(article.content);

    if (!quiz || quiz.length === 0) {
      return res.status(500).json({ error: 'Failed to generate quiz' });
    }

    // 3. Return result
    return res.status(200).json({
      articleId,
      quiz,
    });
  } catch (err) {
    console.error('❌ /quiz error:', err);
    return res.status(500).json({ error: 'Something went wrong during quiz generation' });
  }
});

export default router;
