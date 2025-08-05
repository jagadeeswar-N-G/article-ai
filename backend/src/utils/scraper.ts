import { chromium } from 'playwright';
import { extract } from '@extractus/article-extractor';

export async function extractArticleFromURL(url: string): Promise<any | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 🛑 Basic URL-type validation (skip YouTube, non-articles)
    const disallowedPatterns = [
      'youtube.com',
      'youtu.be',
      'login',
      'auth',
      'signup',
      'register',
      'product',
      'category',
    ];
    if (disallowedPatterns.some(pattern => url.includes(pattern))) {
      console.warn(' Rejected non-article URL');
      return null;
    }

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // 🧠 Check if page has <article> tag or long enough body
    const isProbablyArticle = await page.evaluate(() => {
      const articleTag = document.querySelector('article');
      const bodyText = document.body.innerText || '';
      return articleTag !== null || bodyText.length > 1000;
    });

    if (!isProbablyArticle) {
      console.warn('Rejected: Not a valid article page');
      return null;
    }

    // 🧪 Get HTML and extract structured article content
    const html = await page.content();
   const article = await extract(html);


    if (!article?.content || article.content.length < 300) {
      console.warn(' Rejected: Content too short');
      return null;
    }

    return {
      title: article.title || 'Untitled',
      content: article.content,
      author: article.author || '',
      published: article.published || '',
    };
  } catch (err) {
    console.error('Scraping error:', err);
    return null;
  } finally {
    await browser.close();
  }
}
