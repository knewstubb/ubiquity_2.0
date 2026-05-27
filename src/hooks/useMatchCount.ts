import { useState, useEffect, useRef, useCallback } from 'react';
import type { SourceConfig } from '../models/source-selection';
import { isSourceConfigComplete } from '../utils/source-selection-validation';

const DEBOUNCE_MS = 500;
const TIMEOUT_MS = 10_000;

interface MatchCountResult {
  count: number | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

/**
 * Computes a deterministic match count based on the source config.
 * Uses simple heuristics to simulate realistic record counts.
 */
function computeCount(config: SourceConfig): number {
  switch (config.primarySource) {
    case 'contacts': {
      const filter = config.filter;
      switch (filter.type) {
        case 'all':
          return 4231;
        case 'unsubscribed':
          return 312;
        case 'created_in_last_n_days':
          return Math.round((filter.days ?? 30) * 14.2);
        case 'in_list_segment':
          return 876;
        case 'not_sent_campaign':
          return 1543;
      }
      break;
    }
    case 'transactions': {
      const filter = config.filter;
      switch (filter.type) {
        case 'all':
          return 8472;
        case 'created_in_last_n_days':
          return Math.round((filter.days ?? 30) * 28.5);
        case 'field_filter': {
          const rowCount = filter.fieldFilters?.length ?? 1;
          return Math.max(100, Math.round(8472 / Math.pow(2, rowCount)));
        }
      }
      break;
    }
    case 'messages': {
      const filter = config.filter;
      switch (filter.type) {
        case 'all':
          return 15320;
        case 'by_status': {
          const statusCount = filter.statuses?.length ?? 1;
          return Math.round(15320 * (statusCount / 4) * 0.8);
        }
        case 'for_campaign':
          return 2104;
        case 'in_date_range':
          return 5678;
      }
      break;
    }
  }
}

/**
 * Hook that computes a debounced match count for the given source config.
 *
 * - When `sourceConfig` is null or incomplete, returns count as null with no loading/error.
 * - Debounces config changes by 500ms before starting computation.
 * - Simulates async computation with a 300–800ms random delay.
 * - Implements a 10s timeout that triggers error state.
 * - Cancels previous computations when config changes.
 * - `retry()` resets error state and re-triggers computation.
 */
export function useMatchCount(sourceConfig: SourceConfig | null): MatchCountResult {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const computeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  const cleanup = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (computeTimerRef.current !== null) {
      clearTimeout(computeTimerRef.current);
      computeTimerRef.current = null;
    }
    if (timeoutTimerRef.current !== null) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    cancelledRef.current = true;
  }, []);

  const retry = useCallback(() => {
    setError(false);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Clean up any in-flight computation
    cleanup();
    cancelledRef.current = false;

    // If config is null or incomplete, reset to idle state
    if (sourceConfig === null || !isSourceConfigComplete(sourceConfig)) {
      setCount(null);
      setLoading(false);
      setError(false);
      return;
    }

    // Debounce before starting computation
    debounceTimerRef.current = setTimeout(() => {
      if (cancelledRef.current) return;

      setLoading(true);
      setError(false);

      // Start timeout timer
      timeoutTimerRef.current = setTimeout(() => {
        if (cancelledRef.current) return;
        // Timeout exceeded — set error state
        setLoading(false);
        setError(true);
      }, TIMEOUT_MS);

      // Simulate async computation with random delay (300–800ms)
      const delay = 300 + Math.random() * 500;
      computeTimerRef.current = setTimeout(() => {
        if (cancelledRef.current) return;

        // Clear the timeout timer since we completed in time
        if (timeoutTimerRef.current !== null) {
          clearTimeout(timeoutTimerRef.current);
          timeoutTimerRef.current = null;
        }

        const result = computeCount(sourceConfig);
        setCount(result);
        setLoading(false);
      }, delay);
    }, DEBOUNCE_MS);

    return cleanup;
  }, [sourceConfig, retryTrigger, cleanup]);

  // When config is null, return noop state
  if (sourceConfig === null) {
    return { count: null, loading: false, error: false, retry };
  }

  return { count, loading, error, retry };
}
