import { useState, useEffect, useMemo } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import styles from './ActivityLogPage.module.css';
import pageStyles from './pages.module.css';

type DateRange = '7d' | '30d' | 'all';

interface PageVisit {
  pageRoute: string;
  visitCount: number;
  lastVisited: string;
}

interface InteractionStat {
  interactionType: string;
  count: number;
}

function getDateFilter(range: DateRange): string | null {
  if (range === 'all') return null;
  const now = new Date();
  const days = range === '7d' ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return cutoff.toISOString();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ActivityLogPage() {
  const [range, setRange] = useState<DateRange>('7d');
  const [pageVisits, setPageVisits] = useState<PageVisit[]>([]);
  const [interactions, setInteractions] = useState<InteractionStat[]>([]);
  const [loading, setLoading] = useState(false);

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured || !supabase) return;

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      try {
        const dateFilter = getDateFilter(range);

        // Fetch raw activity log rows and aggregate client-side
        let query = supabase!.from('activity_log').select('page_route, interaction_type, created_at');
        if (dateFilter) {
          query = query.gte('created_at', dateFilter);
        }
        const { data, error } = await query;

        if (cancelled) return;

        if (error || !data) {
          setPageVisits([]);
          setInteractions([]);
          return;
        }

        // Aggregate page visits
        const visitMap = new Map<string, { count: number; lastVisited: string }>();
        for (const row of data) {
          const route = row.page_route as string;
          const createdAt = row.created_at as string;
          const existing = visitMap.get(route);
          if (existing) {
            existing.count++;
            if (createdAt > existing.lastVisited) {
              existing.lastVisited = createdAt;
            }
          } else {
            visitMap.set(route, { count: 1, lastVisited: createdAt });
          }
        }

        const visits: PageVisit[] = Array.from(visitMap.entries())
          .map(([pageRoute, { count, lastVisited }]) => ({
            pageRoute,
            visitCount: count,
            lastVisited,
          }))
          .sort((a, b) => b.visitCount - a.visitCount);

        // Aggregate interactions by type
        const interactionMap = new Map<string, number>();
        for (const row of data) {
          const type = (row.interaction_type as string) || 'page_view';
          interactionMap.set(type, (interactionMap.get(type) ?? 0) + 1);
        }

        const interactionStats: InteractionStat[] = Array.from(interactionMap.entries())
          .map(([interactionType, count]) => ({ interactionType, count }))
          .sort((a, b) => b.count - a.count);

        setPageVisits(visits);
        setInteractions(interactionStats);
      } catch {
        if (!cancelled) {
          setPageVisits([]);
          setInteractions([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [configured, range]);

  const rangeOptions: { value: DateRange; label: string }[] = useMemo(
    () => [
      { value: '7d', label: 'Last 7 days' },
      { value: '30d', label: 'Last 30 days' },
      { value: 'all', label: 'All time' },
    ],
    [],
  );

  if (!configured) {
    return (
      <PageShell title="Activity Log" subtitle="Usage analytics for the prototype">
        <div className={styles.notConfigured}>
          Activity logging requires Supabase
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Activity Log" subtitle="Usage analytics for the prototype">
      <div className={styles.filters}>
        {rangeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${styles.filterBtn} ${range === opt.value ? styles.filterBtnActive : ''}`}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.notConfigured}>Loading…</div>
      ) : (
        <>
          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionHeading}>Page Visits</h2>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Page Route</th>
                    <th>Visit Count</th>
                    <th>Last Visited</th>
                  </tr>
                </thead>
                <tbody>
                  {pageVisits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styles.emptyRow}>
                        No activity recorded yet
                      </td>
                    </tr>
                  ) : (
                    pageVisits.map((pv) => (
                      <tr key={pv.pageRoute}>
                        <td>{pv.pageRoute}</td>
                        <td>{pv.visitCount}</td>
                        <td>{formatDate(pv.lastVisited)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={pageStyles.section}>
            <h2 className={pageStyles.sectionHeading}>Interaction Frequency</h2>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Interaction Type</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.length === 0 ? (
                    <tr>
                      <td colSpan={2} className={styles.emptyRow}>
                        No interactions recorded yet
                      </td>
                    </tr>
                  ) : (
                    interactions.map((stat) => (
                      <tr key={stat.interactionType}>
                        <td>{stat.interactionType}</td>
                        <td>{stat.count}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
