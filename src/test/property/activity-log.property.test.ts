import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';

/* ── Hoisted mocks ─────────────────────────────────────────────── */
const { mockState, mockInsert, mockFrom } = vi.hoisted(() => {
  const mockState = { configured: true, data: null as unknown, error: null as unknown };
  const mockInsert = vi.fn().mockImplementation(() =>
    Promise.resolve({ data: mockState.data, error: mockState.error }),
  );
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  return { mockState, mockInsert, mockFrom };
});

vi.mock('../../lib/supabase', () => ({
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
} from '../../lib/activity-log';
import type { ActivityEventShape } from '../generators';

/* ── Local generators ──────────────────────────────────────────── */

const ROUTES = ['/dashboard', '/automations/campaigns', '/audiences/segments', '/content/assets', '/settings'];
const INTERACTION_TYPES = ['modal_open', 'record_create', 'filter_apply', 'button_click'];

function arbPageViewEvent(): fc.Arbitrary<{ type: 'page_view'; pageRoute: string }> {
  return fc.constantFrom(...ROUTES).map((route) => ({ type: 'page_view' as const, pageRoute: route }));
}

function arbInteractionEvent(): fc.Arbitrary<{ type: 'interaction'; interactionType: string; targetId: string }> {
  return fc.record({
    interactionType: fc.constantFrom(...INTERACTION_TYPES),
    targetId: fc.uuid(),
  }).map((r) => ({ type: 'interaction' as const, ...r }));
}

type TestEvent = ReturnType<typeof arbPageViewEvent> extends fc.Arbitrary<infer T> ? T : never
  | ReturnType<typeof arbInteractionEvent> extends fc.Arbitrary<infer T> ? T : never;

function arbMixedEvent(): fc.Arbitrary<{ type: 'page_view'; pageRoute: string } | { type: 'interaction'; interactionType: string; targetId: string }> {
  return fc.oneof(arbPageViewEvent(), arbInteractionEvent());
}

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

function collectFlushedBatches(): Array<Record<string, unknown>> {
  const batches: Array<Record<string, unknown>> = [];
  for (const call of mockInsert.mock.calls) {
    for (const event of call[0] as Array<Record<string, unknown>>) {
      batches.push(event);
    }
  }
  return batches;
}

/**
 * Property 12: Activity log records all navigations and interactions
 *
 * For any page navigation or tracked interaction performed by an authenticated user,
 * an activity_log record should exist with the correct user_id, page_route, and a
 * created_at timestamp within a reasonable window of the event.
 *
 * **Validates: Requirements 9.1, 9.2**
 */
describe('Property 12: Activity log records all navigations and interactions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reset();
    stopActivityLog();
    vi.clearAllMocks();
  });

  afterEach(() => {
    stopActivityLog();
    vi.useRealTimers();
  });

  it('all page view events are flushed with correct page_route and user_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...ROUTES), { minLength: 1, maxLength: 15 }),
        fc.uuid(),
        async (routes, userId) => {
          reset();
          stopActivityLog();
          vi.clearAllMocks();

          initActivityLog(userId);

          for (const route of routes) {
            trackPageView(route);
          }

          await vi.advanceTimersByTimeAsync(5000);

          const flushed = collectFlushedBatches();
          expect(flushed).toHaveLength(routes.length);

          for (let i = 0; i < routes.length; i++) {
            expect(flushed[i]).toMatchObject({
              page_route: routes[i],
              user_id: userId,
            });
            expect(flushed[i]).toHaveProperty('created_at');
            expect(typeof flushed[i].created_at).toBe('string');
          }

          stopActivityLog();
          vi.clearAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('all interaction events are flushed with correct interaction_type, target_id, and user_id', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            interactionType: fc.constantFrom(...INTERACTION_TYPES),
            targetId: fc.uuid(),
          }),
          { minLength: 1, maxLength: 15 },
        ),
        fc.uuid(),
        async (interactions, userId) => {
          reset();
          stopActivityLog();
          vi.clearAllMocks();

          initActivityLog(userId);

          for (const { interactionType, targetId } of interactions) {
            trackInteraction(interactionType, targetId);
          }

          await vi.advanceTimersByTimeAsync(5000);

          const flushed = collectFlushedBatches();
          expect(flushed).toHaveLength(interactions.length);

          for (let i = 0; i < interactions.length; i++) {
            expect(flushed[i]).toMatchObject({
              interaction_type: interactions[i].interactionType,
              target_id: interactions[i].targetId,
              user_id: userId,
            });
            expect(flushed[i]).toHaveProperty('created_at');
            expect(typeof flushed[i].created_at).toBe('string');
          }

          stopActivityLog();
          vi.clearAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('mixed page views and interactions are all recorded with correct fields', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbMixedEvent(), { minLength: 1, maxLength: 20 }),
        fc.uuid(),
        async (events, userId) => {
          reset();
          stopActivityLog();
          vi.clearAllMocks();

          initActivityLog(userId);

          for (const event of events) {
            if (event.type === 'page_view') {
              trackPageView(event.pageRoute);
            } else {
              trackInteraction(event.interactionType, event.targetId);
            }
          }

          await vi.advanceTimersByTimeAsync(5000);

          const flushed = collectFlushedBatches();
          expect(flushed).toHaveLength(events.length);

          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            const record = flushed[i];

            expect(record.user_id).toBe(userId);
            expect(typeof record.created_at).toBe('string');

            if (event.type === 'page_view') {
              expect(record.page_route).toBe(event.pageRoute);
            } else {
              expect(record.interaction_type).toBe(event.interactionType);
              expect(record.target_id).toBe(event.targetId);
            }
          }

          stopActivityLog();
          vi.clearAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('events queued across multiple flush intervals are all eventually flushed', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...ROUTES), { minLength: 1, maxLength: 5 }),
        fc.array(fc.constantFrom(...ROUTES), { minLength: 1, maxLength: 5 }),
        fc.uuid(),
        async (batch1Routes, batch2Routes, userId) => {
          reset();
          stopActivityLog();
          vi.clearAllMocks();

          initActivityLog(userId);

          // First batch
          for (const route of batch1Routes) {
            trackPageView(route);
          }
          await vi.advanceTimersByTimeAsync(5000);

          // Second batch
          for (const route of batch2Routes) {
            trackPageView(route);
          }
          await vi.advanceTimersByTimeAsync(5000);

          const flushed = collectFlushedBatches();
          expect(flushed).toHaveLength(batch1Routes.length + batch2Routes.length);

          // Verify all routes are present in order
          const allRoutes = [...batch1Routes, ...batch2Routes];
          for (let i = 0; i < allRoutes.length; i++) {
            expect(flushed[i].page_route).toBe(allRoutes[i]);
            expect(flushed[i].user_id).toBe(userId);
          }

          stopActivityLog();
          vi.clearAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });

  it('created_at timestamps are valid ISO strings for all generated events', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbMixedEvent(), { minLength: 1, maxLength: 10 }),
        fc.uuid(),
        async (events, userId) => {
          reset();
          stopActivityLog();
          vi.clearAllMocks();

          initActivityLog(userId);

          for (const event of events) {
            if (event.type === 'page_view') {
              trackPageView(event.pageRoute);
            } else {
              trackInteraction(event.interactionType, event.targetId);
            }
          }

          await vi.advanceTimersByTimeAsync(5000);

          const flushed = collectFlushedBatches();
          for (const record of flushed) {
            const ts = record.created_at as string;
            const parsed = new Date(ts);
            expect(parsed.getTime()).not.toBeNaN();
            // Verify it round-trips as ISO
            expect(parsed.toISOString()).toBe(ts);
          }

          stopActivityLog();
          vi.clearAllMocks();
        },
      ),
      { numRuns: 100 },
    );
  });
});
