import Big from 'big.js';
import { normalizeArabicText, removeDiacritics, validateArabicInput } from './rules';
import { Fraction } from './fraction';
import { sqrtOfFraction, formatRadical, FractionRadicalForm } from './radical';
import { reduceDecimalDigits, DecimalReductionResult } from './reduce';

// Configure Big.js for maximum precision
Big.DP = 120;        // 120 decimal places
Big.RM = Big.roundDown; // Truncate, never round up

/**
 * Number of SIGNIFICANT digits for digit-sum reduction.
 * 10 sig figs with rounding matches the user's calculator exactly.
 * Example: √(15/2) → 2.738612788 (10 sig digits, 9 decimal places)
 */
const SIGNIFICANT_DIGITS = 10;

/** Decimal display precision */
const DISPLAY_PRECISION = 50;

/**
 * Step 2 result: position weighting for a single character instance
 */
export interface PositionWeightResult {
  /** 1-indexed position in the text */
  position: number;
  /** The exact formula string: "p² / N" */
  formula: string;
  /** The exact fraction result (e.g., "9/4") */
  exactValue: string;
  /** Decimal approximation for display */
  decimalValue: string;
}

/**
 * Per-character analysis across all steps
 */
export interface CharAnalysis {
  /** The normalized character */
  char: string;
  /** All positions where this character appears (1-indexed) */
  positions: number[];
  /** Step 2: position weighting results for each occurrence */
  positionWeights: PositionWeightResult[];
  /** Step 3: sum of all position weights as exact fraction */
  charTotal: string;
  /** Step 3: decimal form of charTotal */
  charTotalDecimal: string;
}

/**
 * Complete calculation result across all 5 steps
 */
export interface CalculationResult {
  /** Original input text */
  original: string;
  /** Normalized text (after diacritic removal and character mapping) */
  normalized: string;
  /** Step 1: total character count (N) */
  totalChars: number;
  /** Step 1: character positions list (visual mapping) */
  charPositions: { char: string; position: number }[];
  /** Steps 2-3: per-character analysis */
  charAnalysis: CharAnalysis[];
  /** Step 4: grand total as exact fraction string */
  grandTotal: string;
  /** Step 4: grand total as decimal string */
  grandTotalDecimal: string;
  /** Step 5: radical form of √(grandTotal) */
  radicalForm: FractionRadicalForm;
  /** Step 5: radical form display string */
  radicalDisplay: string;
  /** Step 5: √(grandTotal) as high-precision decimal */
  sqrtDecimal: string;
  /** Step 5: √ rounded to significant digits for reduction */
  sqrtRounded: string;
  /** Step 5: digit-sum reduction of the square root */
  digitReduction: DecimalReductionResult;
}

/**
 * Main calculation function implementing the 5-step algorithm:
 *
 * Step 1: Natural Count — count characters, assign positions
 * Step 2: Position Weighting — for each char at position p: (p/N) × p = p²/N
 * Step 3: Character Aggregation — sum step 2 results per unique character
 * Step 4: Grand Total — sum all character totals
 * Step 5: Square Root — √(total) with radical simplification + digit reduction
 */
