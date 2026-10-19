import { describe, expect, it } from 'bun:test';
import app from '@/index';

const url = (path: string): string => `http://localhost:5001/v1/blog${path}`;

describe('Blog auth', () => {
  const adminOnly: [string, string][] = [
    ['GET', '/admin'],
    ['POST', ''],
    ['PUT', '/1'],
    ['DELETE', '/1'],
    ['POST', '/1/cover'],
    ['DELETE', '/1/cover'],
    ['POST', '/1/images/pic.png'],
  ];

  for (const [method, path] of adminOnly) {
    it(`rejects unauthenticated ${method} /v1/blog${path}`, async () => {
      const res = await app.fetch(
        new Request(url(path), {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'POST' || method === 'PUT' ? '{}' : undefined,
        }),
      );
      expect(res.status).toBe(401);
    });
  }

  it('rejects a non-numeric post id', async () => {
    const res = await app.fetch(new Request(url('/not-a-number')));
    expect(res.status).toBe(400);
  });

  it('rejects an out-of-range page size', async () => {
    const res = await app.fetch(new Request(url('?limit=1000')));
    expect(res.status).toBe(400);
  });
});
