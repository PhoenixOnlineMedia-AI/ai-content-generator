const TemplateService = require('../../src/services/templateService');

describe('TemplateService', () => {
  describe('generateFromTemplate', () => {
    it('should generate blog post template', async () => {
      const result = await TemplateService.generateFromTemplate('blog-post', {
        Title: 'Test Blog',
        keywords: ['test', 'blog']
      });
      
      expect(result).toHaveProperty('sections');
      expect(result).toHaveProperty('schema');
      expect(result).toHaveProperty('seoRecommendations');
    });
  });
}); 