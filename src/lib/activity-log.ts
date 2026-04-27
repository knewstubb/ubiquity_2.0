import { supabase, isSupabaseConfigured } from './supabase';

interface ActivityEvent {
  page_route: string;
  interaction_type?: string;
  target_id?: string;
  created_at: string;
  user_id: string;
}

let eventQueue: ActivityEvent[] = [];
let flushIntervalId: ReturnType<typeof setInterval> | null = null;
let currentUserId: string | null = null;

async function flushQueue(): Promise<void> {
  if (eventQueue.length === 0 || !isSupabaseConfigured() || !supabase) return;

  const batch = [...eventQueue];
  eventQueue = [];

  try {
    const { error } = await supabase.from('activity_log').insert(batch);
    if (error) {
      // Discard batch on failure (non-critical)
      console.warn('Activity log flush failed:', error.message);
    }
  } catch (err) {
    // Discard batch on 429 or network failure
    console.warn('Activity log flush error:', err);
  }
}

function handleBeforeUnload(): void {
  flushQueue();
}

export function trackPageView(route: string): void {
  if (!isSupabaseConfigured() || !currentUserId) return;

  eventQueue.push({
    page_route: route,
    created_at: new Date().toISOString(),
    user_id: currentUserId,
  });
}

export function trackInteraction(type: string, targetId: string): void {
  if (!isSupabaseConfigured() || !currentUserId) return;

  eventQueue.push({
    page_route: '',
    interaction_type: type,
    target_id: targetId,
    created_at: new Date().toISOString(),
    user_id: currentUserId,
  });
}

export function initActivityLog(userId: string): void {
  if (!isSupabaseConfigured()) return;

  currentUserId = userId;
  // Clear any existing interval
  if (flushIntervalId !== null) {
    clearInterval(flushIntervalId);
  }
  // Flush every 5 seconds
  flushIntervalId = setInterval(flushQueue, 5000);
  window.addEventListener('beforeunload', handleBeforeUnload);
}

export function stopActivityLog(): void {
  // Flush remaining events
  flushQueue();

  if (flushIntervalId !== null) {
    clearInterval(flushIntervalId);
    flushIntervalId = null;
  }
  window.removeEventListener('beforeunload', handleBeforeUnload);
  currentUserId = null;
  eventQueue = [];
}
