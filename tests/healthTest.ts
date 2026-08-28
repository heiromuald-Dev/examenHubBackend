import { describe, expect, it } from 'vitest';
import { testRequest } from './helpers/testApp';

describe('health endpoint', () => {
  it('returns a JSON health response without requiring a database query', async () => {
    const response = await testRequest.get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', service: 'exam-hub-backend' });
  });
});