export function calculateArabicPower(text: string): CalculationResult {
  // Clean and validate
  const cleaned = removeDiacritics(text);

  if (!validateArabicInput(cleaned)) {
    throw new Error('Input must contain only Arabic characters');
  }

  // Normalize (handles specific mappings like ة -> ت, أ/إ/آ -> أ, etc.)
  const normalized = normalizeArabicText(cleaned);

  // ── Step 1: Natural Count ──
  // Build position map (1-indexed, ignoring whitespace)
  const charMap = new Map<string, number[]>();
  const charOrder: string[] = [];
  const charPositions: { char: string; position: number }[] = [];
  let position = 0;

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (char === ' ' || char === '\n' || char === '\t') continue;

    position++;

    if (!charMap.has(char)) {
      charMap.set(char, []);
      charOrder.push(char);
    }
    charMap.get(char)!.push(position);
    charPositions.push({ char, position });
  }

  const N = position; // total character count

  if (N === 0) {
    throw new Error('No valid characters found in input');
  }

  const nFraction = Fraction.fromInt(N);

  // ── Steps 2 & 3: Position Weighting + Character Aggregation ──
  let grandTotalFraction = Fraction.zero();
  const charAnalysis: CharAnalysis[] = charOrder.map(char => {
    const positions = charMap.get(char)!;

    // Step 2: compute p²/N for each position
    const positionWeights: PositionWeightResult[] = positions.map(p => {
      // Exact: p² / N
      const pSquared = Fraction.fromInt(p * p);
      const result = pSquared.divide(nFraction);

      return {
        position: p,
        formula: `${p}² / ${N} = ${p * p} / ${N}`,
        exactValue: result.toString(),
        decimalValue: result.toDecimal(20),
      };
    });

    // Step 3: sum all position weights for this character
    let charTotalFraction = Fraction.zero();
    for (const pw of positionWeights) {
      const p = pw.position;
      const pSquared = Fraction.fromInt(p * p);
      const result = pSquared.divide(nFraction);
      charTotalFraction = charTotalFraction.add(result);
    }

    // Accumulate into grand total
    grandTotalFraction = grandTotalFraction.add(charTotalFraction);

    return {
      char,
      positions,
      positionWeights,
      charTotal: charTotalFraction.toString(),
      charTotalDecimal: charTotalFraction.toDecimal(20),
    };
  });

  // ── Step 4: Grand Total ──
  const grandTotal = grandTotalFraction.toString();
  const grandTotalDecimal = grandTotalFraction.toDecimal(DISPLAY_PRECISION);

  // ── Step 5: Square Root & Simplification ──
  // 5a: Radical simplification (exact integer math)
  const num = grandTotalFraction.numAsNumber();
  const den = grandTotalFraction.denAsNumber();
  const radicalForm = sqrtOfFraction(num, den);
  const radicalDisplay = formatRadical(radicalForm);

  // 5b: High-precision decimal square root using Big.js
  const grandTotalBig = new Big(grandTotalFraction.num.toString()).div(
    new Big(grandTotalFraction.den.toString())
  );
  const sqrtDecimal = bigSqrt(grandTotalBig, DISPLAY_PRECISION + 20);

  // 5c: Round to significant digits for reduction
  // Uses 10 significant digits with standard rounding (matching calculator behavior)
  const sqrtRounded = roundToSignificantDigits(sqrtDecimal, SIGNIFICANT_DIGITS);

  // 5d: Digit-sum reduction on the rounded value
  const roundedParts = sqrtRounded.split('.');
  const numDecimalDigits = (roundedParts[1] || '').length;
  const digitReduction = reduceDecimalDigits(sqrtRounded, numDecimalDigits);

  return {
    original: text,
    normalized,
    totalChars: N,
    charPositions,
    charAnalysis,
    grandTotal,
    grandTotalDecimal,
    radicalForm,
    radicalDisplay,
    sqrtDecimal,
    sqrtRounded,
    digitReduction,
  };
}

/**
 * Compute square root of a Big number using Newton's method
 * with arbitrary precision.
 *
 * Uses iterative refinement: x_{n+1} = (x_n + S/x_n) / 2
 * Converges quadratically (doubles correct digits each iteration).
 */
function bigSqrt(value: Big, precision: number): string {
  if (value.lt(0)) throw new Error('Cannot compute square root of negative number');
  if (value.eq(0)) return '0.' + '0'.repeat(precision);

  // Set working precision much higher than needed
  const workingPrecision = precision + 40;
  const prevDP = Big.DP;
  const prevRM = Big.RM;
  Big.DP = workingPrecision;
  Big.RM = Big.roundDown;

  // Initial guess using JS native sqrt
  let x = new Big(Math.sqrt(Number(value)) || 1);

  // Newton's method iterations
  // Each iteration roughly doubles the number of correct digits
  // 60 iterations is more than enough for any reasonable precision
  const two = new Big(2);
  for (let i = 0; i < 60; i++) {
    const nextX = x.plus(value.div(x)).div(two);
    // Check convergence
    if (nextX.eq(x)) break;
    x = nextX;
  }

  const result = x.toFixed(precision);

  // Restore settings
  Big.DP = prevDP;
  Big.RM = prevRM;

  return result;
}

/**
 * Round a decimal string to a specified number of significant digits.
 * Uses standard rounding (half-up), matching scientific calculator behavior.
 *
 * Example: roundToSignificantDigits("2.7386127875...", 10) → "2.738612788"
 * Example: roundToSignificantDigits("3.3166247903...", 10) → "3.316624790"
 */
function roundToSignificantDigits(decimalStr: string, sigFigs: number): string {
  const prevDP = Big.DP;
  const prevRM = Big.RM;
  Big.DP = 200;
  Big.RM = Big.roundHalfUp; // Standard rounding

  const val = new Big(decimalStr);

  // Find how many decimal places correspond to sigFigs significant digits
  // For a number like 2.738..., integer part "2" has 1 digit, so we need sigFigs - 1 = 9 decimal places
  // For a number like 11.234..., integer part "11" has 2 digits, so we need sigFigs - 2 = 8 decimal places
  const intPart = decimalStr.split('.')[0] || '0';
  const intPartClean = intPart.replace(/^-/, ''); // remove negative sign
  const intDigits = intPartClean === '0' ? 1 : intPartClean.length;
  const decimalPlaces = Math.max(0, sigFigs - intDigits);

  const result = val.toFixed(decimalPlaces);

  Big.DP = prevDP;
  Big.RM = prevRM;

  return result;
}
