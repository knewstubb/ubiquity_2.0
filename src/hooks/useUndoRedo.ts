import { useState, useCallback, useRef } from 'react';

export interface UndoRedoState<T> {
  /** Current state value */
  current: T;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Number of undo steps available */
  undoCount: number;
  /** Number of redo steps available */
  redoCount: number;
}

export interface UndoRedoActions<T> {
  /** Set new state and push to history */
  set: (value: T) => void;
  /** Undo to previous state */
  undo: () => void;
  /** Redo to next state */
  redo: () => void;
  /** Reset history with a new initial state */
  reset: (value: T) => void;
}

export interface UseUndoRedoOptions {
  /** Maximum number of history entries to keep (default: 50) */
  maxHistory?: number;
}

/**
 * Hook for managing undo/redo state history.
 * 
 * @param initialState - The initial state value
 * @param options - Configuration options
 * @returns [state, actions] tuple with current state info and control functions
 * 
 * @example
 * const [state, { set, undo, redo }] = useUndoRedo({ nodes: [], edges: [] });
 * 
 * // Make a change
 * set({ nodes: [...], edges: [...] });
 * 
 * // Undo the change
 * if (state.canUndo) undo();
 * 
 * // Redo the change
 * if (state.canRedo) redo();
 */
export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): [UndoRedoState<T>, UndoRedoActions<T>] {
  const { maxHistory = 50 } = options;

  // History stack: past states (most recent at end)
  const [past, setPast] = useState<T[]>([]);
  
  // Current state
  const [present, setPresent] = useState<T>(initialState);
  
  // Future stack: states that were undone (most recent undo at end)
  const [future, setFuture] = useState<T[]>([]);

  // Track if we're in the middle of an undo/redo to avoid loops
  const isUndoRedoRef = useRef(false);

  /**
   * Set new state and push current to history.
   * Clears the redo stack since we're branching from this point.
   */
  const set = useCallback((newState: T) => {
    if (isUndoRedoRef.current) return;

    setPast((prev) => {
      const newPast = [...prev, present];
      // Trim history if it exceeds max
      if (newPast.length > maxHistory) {
        return newPast.slice(newPast.length - maxHistory);
      }
      return newPast;
    });
    setPresent(newState);
    setFuture([]); // Clear redo stack on new action
  }, [present, maxHistory]);

  /**
   * Undo to the previous state.
   */
  const undo = useCallback(() => {
    if (past.length === 0) return;

    isUndoRedoRef.current = true;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    setPast(newPast);
    setPresent(previous);
    setFuture((prev) => [...prev, present]);

    // Reset flag after state updates
    requestAnimationFrame(() => {
      isUndoRedoRef.current = false;
    });
  }, [past, present]);

  /**
   * Redo to the next state (if available).
   */
  const redo = useCallback(() => {
    if (future.length === 0) return;

    isUndoRedoRef.current = true;

    const next = future[future.length - 1];
    const newFuture = future.slice(0, -1);

    setPast((prev) => [...prev, present]);
    setPresent(next);
    setFuture(newFuture);

    // Reset flag after state updates
    requestAnimationFrame(() => {
      isUndoRedoRef.current = false;
    });
  }, [future, present]);

  /**
   * Reset history with a new initial state.
   * Clears both undo and redo stacks.
   */
  const reset = useCallback((newState: T) => {
    setPast([]);
    setPresent(newState);
    setFuture([]);
  }, []);

  const state: UndoRedoState<T> = {
    current: present,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoCount: past.length,
    redoCount: future.length,
  };

  const actions: UndoRedoActions<T> = {
    set,
    undo,
    redo,
    reset,
  };

  return [state, actions];
}
