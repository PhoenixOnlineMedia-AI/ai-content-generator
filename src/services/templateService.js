const { AppError } = require('../utils/errorHandler');

class TemplateService {
  constructor() {
    this.templates = {
      'blog-post': {
        sections: [
          'Title',
          'Meta Description',
          'Introduction',
          'Key Takeaways',
          'Main Content Sections',
          'Expert Insights',
          'Practical Examples',
          'FAQ Section',
          'Conclusion',
          'Call to Action'
        ],
        schema: 'BlogPosting',
        requiredKeywords: 3,
        recommendedLength: '1500-2500',
        seoChecklist: [
          'Title contains primary keyword',
          'Meta description includes call-to-action',
          'Keywords appear in first paragraph',
          'Proper heading hierarchy',
          'Internal linking opportunities',
          'Image alt tags'
        ]
      },
      'landing-page': {
        sections: [
          'Hero Section',
          'Value Proposition',
          'Key Benefits',
          'Social Proof',
          'Feature Breakdown',
          'Pricing Options',
          'Testimonials',
          'FAQ Section',
          'Primary CTA'
        ],
        schema: 'WebPage',
        requiredKeywords: 5,
        recommendedLength: '800-1500'
      },
      'product-review': {
        sections: [
          'Executive Summary',
          'Product Overview',
          'Key Features Analysis',
          'Performance Testing',
          'User Experience',
            'Pros and Cons',
            'Competitor Comparison',
            'Price Analysis',
            'Verdict',
            'Recommendations'
          ],
          schema: 'Review',
          requiredKeywords: 4,
          recommendedLength: '2000-3000 words'
        },
        'how-to-guide': {
          sections: [
            'Problem Statement',
            'Solution Overview',
            'Required Materials/Tools',
            'Step-by-Step Instructions',
            'Common Pitfalls',
            'Expert Tips',
            'Troubleshooting',
            'Success Indicators',
            'FAQ Section',
            'Next Steps'
          ],
          schema: 'HowTo',
          requiredKeywords: 4,
          recommendedLength: '1500-2500 words'
        },
        'social-post': {
          sections: [
            'Hook',
            'Core Message',
            'Value Proposition',
            'Social Proof',
            'Call to Action'
          ],
          schema: 'SocialMediaPosting',
          requiredKeywords: 2,
          recommendedLength: '50-250 words'
        },
        'email-sequence': {
          sections: [
            'Subject Line',
            'Preview Text',
            'Personal Opening',
            'Value Statement',
            'Main Message',
            'Social Proof',
            'Primary CTA',
            'Secondary CTA',
            'P.S. Section'
          ],
          schema: 'EmailMessage',
          requiredKeywords: 2,
          recommendedLength: '300-500 words'
        },
        'case-study': {
          sections: [
            'Client Overview',
            'Challenge',
            'Goals',
            'Solution Implementation',
            'Results and Metrics',
            'Client Testimonial',
            'Key Learnings',
            'Next Steps'
          ],
          schema: 'Article',
          requiredKeywords: 3,
          recommendedLength: '1000-2000 words'
        },
        'product-description': {
          sections: [
            'Product Name',
            'USP Statement',
            'Key Benefits',
            'Feature Details',
            'Technical Specifications',
            'Use Cases',
            'Package Contents',
            'Warranty Information',
            'Purchase Options'
          ],
          schema: 'Product',
          requiredKeywords: 4,
          recommendedLength: '500-1000 words'
        }
      };
  }

  async generateFromTemplate(type, data) {
    try {
      const template = this.templates[type];
      if (!template) throw new AppError(`Template type '${type}' not found`, 400);

      const sections = await this._generateSections(template.sections, data);
      const schema = this._generateSchema(type, data);
      const seoRecommendations = await this._generateSEORecommendations(type, data);

      return {
        sections,
        schema,
        seoRecommendations,
        metadata: {
          recommendedLength: template.recommendedLength,
          requiredKeywords: template.requiredKeywords,
          type: type
        }
      };
    } catch (error) {
      throw new AppError(`Error generating template: ${error.message}`, error.statusCode || 500);
    }
  }

