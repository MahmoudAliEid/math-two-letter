/**
 * Reduce a number to a single digit by summing its digits recursively
 * @param num - Number to reduce
 * @returns Single digit result
 */
export function reduceToSingleDigit(num: number): number {
  let val = num;
  while (val > 9) {
    val = val
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
  }
  return val;
}

/**
 * Get the reduction steps for a number
 * @param num - Number to reduce
 * @returns Array of strings representing each step (e.g. ["13", "1+3=4"])
 */
export function getReductionSteps(num: number): string[] {
  const steps: string[] = [num.toString()];
  let current = num;

  while (current > 9) {
    const digits = current.toString().split('');
    const sum = digits.reduce((a, b) => a + parseInt(b, 10), 0);
    steps.push(`${digits.join('+')}=${sum}`);
    current = sum;
  }

  return steps;
}

/**
 * Digit-sum reduction of a decimal number's fractional digits.
 *
 * Algorithm:
 * 1. Take the square root decimal string (e.g., "2.738612787...")
 * 2. Extract `numDigits` digits after the decimal point
 * 3. Sum those digits
 * 4. If sum > 9, recursively sum its digits until single digit
 * 5. Return the integer part + "." + final single digit
 *
 * Example: "2.738612788" with 9 digits → 7+3+8+6+1+2+7+8+8 = 50 → 5+0 = 5 → "2.5"
 * Example: "3.31662479" with 8 digits → 3+1+6+6+2+4+7+9 = 38 → 3+8 = 11 → 1+1 = 2 → "3.2"
 */
export interface DecimalReductionResult {
  /** The original decimal string */
  originalDecimal: string;
  /** Integer part of the number */
  integerPart: string;
  /** The decimal digits used */
  decimalDigits: string;
  /** Step-by-step reduction process */
  steps: DecimalReductionStep[];
  /** Final simplified number (e.g., "2.5") */
  finalValue: string;
}

export interface DecimalReductionStep {
  /** Description of this step */
  label: string;
  /** The value at this step */
  value: string;
}

export function reduceDecimalDigits(
  decimalString: string,
  numDigits: number
): DecimalReductionResult {
  // Split into integer and fractional parts
  const parts = decimalString.split('.');
  const integerPart = parts[0] || '0';
  const fractionalPart = parts[1] || '';

  // Take exactly numDigits digits (pad with zeros if needed)
  const digits = fractionalPart.substring(0, numDigits);

  const steps: DecimalReductionStep[] = [];

  // Step 1: Show the digits being summed
  const digitArray = digits.split('').map(Number);
  let currentSum = digitArray.reduce((a, b) => a + b, 0);

  steps.push({
    label: `جمع أرقام الكسر العشري (${digits.length} أرقام)`,
    value: `${digitArray.join(' + ')} = ${currentSum}`,
  });

  // Step 2: Show intermediate value
  steps.push({
    label: 'القيمة الوسيطة',
    value: `${integerPart}.${currentSum}`,
  });

  // Step 3+: Keep reducing sum until single digit
  while (currentSum > 9) {
    const sumDigits = currentSum.toString().split('').map(Number);
    const newSum = sumDigits.reduce((a, b) => a + b, 0);
    steps.push({
      label: 'اختزال',
      value: `${sumDigits.join(' + ')} = ${newSum} → ${integerPart}.${newSum}`,
    });
    currentSum = newSum;
  }

  const finalValue = `${integerPart}.${currentSum}`;

  // Add final step
  steps.push({
    label: 'القيمة النهائية المبسطة',
    value: finalValue,
  });

  return {
    originalDecimal: decimalString,
    integerPart,
    decimalDigits: digits,
    steps,
    finalValue,
  };
}
