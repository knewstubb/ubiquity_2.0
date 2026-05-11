import { useState, useEffect, useMemo } from 'react';
import { PageShell } from '../components/layout/PageShell';
import { isSupabaseConfigured } from '../lib/supabase';
import { getActivityLog } from '../lib/adapters/activity-adapter';
import { cn } from '../lib/utils';

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
    if (!configured) return;

    let cancelled = false;
    setLoading(true);

    async function fetchData() {
      const dateFilter = getDateFilter(range);
      const rows = await getActivityLog(dateFilter);

      if (cancelled) return;

      if (rows.length === 0) {
        setPageVisits([]);
        setInteractions([]);
        setLoading(false);
        return;
      }

      // Aggregate page visits
      const visitMap = new Map<string, { count: number; lastVisited: string }>();
      for (const row of rows) {
        const existing = visitMap.get(row.pageRoute);
        if (existing) {
          existing.count++;
          if (row.createdAt > existing.lastVisited) {
            existing.lastVisited = row.createdAt;
          }
        } else {
          visitMap.set(row.pageRoute, { count: 1, lastVisited: row.createdAt });
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
      for (const row of rows) {
        interactionMap.set(row.interactionType, (interactionMap.get(row.interactionType) ?? 0) + 1);
      }

      const interactionStats: InteractionStat[] = Array.from(interactionMap.entries())
        .map(([interactionType, count]) => ({ interactionType, count }))
        .sort((a, b) => b.count - a.count);

      setPageVisits(visits);
      setInteractions(interactionStats);
      setLoading(false);
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
        <div className="flex items-center justify-center min-h-[300px] font-sans text-sm text-tertiary-foreground">
          Activity logging requires Supabase
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Activity Log" subtitle="Usage analytics for the prototype">
      <div className="flex gap-3 mb-5">
        {rangeOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={cn(
              "px-3.5 py-1.5 font-sans text-[13px] font-semibold border border-border rounded-md bg-background text-muted-foreground cursor-pointer transition-colors duration-150 hover:bg-secondary",
              range === opt.value && "bg-accent text-primary border-primary"
            )}
            onClick={() => setRange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[300px] font-sans text-sm text-tertiary-foreground">Loading…</div>
      ) : (
        <>
          <div className="mb-6 last:mb-0">
            <h2 className="text-base font-semibold text-foreground mb-4">Page Visits</h2>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <table className="w-full border-collapse font-sans text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground border-b-2 border-border text-xs uppercase tracking-wide">Page Route</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground border-b-2 border-border text-xs uppercase tracking-wide">Visit Count</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground border-b-2 border-border text-xs uppercase tracking-wide">Last Visited</th>
                  </tr>
                </thead>
                <tbody>
                  {pageVisits.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="text-center text-tertiary-foreground py-6 px-3">
                        No activity recorded yet
                      </td>
                    </tr>
                  ) : (
                    pageVisits.map((pv) => (
                      <tr key={pv.pageRoute}>
                        <td className="px-3 py-2.5 text-foreground border-b border-border last:border-b-0">{pv.pageRoute}</td>
                        <td className="px-3 py-2.5 text-foreground border-b border-border last:border-b-0">{pv.visitCount}</td>
                        <td className="px-3 py-2.5 text-foreground border-b border-border last:border-b-0">{formatDate(pv.lastVisited)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-6 last:mb-0">
            <h2 className="text-base font-semibold text-foreground mb-4">Interaction Frequency</h2>
            <div className="bg-background border border-border rounded-lg overflow-hidden">
              <table className="w-full border-collapse font-sans text-[13px]">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground border-b-2 border-border text-xs uppercase tracking-wide">Interaction Type</th>
                    <th className="text-left px-3 py-2.5 font-semibold text-muted-foreground border-b-2 border-border text-xs uppercase tracking-wide">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {interactions.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="text-center text-tertiary-foreground py-6 px-3">
                        No interactions recorded yet
                      </td>
                    </tr>
                  ) : (
                    interactions.map((stat) => (
                      <tr key={stat.interactionType}>
                        <td className="px-3 py-2.5 text-foreground border-b border-border last:border-b-0">{stat.interactionType}</td>
                        <td className="px-3 py-2.5 text-foreground border-b border-border last:border-b-0">{stat.count}</td>
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
