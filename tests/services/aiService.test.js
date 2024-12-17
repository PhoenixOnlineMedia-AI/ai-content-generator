const AIService = require('../../src/services/aiService');

describe('AIService', () => {
  describe('generateContent', () => {
    it('should generate content successfully', async () => {
      const content = await AIService.generateContent(
        'Test topic',
        'blog',
        ['test', 'keywords']
      );
      expect(content).toBeDefined();
      expect(typeof content).toBe('string');
    });

    it('should handle errors gracefully', async () => {
      // Mock API failure
      jest.spyOn(AIService.openai.chat.completions, 'create')
        .mockRejectedValue(new Error('API Error'));

      await expect(AIService.generateContent(
        'Test topic',
        'blog',
        ['test']
      )).rejects.toThrow('Failed to generate content');
    });
  });
});