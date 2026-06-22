/**
 * Radical simplification utilities.
 * Uses pure integer arithmetic — no floating-point, no precision issues.
 *
 * Example: simplifyRadical(50) → { coefficient: 5, radicand: 2 }
 *          because √50 = √(25×2) = 5√2
 */

export interface RadicalForm {
  /** The coefficient outside the radical (the 'a' in a√b) */
  coefficient: number;
  /** The number remaining under the radical (the 'b' in a√b) */
  radicand: number;
}

export interface FractionRadicalForm {
  /** Coefficient outside the radical */
  coefficient: number;
  /** Number under the radical sign */
  radicand: number;
  /** Denominator (after rationalizing if needed) */
  denominator: number;
  /** Whether the result is a perfect integer (no radical needed) */
  isPerfect: boolean;
}

/**
 * Simplify √n into a√b form where b has no perfect square factors.
 *
 * Algorithm: Find the largest perfect square factor of n.
 * For each prime p, while p² divides n, extract p from the radical.
 */
export function simplifyRadical(n: number): RadicalForm {
  if (n < 0) throw new Error('Cannot take square root of negative number');
  if (n === 0) return { coefficient: 0, radicand: 0 };
  if (n === 1) return { coefficient: 1, radicand: 1 };

  let coefficient = 1;
  let radicand = n;

  // Extract factors of 2
  while (radicand % 4 === 0) {
    coefficient *= 2;
    radicand = Math.floor(radicand / 4);
  }

  // Extract odd prime factors
  let factor = 3;
  while (factor * factor <= radicand) {
    while (radicand % (factor * factor) === 0) {
      coefficient *= factor;
      radicand = Math.floor(radicand / (factor * factor));
    }
    factor += 2;
  }

  return { coefficient, radicand };
}

/**
 * Compute the simplified radical form of √(p/q) where p/q is an exact fraction.
 *
 * Strategy:
 *   √(p/q) = √(p·q) / q
 *   Then simplify √(p·q) = a√b
 *   Result = a√b / q
 *   Finally reduce a/q to lowest terms.
 *
 * Example: √(15/2) = √30 / 2 → coefficient=1, radicand=30, denominator=2
 * Example: √(11/1) = √11 / 1 → coefficient=1, radicand=11, denominator=1
 */
export function sqrtOfFraction(numerator: number, denominator: number): FractionRadicalForm {
  if (numerator < 0) throw new Error('Cannot take square root of negative number');
  if (numerator === 0) return { coefficient: 0, radicand: 0, denominator: 1, isPerfect: true };

  // √(p/q) = √(p*q) / q
  const product = numerator * denominator;
  const { coefficient, radicand } = simplifyRadical(product);

  // Reduce coefficient/denominator by their GCD
  const g = gcd(coefficient, denominator);
  const finalCoefficient = coefficient / g;
  const finalDenominator = denominator / g;

  // Check if it's a perfect square (radicand = 1)
  const isPerfect = radicand === 1;

  return {
    coefficient: finalCoefficient,
    radicand,
    denominator: finalDenominator,
    isPerfect,
  };
}

/**
 * Format a FractionRadicalForm as a display string.
 *
 * Examples:
 *   { coefficient: 5, radicand: 2, denominator: 1 }  → "5√2"
 *   { coefficient: 1, radicand: 11, denominator: 1 }  → "√11"
 *   { coefficient: 1, radicand: 30, denominator: 2 }  → "√30 / 2"
 *   { coefficient: 3, radicand: 1, denominator: 1 }   → "3" (perfect square)
 *   { coefficient: 3, radicand: 5, denominator: 2 }   → "3√5 / 2"
 */
export function formatRadical(form: FractionRadicalForm): string {
  if (form.isPerfect || form.radicand === 1) {
    // Perfect square
    if (form.denominator === 1) {
      return `${form.coefficient}`;
    }
    return `${form.coefficient}/${form.denominator}`;
  }

  let radicalPart = '';
  if (form.coefficient === 1) {
    radicalPart = `√${form.radicand}`;
  } else {
    radicalPart = `${form.coefficient}√${form.radicand}`;
  }

  if (form.denominator === 1) {
    return radicalPart;
  }
  return `${radicalPart} / ${form.denominator}`;
}

/** Greatest Common Divisor using Euclidean algorithm */
function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
