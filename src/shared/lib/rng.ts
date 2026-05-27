/**
 * Pluggable random-number generator.
 *
 * iOS code used `arc4random_uniform` and `Int.random(in:)` directly, which
 * makes tests non-deterministic. We inject an `RNG` so unit tests can use a
 * seeded `mulberry32` while production uses `Math.random`.
 */
export interface RNG {
  /** Uniformly distributed float in [0, 1). */
  next(): number;
  /** Integer in [min, max] inclusive. */
  nextInt(min: number, max: number): number;
}

export const defaultRng: RNG = {
  next: () => Math.random(),
  nextInt: (min, max) => min + Math.floor(Math.random() * (max - min + 1)),
};

/** Deterministic seeded RNG (mulberry32). For tests. */
export function seededRng(seed: number): RNG {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    nextInt: (min, max) => min + Math.floor(next() * (max - min + 1)),
  };
}
