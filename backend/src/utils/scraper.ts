import { chromium } from 'playwright';
import { extract } from '@extractus/article-extractor';

export async function extractArticleFromURL(url: string): Promise<any | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 🛑 Basic URL-type validation (skip non-article pages)
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
      console.warn('Rejected non-article URL');
      return null;
    }

    // Set user agent to avoid bot detection
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });

    // Navigate to the page and wait for network to be idle
    console.log(`Navigating to: ${url}`);
    await page.goto(url, { 
      waitUntil: 'networkidle', 
      timeout: 30000 
    });

    // Wait a bit for dynamic content to load
    await page.waitForTimeout(3000);

    // 🧠 Extract article statistics inside the page context
    const articleStats = await page.evaluate(() => {
      // Try multiple selectors for article content, including freeCodeCamp specific ones
      const articleSelectors = [
        'article',
        'article.post-full',
        '.post-full',
        '[role="article"]',
        '.article',
        '.post',
        '.entry',
        '.post-content',
        'section.post-content',
        '.content',
        'main article',
        'main .content'
      ];

      let root = null;
      let usedSelector = '';
      for (const selector of articleSelectors) {
        root = document.querySelector(selector);
        if (root) {
          usedSelector = selector;
          break;
        }
      }

      // For freeCodeCamp specifically, also try to get the post content section
      const postContent = document.querySelector('section.post-content');
      if (postContent && (!root || (postContent as HTMLElement).innerText?.length > (root as HTMLElement).innerText?.length)) {
        root = postContent;
        usedSelector = 'section.post-content';
      }

      const paragraphCount = root ? root.querySelectorAll('p').length : 0;
      const textLength = root ? (root as HTMLElement).innerText?.length || 0 : 0;
      const fallbackParagraphCount = document.body.querySelectorAll('p').length;
      const headingCount = document.body.querySelectorAll('h1, h2, h3, h4, h5, h6').length;

      return {
        hasRoot: !!root,
        usedSelector,
        rootSelector: root ? (root.tagName + (root.className ? '.' + root.className.split(' ')[0] : '')) : null,
        paragraphCount,
        textLength,
        fallbackParagraphCount,
        headingCount,
        docTitle: document.title,
        bodyTextLength: document.body.innerText?.length || 0
      };
    });

    console.log('Article stats:', articleStats);

    // More flexible article detection
    const isProbablyArticle = 
      (articleStats.hasRoot && (articleStats.paragraphCount >= 2 || articleStats.textLength >= 150)) ||
      (articleStats.fallbackParagraphCount >= 3 && articleStats.headingCount >= 1) ||
      (articleStats.bodyTextLength >= 500 && articleStats.fallbackParagraphCount >= 2);

    if (!isProbablyArticle) {
      console.warn('Rejected: Not a valid article page');
      console.warn('Fallback paragraph count:', articleStats.fallbackParagraphCount);
      console.warn('Body text length:', articleStats.bodyTextLength);
      return null;
    }

    // 🧪 Extract the full page HTML content
    const html = await page.content();

    // Parse structured article content using @extractus/article-extractor
    const article = await extract(html);

    // If extractor fails, try manual extraction
    if (!article?.content || article.content.length < 200) {
      console.log('Extractor failed, trying manual extraction...');
      
      const manualExtraction = await page.evaluate(() => {
        // Try to find the main content - freeCodeCamp specific selectors first
        const contentSelectors = [
          'section.post-content',
          'article.post-full',
          '.post-full-content',
          'article',
          '[role="article"]',
          '.article-content',
          '.post-content',
          '.entry-content',
          '.content',
          'main',
          '.main'
        ];

        let contentElement = null;
        for (const selector of contentSelectors) {
          contentElement = document.querySelector(selector);
          if (contentElement && (contentElement as HTMLElement).innerText?.length > 200) break;
        }

        if (!contentElement) {
          // Fallback: get all paragraphs
          const paragraphs = Array.from(document.querySelectorAll('p'))
            .map(p => (p as HTMLElement).innerText?.trim() || '')
            .filter(text => text.length > 20);
          
          return {
            title: document.title,
            content: paragraphs.join('\n\n'),
            author: '',
            published: ''
          };
        }

        // Try to get author and date info for freeCodeCamp
        const authorElement = document.querySelector('.author-card-name a, .author-name');
        const dateElement = document.querySelector('.post-full-meta-date, time[datetime]');
        
        return {
          title: document.title,
          content: (contentElement as HTMLElement).innerText || '',
          author: authorElement ? (authorElement as HTMLElement).innerText?.trim() || '' : '',
          published: dateElement ? dateElement.getAttribute('datetime') || (dateElement as HTMLElement).innerText || '' : ''
        };
      });

      if (manualExtraction.content.length < 200) {
        console.warn('Rejected: Content too short even after manual extraction');
        return null;
      }

      return manualExtraction;
    }

    // Return a clean article object
    return {
      title: article.title || articleStats.docTitle || 'Untitled',
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