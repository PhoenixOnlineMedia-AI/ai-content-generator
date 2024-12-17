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
}

module.exports = new AIService();