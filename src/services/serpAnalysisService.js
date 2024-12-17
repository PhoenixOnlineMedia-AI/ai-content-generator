const SerpApi = require('google-search-results-nodejs');
const axios = require('axios');

class SerpAnalysisService {
  constructor() {
    this.defaultSerpApiKey = process.env.DEFAULT_SERPAPI_KEY;
    this.defaultScrapingBeeKey = process.env.DEFAULT_SCRAPINGBEE_KEY;
  }

  async initializeClient(user, service) {
    if (service === 'serpapi') {
      const apiKey = user?.apiKeys?.serpApi?.enabled ? 
        user.apiKeys.serpApi.key : 
        this.defaultSerpApiKey;
      return new SerpApi.GoogleSearch(apiKey);
    }

    if (service === 'scrapingbee') {
      return {
        apiKey: user?.apiKeys?.scrapingBee?.enabled ? 
          user.apiKeys.scrapingBee.key : 
          this.defaultScrapingBeeKey
      };
    }
  }

  async searchWithSerpApi(keyword, user) {
    const search = await this.initializeClient(user, 'serpapi');
    
    return new Promise((resolve, reject) => {
      search.json({
        q: keyword,
        location: 'United States',
        hl: 'en',
        gl: 'us',
        google_domain: 'google.com'
      }, (data) => {
        resolve(this.formatSerpApiResults(data));
      });
    });
  }

  async searchWithScrapingBee(keyword, user) {
    const { apiKey } = await this.initializeClient(user, 'scrapingbee');
    
    const response = await axios.get('https://app.scrapingbee.com/api/v1', {
      params: {
        api_key: apiKey,
        url: `https://www.google.com/search?q=${encodeURIComponent(keyword)}`,
        extract_rules: {
          organic_results: {
            selector: '.g',
            type: 'list',
            output: {
              title: 'h3',
              link: 'a::attr(href)',
              snippet: '.VwiC3b'
            }
          }
        }
      }
    });

    return this.formatScrapingBeeResults(response.data);
  }

  formatSerpApiResults(data) {
    return {
      keyword: data.search_parameters.q,
      organic_results: data.organic_results.map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        position: result.position
      }))
    };
  }

  formatScrapingBeeResults(data) {
    return {
      keyword: data.search_query,
      organic_results: data.organic_results.map((result, index) => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        position: index + 1
      }))
    };
  }
}

module.exports = new SerpAnalysisService();