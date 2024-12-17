const request = require('supertest');
const app = require('../../src/server');
const { createTestUser } = require('../utils/auth');
const Content = require('../../src/models/Content');

describe('Content Endpoints', () => {
  let authToken;
  let testUser;

  beforeEach(async () => {
    const testData = await createTestUser({
      credits: 100
    });
    testUser = testData.user;
    authToken = testData.token;
  });

  describe('POST /api/content/generate', () => {
    it('should generate content when user has credits', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Write about AI',
          type: 'blog',
          keywords: ['AI', 'technology']
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
    });

    it('should fail when user has no credits', async () => {
      await testUser.updateOne({ credits: 0 });

      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          prompt: 'Write about AI',
          type: 'blog',
          keywords: ['AI', 'technology']
        });

      expect(response.status).toBe(403);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .send({
          prompt: 'Write about AI',
          type: 'blog',
          keywords: ['AI', 'technology']
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/content/generate')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/content', () => {
    beforeEach(async () => {
      // Create some test content
      await Content.create({
        user: testUser._id,
        title: 'Test Content 1',
        content: 'Content body 1',
        type: 'blog',
        keywords: ['test']
      });
      await Content.create({
        user: testUser._id,
        title: 'Test Content 2',
        content: 'Content body 2',
        type: 'blog',
        keywords: ['test']
      });
    });

    it('should retrieve user content history', async () => {
      const response = await request(app)
        .get('/api/content')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(2);
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/content');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/content/:id', () => {
    let testContent;

    beforeEach(async () => {
      testContent = await Content.create({
        user: testUser._id,
        title: 'Test Content',
        content: 'Content body',
        type: 'blog',
        keywords: ['test']
      });
    });

    it('should retrieve specific content', async () => {
      const response = await request(app)
        .get(`/api/content/${testContent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Content');
    });

    it('should not retrieve content from other users', async () => {
      const otherUser = await createTestUser({
        email: 'other@example.com'
      });

      const response = await request(app)
        .get(`/api/content/${testContent._id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/content/:id/enhance', () => {
    let testContent;

    beforeEach(async () => {
      testContent = await Content.create({
        user: testUser._id,
        title: 'Test Content',
        content: 'Content body',
        type: 'blog',
        keywords: ['test']
      });
    });

    it('should enhance existing content', async () => {
      const response = await request(app)
        .post(`/api/content/${testContent._id}/enhance`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'expand',
          options: { tone: 'professional' }
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('content');
    });

    it('should fail with invalid enhancement action', async () => {
      const response = await request(app)
        .post(`/api/content/${testContent._id}/enhance`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'invalid',
          options: {}
        });

      expect(response.status).toBe(400);
    });

    it('should fail when user has no credits', async () => {
      await testUser.updateOne({ credits: 0 });

      const response = await request(app)
        .post(`/api/content/${testContent._id}/enhance`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'expand',
          options: { tone: 'professional' }
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/content/:id', () => {
    let testContent;

    beforeEach(async () => {
      testContent = await Content.create({
        user: testUser._id,
        title: 'Test Content',
        content: 'Content body',
        type: 'blog',
        keywords: ['test']
      });
    });

    it('should delete content', async () => {
      const response = await request(app)
        .delete(`/api/content/${testContent._id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const deletedContent = await Content.findById(testContent._id);
      expect(deletedContent).toBeNull();
    });

    it('should not delete content from other users', async () => {
      const otherUser = await createTestUser({
        email: 'other@example.com'
      });

      const response = await request(app)
        .delete(`/api/content/${testContent._id}`)
        .set('Authorization', `Bearer ${otherUser.token}`);

      expect(response.status).toBe(404);
    });
  });
});