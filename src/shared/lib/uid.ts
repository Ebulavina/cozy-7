/**
 * Stable id factory. Replaces SpriteKit's `SKSpriteNode === SKSpriteNode`
 * identity check used in Level.swift (e.g. when promoting a row+column match
 * to a x2 multiplier). React needs string keys anyway.
 */
let counter = 0;
export function uid(): string {
  counter += 1;
  // monotonic + random suffix → collision-free across reloads
  return `c${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** For tests: reset counter for deterministic ids. */
export function _resetUidCounter(): void {
  counter = 0;
}
