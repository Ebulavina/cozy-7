/**
 * Ported from Source/Combination/Utilities/Constants.swift
 * Original SwiftUI sizing constants are dropped — the web layout is responsive
 * and uses CSS-grid with `aspect-ratio: 1`. Only board dimensions and durations
 * remain as game-logic-relevant constants.
 */
export const BOARD = {
  NUM_COLUMNS: 7,
  NUM_ROWS: 7,
} as const;

/** Initial steps before a new bottom row pushes up. Decreases over the game. */
export const STEPS_PER_SHIFT = 18;
/** Minimum steps per shift — the floor the difficulty can reach. */
export const MIN_STEPS_PER_SHIFT = 7;
/** After this many shifts the threshold drops by 1. */
export const SHIFTS_PER_STEP_REDUCTION = 7;

/** Animation timings — kept 1:1 with Constants.Scene */
export const TIMING = {
  SHORT_MS: 300, // shortDuration: 0.3
  LONG_MS: 700, // longDuration: 0.7
  SCALE: 1.3, // scale on removal
} as const;
