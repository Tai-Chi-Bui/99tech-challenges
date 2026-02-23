import { asWholeNumber } from './types';
import { computeSumIteratively } from './algorithms/iterative';
import { computeSumRecursively } from './algorithms/recursive';
import { computeSumByFormula } from './algorithms/closed-form';

const testCases = [1, 5, 10, 100].map(asWholeNumber);

console.log('=== Integer Summation: Three Approaches ===\n');

for (const input of testCases) {
  const results = [
    computeSumIteratively(input),
    computeSumRecursively(input),
    computeSumByFormula(input),
  ];

  console.log(`Input n = ${input}`);
  for (const r of results) {
    console.log(
      `  [${r.method.padEnd(20)}]  output = ${String(r.output).padStart(6)}  time = ${r.timeComplexity.padEnd(5)}  space = ${r.spaceComplexity}`,
    );
  }
  console.log();
}
