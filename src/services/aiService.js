const OpenAI = require('openai');
const Anthropic = require('@anthropic-ai/sdk');
const axios = require('axios');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    this.openrouter = axios.create({
      baseURL: 'https://openrouter.ai/api/v1',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.APP_URL,
        'X-Title': 'AI Content Generator'
      }
    });

    this.perplexity = axios.create({
      baseURL: 'https://api.perplexity.ai',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      }
    });
  }

  async initializeModel(provider, model, apiKey) {
    switch(provider) {
      case 'openai':
        return new OpenAI({ apiKey });
      case 'anthropic':
        return new Anthropic({ apiKey });
      case 'openrouter':
        return axios.create({
          baseURL: 'https://openrouter.ai/api/v1',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': process.env.APP_URL
          }
        });
      case 'perplexity':
        return axios.create({
          baseURL: 'https://api.perplexity.ai',
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
      default:
        throw new Error('Invalid provider');
    }
  }  

  async generateContent(prompt, type, keywords, model = 'openai') {
    try {
      switch(model) {
        case 'claude':
          const claudeResponse = await this.anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 1000,
            messages: [{
              role: "user",
              content: `Create ${type} content about: ${prompt}. Include these keywords: ${keywords.join(', ')}`
            }],
            system: `You are a professional content creator specializing in ${type} content.`
          });
          return claudeResponse.content;

        case 'openrouter':
          const openrouterResponse = await this.openrouter.post('/chat/completions', {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{
              role: "system",
              content: `You are a professional content creator specializing in ${type} content.`
            }, {
              role: "user",
              content: `Create ${type} content about: ${prompt}. Include these keywords: ${keywords.join(', ')}`
            }]
          });
          return openrouterResponse.data.choices[0].message.content;

        case 'perplexity':
          const perplexityResponse = await this.perplexity.post('/chat/completions', {
            model: "pplx-7b-online",
            messages: [{
              role: "system",
              content: `You are a professional content creator specializing in ${type} content.`
            }, {
              role: "user",
              content: `Create ${type} content about: ${prompt}. Include these keywords: ${keywords.join(', ')}`
            }]
          });
          return perplexityResponse.data.choices[0].message.content;

        default:
          const openaiResponse = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: `You are a professional content creator specializing in ${type} content.`
            }, {
              role: "user",
              content: `Create ${type} content about: ${prompt}. Include these keywords: ${keywords.join(', ')}`
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          return openaiResponse.choices[0].message.content;
      }
    } catch (error) {
      console.error('AI Content Generation Error:', error);
      throw new Error('Failed to generate content');
    }
  }

  async generateSEOMetadata(content, model = 'openai') {
    try {
      switch(model) {
        case 'claude':
          const claudeResponse = await this.anthropic.messages.create({
            model: "claude-3-sonnet-20240229",
            max_tokens: 200,
            messages: [{
              role: "user",
              content: `Generate SEO title, description, and keywords for: ${content}`
            }],
            system: "You are an SEO expert. Generate metadata for the following content."
          });
          return claudeResponse.content;

        case 'openrouter':
          const openrouterResponse = await this.openrouter.post('/chat/completions', {
            model: "mistralai/mixtral-8x7b-instruct",
            messages: [{
              role: "system",
              content: "You are an SEO expert. Generate metadata for the following content."
            }, {
              role: "user",
              content: `Generate SEO title, description, and keywords for: ${content}`
            }]
          });
          return openrouterResponse.data.choices[0].message.content;

        case 'perplexity':
          const perplexityResponse = await this.perplexity.post('/chat/completions', {
            model: "pplx-7b-online",
            messages: [{
              role: "system",
              content: "You are an SEO expert. Generate metadata for the following content."
            }, {
              role: "user",
              content: `Generate SEO title, description, and keywords for: ${content}`
            }]
          });
          return perplexityResponse.data.choices[0].message.content;

        default:
          const openaiResponse = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "You are an SEO expert. Generate metadata for the following content."
            }, {
              role: "user",
              content: `Generate SEO title, description, and keywords for: ${content}`
            }],
            temperature: 0.7,
            max_tokens: 200
          });
          return openaiResponse.choices[0].message.content;
      }
    } catch (error) {
      console.error('SEO Metadata Generation Error:', error);
      throw new Error('Failed to generate SEO metadata');
    }
  }

  async enhanceContent(content, options) {
    try {
      const { type, tone } = options;
      let response;
  
      switch(type) {
        case 'rephrase':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "Rephrase the following content while maintaining its meaning and key points."
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        case 'simplify':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "Simplify the following content to make it more accessible and easier to understand."
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        case 'expand':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "Expand on the following content by adding more details, examples, and explanations."
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        case 'tone':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: `Adjust the tone of the following content to be more ${tone} while preserving the main message.`
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        case 'grammar':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "Correct any grammatical errors in the following content while maintaining its original style."
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        case 'enhance':
          response = await this.openai.chat.completions.create({
            model: "gpt-4",
            messages: [{
              role: "system",
              content: "Enhance the following content by improving its clarity, structure, and impact while maintaining its core message."
            }, {
              role: "user",
              content: content
            }],
            temperature: 0.7,
            max_tokens: 1000
          });
          break;
  
        default:
          throw new Error('Invalid enhancement type');
      }
  
      return response.choices[0].message.content;
    } catch (error) {
      console.error('Content Enhancement Error:', error);
      throw new Error('Failed to enhance content');
    }
  }
  async analyzeKeywordDensity(content) {
    try {
      const words = content.toLowerCase().split(/\s+/);
      const wordCount = words.length;
      const wordFrequency = {};
      
      words.forEach(word => {
        if (word.length > 3) { // Only count words longer than 3 characters
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
  
      // Convert to percentages and sort by frequency
      const density = {};
      Object.entries(wordFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10) // Get top 10 keywords
        .forEach(([word, count]) => {
          density[word] = ((count / wordCount) * 100).toFixed(1) + '%';
        });
  
      return density;
    } catch (error) {
      console.error('Keyword Density Analysis Error:', error);
      throw new Error('Failed to analyze keyword density');
    }
  }
  
  async analyzeReadability(content) {
    try {
      const sentences = content.split(/[.!?]+/).filter(Boolean);
      const words = content.split(/\s+/).filter(Boolean);
      const avgWordsPerSentence = words.length / sentences.length;
      
      // Simple readability score
      let readabilityLevel;
      if (avgWordsPerSentence < 10) readabilityLevel = 'Very Easy';
      else if (avgWordsPerSentence < 15) readabilityLevel = 'Easy';
      else if (avgWordsPerSentence < 20) readabilityLevel = 'Moderate';
      else if (avgWordsPerSentence < 25) readabilityLevel = 'Difficult';
      else readabilityLevel = 'Very Difficult';
  
      return {
        score: avgWordsPerSentence.toFixed(1),
        level: readabilityLevel,
        sentenceCount: sentences.length,
        wordCount: words.length
      };
    } catch (error) {
      console.error('Readability Analysis Error:', error);
      throw new Error('Failed to analyze readability');
    }
  }
  
  async generateHashtags(content) {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{
          role: "system",
          content: "Generate relevant hashtags for the following content. Return only the hashtags, separated by spaces, without any explanation."
        }, {
          role: "user",
          content: content
        }],
        temperature: 0.7,
        max_tokens: 100
      });
  
      const hashtags = response.choices[0].message.content
        .split(/\s+/)
        .filter(tag => tag.startsWith('#'))
        .slice(0, 8); // Limit to 8 hashtags
  
      return hashtags;
    } catch (error) {
      console.error('Hashtag Generation Error:', error);
      throw new Error('Failed to generate hashtags');
    }
  }  
  async analyzeReadability(content) {
    const textstat = require('text-readability');
    
    const readabilityScores = {
      fleschKincaid: textstat.fleschKincaidGrade(content),
      flesch: textstat.fleschReadingEase(content),
      smog: textstat.smogIndex(content),
      colemanLiau: textstat.colemanLiauIndex(content),
      automatedReadability: textstat.automatedReadabilityIndex(content)
    };
    
    return readabilityScores;
  }

    async extractTopics(content) {
      try {
        const natural = require('natural');
        const stopword = require('stopword');
        
        const tokenizer = new natural.WordTokenizer();
        const tokens = tokenizer.tokenize(content.toLowerCase());
        const filteredTokens = stopword.removeStopwords(tokens);
        
        const tfidf = new natural.TfIdf();
        tfidf.addDocument(filteredTokens);
        
        const topics = tfidf.listTerms(0)
          .slice(0, 5)
          .map(term => ({
            topic: term.term,
            weight: term.tfidf
          }));
        
        return topics;
      } catch (error) {
        console.error('Topic Extraction Error:', error);
        throw new Error('Failed to extract topics');
      }
    }
  
    async analyzeSentiment(content) {
      try {
        const Sentiment = require('sentiment');
        const sentiment = new Sentiment();
        
        const result = sentiment.analyze(content);
        
        return {
          score: result.score,
          comparative: result.comparative,
          positive: result.positive,
          negative: result.negative,
          analysis: result.score > 0 ? 'Positive' : result.score < 0 ? 'Negative' : 'Neutral'
        };
      } catch (error) {
        console.error('Sentiment Analysis Error:', error);
        throw new Error('Failed to analyze sentiment');
      }
    }
  
    async findExternalLinks(content, excludeDomains = []) {
      try {
        const response = await this.perplexity.post('/chat/completions', {
          model: "pplx-7b-online",
          messages: [{
            role: "system",
            content: `Find relevant, authoritative external links for the following content. 
                     Exclude these domains: ${excludeDomains.join(', ')}.
                     Focus on reputable sources like educational institutions, government sites, and well-known publications.`
          }, {
            role: "user",
            content: content
          }]
        });
        
        const links = response.data.choices[0].message.content
          .split('\n')
          .filter(Boolean)
          .map(link => link.trim())
          .filter(link => !excludeDomains.some(domain => link.includes(domain)));
  
        return links;
      } catch (error) {
        console.error('External Link Finding Error:', error);
        throw new Error('Failed to find external links');
      }
    }
  
    async sanitizeContent(html) {
      try {
        const sanitizeHtml = require('sanitize-html');
        return sanitizeHtml(html, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            'img', 'h1', 'h2', 'h3', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
          ]),
          allowedAttributes: {
            '*': ['href', 'src', 'alt', 'title', 'class', 'id'],
            'table': ['border', 'cellpadding', 'cellspacing'],
            'th': ['scope', 'colspan', 'rowspan'],
            'td': ['colspan', 'rowspan']
          }
        });
      } catch (error) {
        console.error('HTML Sanitization Error:', error);
        throw new Error('Failed to sanitize HTML content');
      }
    }  
    async analyzeSEO(content) {
      try {
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: `Analyze the SEO aspects of the content and provide detailed recommendations. 
                     Include title tag, meta description, heading structure, keyword usage, 
                     content length, and internal linking opportunities.`
          }, {
            role: "user",
            content: content
          }],
          temperature: 0.7
        });
    
        return response.choices[0].message.content;
      } catch (error) {
        console.error('SEO Analysis Error:', error);
        throw new Error('Failed to analyze SEO');
      }
    }
    
    async enhanceSEO(content, options) {
      try {
        const { keywords, targetLength, user } = options;
        
        const response = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [{
            role: "system",
            content: `Enhance the content for SEO while maintaining natural readability. 
                     Target length: ${targetLength || 'original'} words.
                     Focus keywords: ${keywords.join(', ')}.
                     Include semantic variations of keywords.
                     Add relevant headings and subheadings.
                     Ensure proper keyword density.
                     Add transition sentences between paragraphs.`
          }, {
            role: "user",
            content: content
          }],
          temperature: 0.7
        });
    
        return response.choices[0].message.content;
      } catch (error) {
        console.error('SEO Enhancement Error:', error);
        throw new Error('Failed to enhance SEO');
      }
    }
    
    async analyzeContentStructure(content) {
      try {
        // Analyze headings, paragraphs, lists, etc.
        const structure = {
          headings: this._extractHeadings(content),
          paragraphCount: this._countParagraphs(content),
          listItems: this._extractLists(content),
          contentBlocks: this._analyzeContentBlocks(content)
        };
    
        return structure;
      } catch (error) {
        console.error('Content Structure Analysis Error:', error);
        throw new Error('Failed to analyze content structure');
      }
    }    
}

module.exports = new AIService();