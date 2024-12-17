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
          recommendedLength: '1500-2500 words'
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
          recommendedLength: '800-1500 words'
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
      const template = this.templates[type];
      if (!template) {
        throw new Error('Template not found');
      }
  
      return {
        sections: template.sections.map(section => ({
          title: section,
          content: data[section] || '',
          recommendations: this.getRecommendations(type, section)
        })),
        schema: this.generateSchema(type, data),
        metadata: {
          recommendedLength: template.recommendedLength,
          requiredKeywords: template.requiredKeywords,
          type: type
        }
      };
    }
  
    getRecommendations(type, section) {
      // Implementation for section-specific recommendations
    }
  
    generateSchema(type, data) {
      // Implementation for schema generation
    }
    getRecommendations(type, section) {
        const recommendations = {
          'Title': 'Use a compelling and keyword-rich title (50-60 characters)',
          'Meta Description': 'Write a compelling summary in 150-160 characters',
          'Introduction': 'Hook readers with a strong opening and include primary keyword naturally',
          'Key Takeaways': 'List 3-5 main points using bullet points',
          'Main Content Sections': 'Use H2 and H3 headings with keywords, keep paragraphs under 3 sentences',
          'Expert Insights': 'Include quotes, statistics, or research findings with citations',
          'Practical Examples': 'Provide real-world examples or case studies',
          'FAQ Section': 'Include 4-6 common questions using question-based keywords',
          'Conclusion': 'Summarize key points and include a clear takeaway',
          'Call to Action': 'Use action verbs and create urgency',
          'Hero Section': 'Include unique value proposition and primary CTA',
          'Value Proposition': 'Focus on benefits, not features',
          'Social Proof': 'Add testimonials, reviews, or case study snippets',
          'Feature Breakdown': 'Use bullet points and icons for scanability',
          'Package Contents': 'List all items included with specifications',
          'Technical Specifications': 'Use tables for easy comparison'
        };
        
        return recommendations[section] || 'Follow general SEO best practices for this section';
      }
      
      generateSchema(type, data) {
        const baseSchema = {
          '@context': 'https://schema.org',
          '@type': this.templates[type].schema,
          'headline': data.Title || '',
          'description': data['Meta Description'] || '',
          'datePublished': new Date().toISOString(),
          'author': {
            '@type': 'Person',
            'name': data.author || ''
          },
          'publisher': {
            '@type': 'Organization',
            'name': data.publisher || '',
            'logo': {
              '@type': 'ImageObject',
              'url': data.publisherLogo || ''
            }
          }
        };
      
        // Add template-specific schema properties
        switch (type) {
          case 'product-review':
            baseSchema.reviewBody = data['Main Content Sections'];
            baseSchema.reviewRating = {
              '@type': 'Rating',
              'ratingValue': data.rating || '5',
              'bestRating': '5',
              'worstRating': '1'
            };
            break;
          
          case 'how-to-guide':
            baseSchema.step = data['Step-by-Step Instructions']?.map((step, index) => ({
              '@type': 'HowToStep',
              'position': index + 1,
              'text': step
            }));
            break;
          
          // Add more template-specific schema mappings
        }
      
        return baseSchema;
      }      
  }
  
  module.exports = new TemplateService();  