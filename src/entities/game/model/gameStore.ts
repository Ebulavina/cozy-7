/**
 * gameStore — combined port of:
 *   - Source/Combination/Models/Store.swift     (game session state)
 *   - Source/Combination/AppState.swift         (persistence)
 *   - Source/Combination/Models/SceneStore.swift (restart)
 *
 * Why one store: SwiftUI used two ObservableObjects (Store + SceneStore)
 * because the SpriteKit scene was an external imperative thing. In React the
 * scene is just JSX, so one zustand store owning board + score + flags is
 * cleaner and removes the singleton (Dependency.shared) entirely.
 */
import { create } from 'zustand';
import { Level } from '@entities/board/lib/level';
import type {
  Cell,
  CellMove,
  CellType,
  RemovedCell,
} from '@entities/board/model/types';
import { isColored } from '@entities/board/model/types';
import { randomCellType } from '@entities/board/lib/cellType';
import { Grid } from '@entities/board/lib/grid';
import { BOARD, STEPS_PER_SHIFT, MIN_STEPS_PER_SHIFT, SHIFTS_PER_STEP_REDUCTION } from '@shared/config/constants';
import { storage } from '@shared/lib/storage';
import { uid } from '@shared/lib/uid';

export type ToastVariant = 'info';
export type ToastKey = 'newLine' | 'clearBoard' | 'newComboRecord';

export interface Toast {
  id: string;
  key: ToastKey;
  variant: ToastVariant;
}

const PERSIST_KEY = 'gameState';
const BEST_SCORE_KEY = 'bestScore';
const BEST_COMBO_KEY = 'bestCombo';
const BEST_COMBO_SCORE_KEY = 'bestComboScore';

interface PersistShape {
  cells: (Cell | null)[];
  score: number;
  nextType: CellType;
  stepsSinceShift: number;
  shiftCount: number;
  isGameOver: boolean;
}

export interface GameStore {
  // domain
  level: Level;

  // session state (mirrors Store.swift)
  score: number;
  bestScore: number;
  bestCombo: number;
  bestComboScore: number;
  nextType: CellType;
  /** integer counter 0..stepsPerShift-1 */
  stepsSinceShift: number;
  /** total shifts completed — used to derive stepsPerShift */
  shiftCount: number;
  /** current threshold, decreases from STEPS_PER_SHIFT down to MIN_STEPS_PER_SHIFT */
  stepsPerShift: number;
  isGameOver: boolean;

  // UI animation state — kept here so the renderer can show transitions
  /** cells currently animating out (by id) */
  removingIds: ReadonlySet<string>;
  /** true while the board is animating a new bottom row shifting everything up */
  isShiftingUp: boolean;
  /** "+score" popups */
  popups: { id: string; column: number; row: number; score: number; x2: boolean }[];
  /** blocks user input while animations resolve */
  isAnimating: boolean;
  /** monotonic counter used to force-remount cells if needed */
  boardVersion: number;

  /** screen-center banners (new line, combo, etc.) */
  toasts: Toast[];

  // actions
  newGame(): void;
  setIsGameOver(value: boolean): void;
  setRemoving(ids: ReadonlySet<string>): void;
  clearRemoving(): void;
  /** Set isShiftingUp and bump boardVersion atomically so the animation starts with updated positions. */
  beginShiftUp(): void;
  clearShiftUp(): void;
  applyMatchSideEffects(removed: RemovedCell[], iterMultiplier: number): void;
  popPopup(id: string): void;
  applyGravityMoves(_moves: CellMove[]): void;
  setAnimating(v: boolean): void;
  setNextType(t: CellType): void;
  resetStep(): void;
  incrementStep(): void;
  incrementShiftCount(): void;
  bumpBoardVersion(): void;
  /** lower-level setter used by the game loop after each Level.* mutation. */
  syncFromLevel(): void;
  addBonusScore(points: number): void;
  pushToast(key: ToastKey, variant?: ToastVariant): void;
  popToast(id: string): void;
  updateBestCombo(combo: number): void;
  updateBestComboScore(score: number): void;

  // persistence
  saveSnapshot(): void;
  restoreSnapshot(): boolean;
}

