/**
 * Branded integer type to enforce domain constraints at the type level.
 * Prevents passing arbitrary numbers where a non-negative integer is expected.
 */
export type WholeNumber = number & { readonly __brand: 'WholeNumber' };

export function asWholeNumber(n: number): WholeNumber {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`Expected a non-negative integer, received: ${n}`);
  }
  return n as WholeNumber;
}

export interface SummationResult {
  readonly method: string;
  readonly input: WholeNumber;
  readonly output: number;
  readonly timeComplexity: string;
  readonly spaceComplexity: string;
}
