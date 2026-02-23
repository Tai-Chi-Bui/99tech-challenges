import type { WholeNumber, SummationResult } from '../types';

/**
 * Gauss closed-form formula: n × (n + 1) / 2
 *
 * No iteration, no recursion — pure arithmetic.
 * Constant time and space regardless of how large n gets.
 *
 * Time:  O(1)
 * Space: O(1)
 */
export function computeSumByFormula(n: WholeNumber): SummationResult {
  const value = (n * (n + 1)) / 2;
  return {
    method: 'gauss-closed-form',
    input: n,
    output: value,
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  };
}
