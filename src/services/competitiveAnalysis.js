const axios = require('axios');
const cheerio = require('cheerio');

class CompetitiveAnalysisService {
  constructor() {
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };
  }

  async analyzeSERP(keyword) {
    try {
      const response = await axios.get(`https://api.serpscraper.com/search?q=${encodeURIComponent(keyword)}`, {
        headers: this.headers
      });

      return response.data.organic_results.map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }));
    } catch (error) {
      console.error('SERP Analysis Error:', error);
      throw new Error('Failed to analyze search results');
    }
  }

  async extractPageData(url) {
    try {
      const response = await axios.get(url, { headers: this.headers });
      const $ = cheerio.load(response.data);

      return {
        title: $('title').text(),
        headings: $('h1, h2, h3').map((_, el) => $(el).text()).get(),
        wordCount: $('body').text().split(/\s+/).length,
        images: $('img').length,
        links: $('a').length,
        paragraphs: $('p').length
      };
    } catch (error) {
      console.error('Page Analysis Error:', error);
      throw new Error('Failed to analyze page');
    }
  }

  async generateContentBrief(keyword) {
    try {
      const serpResults = await this.analyzeSERP(keyword);
      const contentBrief = {
        keyword,
        competitors: [],
        averages: {
          wordCount: 0,
          headings: 0,
          images: 0
        }
      };

      for (const result of serpResults.slice(0, 5)) {
        const pageData = await this.extractPageData(result.link);
        contentBrief.competitors.push({
          title: result.title,
          url: result.link,
          ...pageData
        });
      }

      // Calculate averages
      contentBrief.averages = this.calculateAverages(contentBrief.competitors);

      return contentBrief;
    } catch (error) {
      console.error('Content Brief Generation Error:', error);
      throw new Error('Failed to generate content brief');
    }
  }

  calculateAverages(competitors) {
    return competitors.reduce((acc, competitor) => {
      acc.wordCount += competitor.wordCount;
      acc.headings += competitor.headings.length;
      acc.images += competitor.images;
      return acc;
    }, { wordCount: 0, headings: 0, images: 0 });
  }
}

module.exports = new CompetitiveAnalysisService();