export const useGameStore = create<GameStore>((set, get) => ({
  level: new Level(),

  score: 0,
  bestScore: storage.get<number>(BEST_SCORE_KEY) ?? 0,
  bestCombo: storage.get<number>(BEST_COMBO_KEY) ?? 0,
  bestComboScore: storage.get<number>(BEST_COMBO_SCORE_KEY) ?? 0,
  nextType: randomCellType(),
  stepsSinceShift: 0,
  shiftCount: 0,
  stepsPerShift: STEPS_PER_SHIFT,
  isGameOver: false,

  removingIds: new Set(),
  isShiftingUp: false,
  popups: [],
  toasts: [],
  isAnimating: false,
  boardVersion: 0,

  newGame() {
    set({
      level: new Level(),
      score: 0,
      nextType: randomCellType(),
      stepsSinceShift: 0,
      shiftCount: 0,
      stepsPerShift: STEPS_PER_SHIFT,
      isGameOver: false,
      removingIds: new Set(),
      isShiftingUp: false,
      popups: [],
      toasts: [],
      isAnimating: false,
      boardVersion: get().boardVersion + 1,
    });
    storage.remove(PERSIST_KEY);
  },

  setIsGameOver(value) {
    set({ isGameOver: value });
  },

  setRemoving(ids) {
    set({ removingIds: ids });
  },

  clearRemoving() {
    set({ removingIds: new Set() });
  },

  beginShiftUp() {
    set({ isShiftingUp: true, boardVersion: get().boardVersion + 1 });
  },

  clearShiftUp() {
    set({ isShiftingUp: false });
  },

  applyMatchSideEffects(removed, iterMultiplier) {
    let added = 0;
    const popups = [...get().popups];
    for (const r of removed) {
      const score = iterMultiplier * r.scoreMultiplier;
      added += score;
      popups.push({
        id: `${r.cellId}-pop`,
        column: r.column,
        row: r.row,
        score: iterMultiplier,
        x2: r.scoreMultiplier > 1,
      });
    }
    const newScore = get().score + added;
    const newBest = Math.max(get().bestScore, newScore);
    if (newBest > get().bestScore) {
      storage.set<number>(BEST_SCORE_KEY, newBest);
    }
    set({ score: newScore, bestScore: newBest, popups });
  },

  popPopup(id) {
    set({ popups: get().popups.filter((p) => p.id !== id) });
  },

  applyGravityMoves(_moves) {
    // The actual matrix mutation already happened inside Level.applyGravity().
    // We only need to force a re-render so positions reflect new (column,row).
    set({ boardVersion: get().boardVersion + 1 });
  },

  setAnimating(v) {
    set({ isAnimating: v });
  },

  setNextType(t) {
    set({ nextType: t });
  },

  resetStep() {
    set({ stepsSinceShift: 0 });
  },

  incrementStep() {
    set({ stepsSinceShift: get().stepsSinceShift + 1 });
  },

  incrementShiftCount() {
    const next = get().shiftCount + 1;
    const stepsPerShift = Math.max(
      MIN_STEPS_PER_SHIFT,
      STEPS_PER_SHIFT - Math.floor(next / SHIFTS_PER_STEP_REDUCTION),
    );
    set({ shiftCount: next, stepsPerShift });
  },

  bumpBoardVersion() {
    set({ boardVersion: get().boardVersion + 1 });
  },

  addBonusScore(points) {
    const newScore = get().score + points;
    const newBest = Math.max(get().bestScore, newScore);
    if (newBest > get().bestScore) {
      storage.set<number>(BEST_SCORE_KEY, newBest);
    }
    set({ score: newScore, bestScore: newBest });
  },

  pushToast(key, variant = 'info') {
    set({ toasts: [...get().toasts, { id: uid(), key, variant }] });
  },

  popToast(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  updateBestCombo(combo) {
    if (combo <= get().bestCombo) return;
    storage.set<number>(BEST_COMBO_KEY, combo);
    set({ bestCombo: combo });
  },

  updateBestComboScore(score) {
    if (score <= get().bestComboScore) return;
    storage.set<number>(BEST_COMBO_SCORE_KEY, score);
    set({ bestComboScore: score });
    get().pushToast('newComboRecord');
  },

  syncFromLevel() {
    set({ boardVersion: get().boardVersion + 1 });
  },

  // --- persistence ---
  saveSnapshot() {
    const { level, score, nextType, stepsSinceShift, shiftCount, isGameOver } = get();
    // Only persist cell.type and id, the same shape as the in-memory Cell.
    const cells: (Cell | null)[] = [];
    for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
      for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
        cells[row * BOARD.NUM_COLUMNS + column] = level.grid.get(column, row);
      }
    }
    const snapshot: PersistShape = {
      cells,
      score,
      nextType,
      stepsSinceShift,
      shiftCount,
      isGameOver,
    };
    storage.set<PersistShape>(PERSIST_KEY, snapshot);
  },

  restoreSnapshot() {
    const snap = storage.get<PersistShape>(PERSIST_KEY);
    if (!snap) return false;
    const grid = new Grid(BOARD.NUM_COLUMNS, BOARD.NUM_ROWS, snap.cells);
    const level = new Level(grid);
    // sanity-check nextType
    const next =
      typeof snap.nextType === 'number' || snap.nextType === 'gray' || snap.nextType === 'black'
        ? snap.nextType
        : randomCellType();
    const shiftCount = snap.shiftCount ?? 0;
    const stepsPerShift = Math.max(
      MIN_STEPS_PER_SHIFT,
      STEPS_PER_SHIFT - Math.floor(shiftCount / SHIFTS_PER_STEP_REDUCTION),
    );
    set({
      level,
      score: snap.score ?? 0,
      nextType: next,
      stepsSinceShift: snap.stepsSinceShift ?? 0,
      shiftCount,
      stepsPerShift,
      isGameOver: snap.isGameOver ?? false,
      removingIds: new Set(),
      isShiftingUp: false,
      popups: [],
      isAnimating: false,
      boardVersion: get().boardVersion + 1,
    });
    return true;
  },
}));

/** Helper for tests / non-React code. */
export const _selectColoredCount = (s: GameStore): number => {
  let count = 0;
  for (let row = 0; row < BOARD.NUM_ROWS; row += 1) {
    for (let column = 0; column < BOARD.NUM_COLUMNS; column += 1) {
      const c = s.level.grid.get(column, row);
      if (c && isColored(c.type)) count += 1;
    }
  }
  return count;
};

export { PERSIST_KEY as _PERSIST_KEY };
