const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class WebsiteService {
  constructor() {
    this.visitedUrls = new Set();
  }

  async scanWebsite(baseUrl, maxPages = 100) {
    try {
      const pages = [];
      this.visitedUrls.clear();
      await this._crawlPage(baseUrl, baseUrl, pages, maxPages);
      return pages;
    } catch (error) {
      console.error('Website Scanning Error:', error);
      throw new Error('Failed to scan website');
    }
  }

  async _crawlPage(baseUrl, currentUrl, pages, maxPages) {
    if (this.visitedUrls.size >= maxPages || this.visitedUrls.has(currentUrl)) {
      return;
    }

    try {
      const response = await axios.get(currentUrl);
      const $ = cheerio.load(response.data);
      this.visitedUrls.add(currentUrl);

      // Extract page data
      const pageData = {
        url: currentUrl,
        title: $('title').text().trim(),
        description: $('meta[name="description"]').attr('content') || '',
        h1: $('h1').first().text().trim(),
        content: $('body').text().trim(),
        links: []
      };

      // Collect internal links
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        try {
          const absoluteUrl = new URL(href, baseUrl).href;
          if (absoluteUrl.startsWith(baseUrl)) {
            pageData.links.push({
              url: absoluteUrl,
              text: $(element).text().trim()
            });
          }
        } catch (e) {
          // Invalid URL, skip
        }
      });

      pages.push(pageData);

      // Recursively crawl internal links
      for (const link of pageData.links) {
        if (this.visitedUrls.size < maxPages) {
          await this._crawlPage(baseUrl, link.url, pages, maxPages);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${currentUrl}:`, error);
    }
  }
}

module.exports = new WebsiteService();