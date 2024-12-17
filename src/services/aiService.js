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
}

module.exports = new AIService();