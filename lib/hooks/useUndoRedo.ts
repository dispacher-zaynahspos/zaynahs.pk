'use client';

/**
 * useUndoRedo — generic history stack for customizer state (Phase 1 foundation).
 *
 * Tracks snapshots of a value with undo/redo + a dirty flag relative to the last
 * committed (published) baseline. Phase 2 wires this into the customizer state so
 * "Save Layout / Publish" is distinct from the working draft.
 */
import { useCallback, useRef, useState } from 'react';

export interface UndoRedo<T> {
  state: T;
  set: (next: T | ((prev: T) => T)) => void;
  /** replace state WITHOUT pushing history (e.g. external sync). */
  reset: (next: T, markBaseline?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  /** mark the current state as the committed baseline (after Publish/Save). */
  commit: () => void;
}

export function useUndoRedo<T>(initial: T, maxHistory = 50): UndoRedo<T> {
  const [state, setState] = useState<T>(initial);
  const past = useRef<T[]>([]);
  const future = useRef<T[]>([]);
  const baseline = useRef<T>(initial);
  const [, force] = useState(0);
  const rerender = () => force((n) => n + 1);

  const set = useCallback((next: T | ((prev: T) => T)) => {
    setState((prev) => {
      const value = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
      past.current.push(prev);
      if (past.current.length > maxHistory) past.current.shift();
      future.current = [];
      return value;
    });
    rerender();
  }, [maxHistory]);

  const reset = useCallback((next: T, markBaseline = true) => {
    past.current = [];
    future.current = [];
    if (markBaseline) baseline.current = next;
    setState(next);
    rerender();
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (past.current.length === 0) return prev;
      const previous = past.current.pop() as T;
      future.current.push(prev);
      return previous;
    });
    rerender();
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (future.current.length === 0) return prev;
      const next = future.current.pop() as T;
      past.current.push(prev);
      return next;
    });
    rerender();
  }, []);

  const commit = useCallback(() => {
    baseline.current = state;
    rerender();
  }, [state]);

  const isDirty = JSON.stringify(state) !== JSON.stringify(baseline.current);

  return {
    state,
    set,
    reset,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
    isDirty,
    commit,
  };
}