  async _generateSections(templateSections, data) {
    return templateSections.map(section => ({
      title: section,
      content: data[section] || '',
      recommendations: this._getSectionRecommendations(section),
      wordCount: this._calculateWordCount(data[section] || ''),
      status: this._validateSection(section, data[section] || '')
    }));
  }

  _getSectionRecommendations(section) {
    const recommendations = {
      'Title': {
        tips: [
          'Include primary keyword naturally',
          'Keep between 50-60 characters',
          'Make it compelling and clear'
        ]
      },
      'Meta Description': {
        tips: [
          'Include primary keyword',
          'Add clear call-to-action',
          'Keep between 150-160 characters'
        ]
      },
      'Introduction': {
        tips: [
          'Hook readers immediately',
          'Include the primary keyword in the first paragraph'
        ]
      }
      // Add more section recommendations as needed...
    };

    return recommendations[section] || {
      tips: ['Follow general content guidelines'],
      examples: []
    };
  }

  _validateSection(section, content) {
    const validations = {
      'Title': { minLength: 20, maxLength: 60, required: true },
      'Meta Description': { minLength: 120, maxLength: 160, required: true }
    };

    const validation = validations[section] || { minLength: 0, maxLength: Infinity, required: false };

    if (validation.required && !content) {
      return { valid: false, message: 'Section is required' };
    }

    const length = content.length;
    if (length < validation.minLength || length > validation.maxLength) {
      return {
        valid: false,
        message: `Length should be between ${validation.minLength} and ${validation.maxLength} characters`
      };
    }
    return { valid: true };
  }

  _calculateWordCount(content) {
    return content.split(/\s+/).filter(Boolean).length;
  }

  async _generateSEORecommendations(type, data) {
    const template = this.templates[type];
    const recommendations = [];

    // Check keyword density
    const keywordDensity = this._calculateKeywordDensity(data.content || '', data.keywords || []);
    if (keywordDensity < 0.5 || keywordDensity > 2.5) {
      recommendations.push({
        type: 'warning',
        message: `Keyword density is ${keywordDensity}%. Aim for 0.5-2.5%`
      });
    }

    // Check content length
    const wordCount = this._calculateWordCount(data.content || '');
    const [minWords, maxWords] = template.recommendedLength.split('-').map(Number);
    if (wordCount < minWords || wordCount > maxWords) {
      recommendations.push({
        type: 'warning',
        message: `Content length is ${wordCount} words. Aim for ${template.recommendedLength} words`
      });
    }

    return recommendations;
  }

  _calculateKeywordDensity(content, keywords) {
    const wordCount = this._calculateWordCount(content);
    let keywordCount = 0;

    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi');
      const matches = content.match(regex);
      keywordCount += matches ? matches.length : 0;
    });

    return ((keywordCount / wordCount) * 100).toFixed(2);
  }

  _generateSchema(type, data) {
    const baseSchema = {
      '@context': 'https://schema.org',
      '@type': this.templates[type]?.schema || 'WebPage',
      headline: data.Title || '',
      description: data['Meta Description'] || '',
      datePublished: new Date().toISOString(),
      author: {
        '@type': 'Person',
        name: data.author || ''
      },
      publisher: {
        '@type': 'Organization',
        name: data.publisher || '',
        logo: {
          '@type': 'ImageObject',
          url: data.publisherLogo || ''
        }
      }
    };

    if (type === 'product-review') {
      baseSchema.reviewBody = data['Main Content Sections'];
      baseSchema.reviewRating = {
        '@type': 'Rating',
        ratingValue: data.rating || '5',
        bestRating: '5',
        worstRating: '1'
      };
    } else if (type === 'how-to-guide') {
      baseSchema.step = data['Step-by-Step Instructions']?.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step
      }));
    }
    return baseSchema;
  }
}

module.exports = new TemplateService();