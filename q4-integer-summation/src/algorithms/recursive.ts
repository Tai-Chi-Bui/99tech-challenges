import type { WholeNumber, SummationResult } from '../types';

function descend(n: number): number {
  if (n <= 0) return 0;
  return n + descend(n - 1);
}

/**
 * Recursive descent — delegates to a private helper so the public
 * signature stays clean and the internal recursion detail stays hidden.
 *
 * Time:  O(n) — one stack frame per integer from n down to 0
 * Space: O(n) — call stack depth grows linearly with n
 */
export function computeSumRecursively(n: WholeNumber): SummationResult {
  return {
    method: 'recursive-descent',
    input: n,
    output: descend(n),
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
  };
}
