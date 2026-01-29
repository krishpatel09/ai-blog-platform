import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
// Use require for packages without types or strict ES module issues in NestJS context sometimes
const { chromium } = require('playwright-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

// Add stealth plugin to playwright
chromium.use(stealthPlugin());

@Injectable()
export class StoriesService {
  private readonly logger = new Logger(StoriesService.name);

  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    // ... existing implementation ...
    const statusCounts = await this.prisma.post.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    });

    const counts = {
      drafts: 0,
      published: 0,
      scheduled: 0,
      submnitted: 0,
      unlisted: 0,
    };

    statusCounts.forEach((s) => {
      if (s.status === 'DRAFT') counts.drafts = s._count.status;
      if (s.status === 'PUBLISHED') counts.published = s._count.status;
      if (s.status === 'SCHEDULED') counts.scheduled = s._count.status;
    });

    const archivedCount = await this.prisma.post.count({
      where: { userId, status: 'ARCHIVED' },
    });
    counts.unlisted = archivedCount;

    return counts;
  }

  // Restore importOnly method
  async importOnly(url: string) {
    const importedData = await this.fetchExternalStory(url);
    return {
      success: true,
      data: importedData,
    };
  }

  async findAll(userId: string, status: string, page: number, limit: number) {
    // ... existing implementation ...
    const skip = (page - 1) * limit;
    const now = new Date();

    let where: any = { userId };

    if (status) {
      const lower = status.toLowerCase();
      if (lower === 'draft') {
        where.status = 'DRAFT';
      } else if (lower === 'published') {
        where.status = 'PUBLISHED';
        where.publishedAt = { lte: now };
      } else if (lower === 'scheduled') {
        where.status = 'SCHEDULED';
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          user: { select: { username: true, name: true, avatar: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async fetchExternalStory(url: string) {
    this.logger.log(`Initiating import for: ${url}`);
    let fallbackData: any = null;

    // LAYER 1: RSS (Medium Specific)
    if (url.includes('medium.com')) {
      const rssResult = await this.tryMediumRssBypass(url);
      if (rssResult) {
        if (!rssResult.isTruncated) {
          this.logger.log('Full content found via RSS bypass.');
          return rssResult;
        }
        this.logger.warn(
          'RSS content truncated. Saving as fallback and proceeding to Layer 2.',
        );
        fallbackData = rssResult;
      }
    }

    // LAYER 2: Jina Reader (First Choice Proxy)
    try {
      this.logger.log('Starting Layer 2: Jina Reader...');
      return await this.fetchViaJina(url);
    } catch (jinaError) {
      this.logger.warn(`Jina failed: ${jinaError.message}`);
    }

    // LAYER 3: Safety Fallback (Bot Masquerade)
    try {
      this.logger.log('Starting Layer 3: Safety Fallback (Bot Masquerade)...');
      return await this.fetchViaBot(url);
    } catch (botError) {
      this.logger.warn(`Safety Fallback failed: ${botError.message}`);
    }

    // LAYER 4: Playwright (Stealth Browser - Last Resort)
    try {
      this.logger.log('Starting Layer 4: Playwright Stealth Browser...');
      return await this.fetchViaPlaywright(url);
    } catch (pwError) {
      this.logger.warn(`Playwright failed: ${pwError.message}`);
    }

    // FINAL RETURN: RSS Snippet if available
    if (fallbackData) {
      this.logger.warn(
        'All advanced layers failed. Returning truncated RSS fallback.',
      );
      return fallbackData;
    }

    throw new BadRequestException(
      'Unable to import story. The site is protected and no fallback data was found.',
    );
  }

  // --- IMPLEMENTATION METHODS ---

  private async fetchViaBot(url: string) {
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000,
    });

    const dom = new JSDOM(response.data);
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content || article.content.length < 500) {
      throw new Error('Bot content empty or too short');
    }

    return {
      title: article.title,
      excerpt: article.excerpt,
      content: this.htmlToTipTap(article.content),
      image: this.extractImage(dom.window.document, article),
      originalUrl: url,
      siteName: article.siteName || 'External Story',
    };
  }

  private async tryMediumRssBypass(url: string) {
    try {
      const rssUrl = this.convertToMediumRss(url);
      const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
      const response = await axios.get(proxyUrl);

      const story = response.data.items?.find(
        (item: any) =>
          item.link.split('?')[0] === url.split('?')[0] ||
          item.guid?.includes(url.split('-').pop()),
      );

      if (story) {
        // Snippet Check
        const fullContent = story.content || story.description || '';
        const isTruncated =
          fullContent.includes('Continue reading') || fullContent.length < 1000;

        // Efficient Image Extraction
        let image = story.thumbnail || story.enclosure?.link;
        if (!image) {
          const htmlToCheck = story.content || story.description || '';
          const dom = new JSDOM(htmlToCheck);
          const img = dom.window.document.querySelector('img');
          if (img && img.src) image = img.src;
        }

        const tiptapContent = this.htmlToTipTap(story.content);

        // Fallback: If no metadata image, check if first block of content is an image
        if (
          !image &&
          tiptapContent.content.length > 0 &&
          tiptapContent.content[0].type === 'image'
        ) {
          image = tiptapContent.content[0].attrs.src;
        }

        return {
          title: story.title,
          content: tiptapContent,
          excerpt: story.description
            ?.replace(/<[^>]*>?/gm, '')
            .substring(0, 160),
          image: image || null,
          siteName: 'Medium (via RSS)',
          originalUrl: url,
          isTruncated,
        };
      }
    } catch (e) {
      this.logger.error(`RSS Bypass Error: ${e.message}`);
      return null;
    }
  }

  private async fetchViaPlaywright(url: string) {
    const browser = await chromium.launch({ headless: true });
    try {
      const context = await browser.newContext();
      const page = await context.newPage();

      this.logger.debug(`Navigating to ${url} with stealth...`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Simulate human behavior: Scroll to bottom to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });

      // Wait a bit for execution
      await page.waitForTimeout(2000);

      const content = await page.content();
      const dom = new JSDOM(content, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();

      if (!article)
        throw new Error('Readability failed to parse Playwright content');

      return {
        title: article.title,
        excerpt: article.excerpt,
        content: this.htmlToTipTap(article.content || ''),
        image: this.extractImage(dom.window.document, article),
        originalUrl: url,
        siteName: article.siteName || 'External Story',
      };
    } finally {
      await browser.close();
    }
  }

  private async fetchViaJina(url: string) {
    const readerUrl = `https://r.jina.ai/${url}`;
    const response = await axios.get(readerUrl, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 30000,
    });

    const data = response.data.data || response.data;
    if (!data || (!data.content && !data.html))
      throw new Error('Jina returned empty content');

    if (
      data.title === 'Just a moment...' ||
      data.content?.includes('verify you are human')
    ) {
      throw new Error('Jina blocked by Cloudflare');
    }

    return {
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      content: this.htmlToTipTap(data.content || data.html),
      image: data.image || null,
      originalUrl: url,
      siteName: 'External Story',
    };
  }

  // --- UTILS ---

  private convertToMediumRss(url: string): string {
    const parsed = new URL(url);
    const parts = parsed.pathname.split('/').filter(Boolean);
    return `https://medium.com/feed/${parts[0]}`;
  }

  private extractImage(doc: Document, article: any): string | null {
    let image = article.image || article.lead_image_url;
    if (!image) {
      const ogImage = doc.querySelector('meta[property="og:image"]');
      if (ogImage) image = ogImage.getAttribute('content');
    }
    return image || null;
  }

  // --- ROBUST HTML PARSER ---
  private htmlToTipTap(html: string) {
    const dom = new JSDOM(html);
    const body = dom.window.document.body;
    const flatContent: any[] = [];

    // Recursive function to process nodes and FLATTEN them
    const processNode = (node: Node) => {
      if (node.nodeType === 3) {
        // Text Node
        const text = node.textContent?.trim();
        if (text && text.length > 0) {
          // Skip junk text
          if (['enter fullscreen', 'share'].includes(text.toLowerCase()))
            return;
          flatContent.push({
            type: 'paragraph',
            content: [{ type: 'text', text }],
          });
        }
        return;
      }

      if (node.nodeType !== 1) return;
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      // Skip invalid/junk tags
      if (
        ['script', 'style', 'button', 'nav', 'footer', 'iframe'].includes(
          tagName,
        )
      )
        return;

      // Images
      if (tagName === 'img') {
        const src = el.getAttribute('src');
        if (src) {
          flatContent.push({
            type: 'image',
            attrs: { src, alt: el.getAttribute('alt') || '' },
          });
        }
        return;
      }

      // Headings
      if (/h[1-6]/.test(tagName)) {
        const level = parseInt(tagName[1]);
        const text = el.textContent?.trim();
        if (text) {
          flatContent.push({
            type: 'heading',
            attrs: { level },
            content: [{ type: 'text', text }],
          });
        }
        return;
      }

      // Paragraphs
      if (tagName === 'p') {
        const text = el.textContent?.trim();
        const hasImages = el.getElementsByTagName('img').length > 0;

        // If it has images, we must dive deeper to avoid nesting images in p (invalid for some schemas)
        // OR we just process children. For robustness, if it has images, process children.
        if (hasImages) {
          Array.from(el.childNodes).forEach((child) => processNode(child));
          return;
        }

        if (text) {
          flatContent.push({
            type: 'paragraph',
            content: [{ type: 'text', text }],
          });
        }
        return;
      }

      // Lists
      if (tagName === 'ul' || tagName === 'ol') {
        const items: any[] = [];
        Array.from(el.children).forEach((li) => {
          if (li.tagName.toLowerCase() === 'li') {
            const liText = li.textContent?.trim();
            if (liText) {
              items.push({
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: liText }],
                  },
                ],
              });
            }
          }
        });
        if (items.length > 0) {
          flatContent.push({
            type: tagName === 'ul' ? 'bulletList' : 'orderedList',
            content: items,
          });
        }
        return;
      }

      // Blockquotes
      if (tagName === 'blockquote') {
        const text = el.textContent?.trim();
        if (text) {
          flatContent.push({
            type: 'blockquote',
            content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
          });
        }
        return;
      }

      // Containers (Div, Section, Article, etc.) -> RECURSE
      if (
        [
          'div',
          'section',
          'article',
          'main',
          'span',
          'b',
          'strong',
          'i',
          'em',
        ].includes(tagName)
      ) {
        Array.from(el.childNodes).forEach((child) => processNode(child));
        return;
      }

      // Fallback for other elements -> Just process children
      Array.from(el.childNodes).forEach((child) => processNode(child));
    };

    // Start processing
    Array.from(body.childNodes).forEach((node) => processNode(node));

    // Final Cleanup: Return Doc
    return {
      type: 'doc',
      content:
        flatContent.length > 0
          ? flatContent
          : [{ type: 'paragraph', content: [] }],
    };
  }
}
