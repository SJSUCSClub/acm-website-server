import { describe, expect, it } from 'bun:test';
import app from './index';

describe('Server', () => {
	it('should return status ok for GET /', async () => {
		const req = new Request('http://localhost:5001/');
		const res = await app.fetch(req);
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body).toEqual({ status: 'ok' });
	});

	it('should handle non-existent routes', async () => {
		const req = new Request('http://localhost:5001/non-existent');
		const res = await app.fetch(req);
		expect(res.status).toBe(404);
	});

	it('should handle CORS preflight requests', async () => {
		const req = new Request('http://localhost:5001/', {
			method: 'OPTIONS',
			headers: {
				Origin: 'http://localhost:3000',
				'Access-Control-Request-Method': 'GET',
			},
		});
		const res = await app.fetch(req);
		expect(res.status).toBe(204);
		expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
	});
});
