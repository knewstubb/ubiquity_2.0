import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

/* ── Hoisted mocks ─────────────────────────────────────────────── */
const { mockState, mockInsert, mockFrom } = vi.hoisted(() => {
  const mockState = { configured: true, data: null as unknown, error: null as unknown };
  const mockInsert = vi.fn().mockImplementation(() =>
    Promise.resolve({ data: mockState.data, error: mockState.error }),
  );
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  return { mockState, mockInsert, mockFrom };
});

vi.mock('../supabase', () => ({
  get supabase() {
    return mockState.configured ? { from: mockFrom } : null;
  },
  isSupabaseConfigured: () => mockState.configured,
}));

import {
  trackPageView,
  trackInteraction,
  initActivityLog,
  stopActivityLog,
} from '../activity-log';

/* ── Helpers ───────────────────────────────────────────────────── */
function reset() {
  mockState.configured = true;
  mockState.data = null;
  mockState.error = null;
  vi.clearAllMocks();
  mockInsert.mockImplementation(() =>
    Promise.resolve({ data: mockState.data, error: mockState.error }),
  );
  mockFrom.mockReturnValue({ insert: mockInsert });
}

describe('ActivityLogService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reset();
    // Ensure clean state — stop any prior log session
    stopActivityLog();
    vi.clearAllMocks();
  });

  afterEach(() => {
    stopActivityLog();
    vi.useRealTimers();
  });

  /* ── Queuing ─────────────────────────────────────────────────── */

  it('trackPageView queues an event', () => {
    initActivityLog('user-1');
    trackPageView('/dashboard');

    // No flush yet — nothing sent to Supabase
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('trackInteraction queues an event', () => {
    initActivityLog('user-1');
    trackInteraction('modal_open', 'create-campaign');

    expect(mockFrom).not.toHaveBeenCalled();
  });

  /* ── Batching & flush ────────────────────────────────────────── */

  it('events are batched and flushed together after 5 seconds', async () => {
    initActivityLog('user-1');
    trackPageView('/dashboard');
    trackPageView('/automations/campaigns');
    trackInteraction('click', 'btn-create');

    // Advance timer to trigger flush
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockFrom).toHaveBeenCalledWith('activity_log');
    expect(mockInsert).toHaveBeenCalledTimes(1);

    const batch = mockInsert.mock.calls[0][0];
    expect(batch).toHaveLength(3);
    expect(batch[0]).toMatchObject({ page_route: '/dashboard', user_id: 'user-1' });
    expect(batch[1]).toMatchObject({ page_route: '/automations/campaigns', user_id: 'user-1' });
    expect(batch[2]).toMatchObject({ interaction_type: 'click', target_id: 'btn-create', user_id: 'user-1' });
  });

  it('flush sends events to Supabase with correct fields', async () => {
    initActivityLog('user-1');
    trackPageView('/settings');

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockFrom).toHaveBeenCalledWith('activity_log');
    const event = mockInsert.mock.calls[0][0][0];
    expect(event).toHaveProperty('page_route', '/settings');
    expect(event).toHaveProperty('user_id', 'user-1');
    expect(event).toHaveProperty('created_at');
    expect(typeof event.created_at).toBe('string');
  });

  it('does not call Supabase when queue is empty', async () => {
    initActivityLog('user-1');

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockFrom).not.toHaveBeenCalled();
  });

  /* ── 429 / flush failure handling ────────────────────────────── */

  it('discards batch on Supabase error (e.g. 429)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockState.error = { message: 'Too Many Requests', code: '429' };

    initActivityLog('user-1');
    trackPageView('/dashboard');
    trackPageView('/settings');

    await vi.advanceTimersByTimeAsync(5000);

    // Batch was sent and discarded
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith('Activity log flush failed:', 'Too Many Requests');

    // Queue is empty — next flush should not send anything
    vi.clearAllMocks();
    await vi.advanceTimersByTimeAsync(5000);
    expect(mockFrom).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('discards batch on network/thrown error (non-blocking)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockInsert.mockImplementation(() => Promise.reject(new Error('Network failure')));

    initActivityLog('user-1');
    trackPageView('/dashboard');

    await vi.advanceTimersByTimeAsync(5000);

    expect(warnSpy).toHaveBeenCalledWith('Activity log flush error:', expect.any(Error));

    // Queue is cleared — events discarded
    vi.clearAllMocks();
    mockInsert.mockImplementation(() =>
      Promise.resolve({ data: null, error: null }),
    );
    await vi.advanceTimersByTimeAsync(5000);
    expect(mockFrom).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  /* ── No Supabase configured ──────────────────────────────────── */

  it('does not queue events when Supabase is not configured', async () => {
    mockState.configured = false;
    initActivityLog('user-1');
    trackPageView('/dashboard');
    trackInteraction('click', 'btn');

    await vi.advanceTimersByTimeAsync(5000);

    expect(mockFrom).not.toHaveBeenCalled();
  });

  /* ── stopActivityLog ─────────────────────────────────────────── */

  it('stopActivityLog flushes remaining events and clears interval', async () => {
    initActivityLog('user-1');
    trackPageView('/dashboard');

    // Stop triggers a flush of remaining events
    stopActivityLog();
    // Allow the async flush to resolve
    await vi.advanceTimersByTimeAsync(0);

    expect(mockFrom).toHaveBeenCalledWith('activity_log');
    expect(mockInsert.mock.calls[0][0]).toHaveLength(1);

    // After stop, no more flushes happen
    vi.clearAllMocks();
    await vi.advanceTimersByTimeAsync(10000);
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
