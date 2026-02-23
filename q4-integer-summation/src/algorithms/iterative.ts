import type { WholeNumber, SummationResult } from '../types';

/**
 * Iterative approach using a for-loop accumulator.
 *
 * Time:  O(n) — visits each integer from 1 to n exactly once
 * Space: O(1) — single mutable accumulator, no call stack growth
 */
export function computeSumIteratively(n: WholeNumber): SummationResult {
  let accumulator = 0;
  for (let counter = 1; counter <= n; counter++) {
    accumulator += counter;
  }
  return {
    method: 'iterative-loop',
    input: n,
    output: accumulator,
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
  };
}
