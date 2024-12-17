const ContentEnhancementService = require('../../src/services/contentEnhancementService');

describe('ContentEnhancementService', () => {
  describe('generateOutline', () => {
    it('should generate content outline', async () => {
      const result = await ContentEnhancementService.generateOutline(
        'AI Technology',
        ['AI', 'machine learning']
      );
      expect(result).toBeDefined();
    });
  });
}); 