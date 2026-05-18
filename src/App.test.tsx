import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('module can be imported without errors', async () => {
    // Smoke test: verify the App module can be imported
    const mod = await import('./App');
    expect(mod.default).toBeDefined();
  });
});
