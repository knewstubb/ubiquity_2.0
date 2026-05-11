import { supabase, isSupabaseConfigured } from '../supabase';

export interface ActivityLogRow {
  pageRoute: string;
  interactionType: string;
  createdAt: string;
}

/**
 * Fetches raw activity log rows from Supabase, optionally filtered by a date cutoff.
 * Returns an empty array when Supabase is not configured or on error.
 */
export async function getActivityLog(dateFilter: string | null): Promise<ActivityLogRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    let query = supabase!.from('activity_log').select('page_route, interaction_type, created_at');
    if (dateFilter) {
      query = query.gte('created_at', dateFilter);
    }
    const { data, error } = await query;

    if (error || !data) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((row: any) => ({
      pageRoute: row.page_route as string,
      interactionType: (row.interaction_type as string) || 'page_view',
      createdAt: row.created_at as string,
    }));
  } catch {
    return [];
  }
}
