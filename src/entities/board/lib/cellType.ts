/**
 * Random helpers ported from Source/Combination/Models/CombType.swift.
 *
 * iOS:
 *   static func random() -> CombType          // 1..9 (incl. gray=8, black=9)
 *   static func randomWithoutGrayAndBlack()   // 1..7
 *   static func randomOnlyGrayOrBlack()       // 8..9
 *
 * Web mapping: numeric types 1..7 stay numeric; gray=8, black=9 in iOS are
 * surfaced as string literals here for ergonomic discrimination, but the random
 * indices follow the original distribution exactly.
 */
import type { CellType, ColoredCellType, ObstacleCellType } from '../model/types';
import type { RNG } from '@shared/lib/rng';
import { defaultRng } from '@shared/lib/rng';

const COLORED: readonly ColoredCellType[] = [1, 2, 3, 4, 5, 6, 7];
const OBSTACLES: readonly ObstacleCellType[] = ['gray', 'black'];

/** Any cell type — colored (1..7) or obstacle (gray/black). 1:1 with CombType.random(). */
export function randomCellType(rng: RNG = defaultRng): CellType {
  const idx = rng.nextInt(0, 8); // 9 options
  return idx < 7 ? COLORED[idx]! : OBSTACLES[idx - 7]!;
}

/** Only 1..7. 1:1 with CombType.randomWithoutGrayAndBlack(). */
export function randomColored(rng: RNG = defaultRng): ColoredCellType {
  return COLORED[rng.nextInt(0, 6)]!;
}

/** Only gray/black. 1:1 with CombType.randomOnlyGrayOrBlack(). */
export function randomObstacle(rng: RNG = defaultRng): ObstacleCellType {
  return OBSTACLES[rng.nextInt(0, 1)]!;
}
