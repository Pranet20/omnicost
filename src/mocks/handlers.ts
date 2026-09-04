// src/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { mockResources } from './db';

export const handlers = [
  // 1. GET all resources
  http.get('/api/v1/resources', () => {
    return HttpResponse.json(mockResources);
  }),

  // 2. POST to remediate (The "Kill Switch" endpoint)
  http.post('/api/v1/remediate', async ({ request }) => {
    const body = await request.json() as { id: string; action: 'TERMINATE' | 'THROTTLE' };
    
    // In a real app, this would update a database. 
    // For now, we simulate a successful 200 OK response.
    return HttpResponse.json({
      success: true,
      message: `Resource ${body.id} successfully updated to ${body.action}`,
      timestamp: new Date().toISOString()
    });
  })
];  