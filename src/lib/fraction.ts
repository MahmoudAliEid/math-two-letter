import Big from 'big.js';

/**
 * Exact fraction class using Big.js for arbitrary-precision arithmetic.
 * All operations produce exact results with no rounding.
 */
export class Fraction {
  readonly num: Big;   // numerator
  readonly den: Big;   // denominator (always positive)

  constructor(numerator: Big | number | string, denominator: Big | number | string = 1) {
    let n = new Big(numerator);
    let d = new Big(denominator);

    if (d.eq(0)) {
      throw new Error('Division by zero');
    }

    // Ensure denominator is always positive
    if (d.lt(0)) {
      n = n.times(-1);
      d = d.times(-1);
    }

    // Reduce to lowest terms
    const g = Fraction.gcdBig(n.abs(), d.abs());
    this.num = n.div(g);
    this.den = d.div(g);
  }

  /** Add two fractions: a/b + c/d = (a*d + c*b) / (b*d) */
  add(other: Fraction): Fraction {
    const newNum = this.num.times(other.den).plus(other.num.times(this.den));
    const newDen = this.den.times(other.den);
    return new Fraction(newNum, newDen);
  }

  /** Multiply two fractions: (a/b) * (c/d) = (a*c) / (b*d) */
  multiply(other: Fraction): Fraction {
    return new Fraction(
      this.num.times(other.num),
      this.den.times(other.den)
    );
  }

  /** Divide by another fraction: (a/b) / (c/d) = (a*d) / (b*c) */
  divide(other: Fraction): Fraction {
    return new Fraction(
      this.num.times(other.den),
      this.den.times(other.num)
    );
  }

  /** Check if this fraction equals zero */
  isZero(): boolean {
    return this.num.eq(0);
  }

  /** Convert to integer if possible, throws if not an integer */
  toInteger(): number {
    if (!this.den.eq(1)) {
      throw new Error(`Fraction ${this.toString()} is not an integer`);
    }
    return Number(this.num);
  }

  /** Check if this fraction is a whole integer */
  isInteger(): boolean {
    return this.den.eq(1);
  }

  /** Get numerator as a JS number (for integer-only operations) */
  numAsNumber(): number {
    return Number(this.num);
  }

  /** Get denominator as a JS number (for integer-only operations) */
  denAsNumber(): number {
    return Number(this.den);
  }

  /**
   * Convert to decimal string with specified precision.
   * Uses Big.js division for exact arbitrary-precision output.
   */
  toDecimal(precision: number = 100): string {
    // Set Big.js precision high enough
    const prevDP = Big.DP;
    const prevRM = Big.RM;
    Big.DP = precision + 10; // extra digits to avoid edge rounding
    Big.RM = Big.roundDown; // truncate, never round

    const result = this.num.div(this.den);
    const str = result.toFixed(precision);

    // Restore
    Big.DP = prevDP;
    Big.RM = prevRM;

    return str;
  }

  /**
   * Display as fraction string.
   * Returns "5" for 5/1, "15/2" for 15/2, etc.
   */
  toString(): string {
    if (this.den.eq(1)) {
      return this.num.toString();
    }
    return `${this.num}/${this.den}`;
  }

  /**
   * Display as a LaTeX-style fraction for UI rendering.
   * Returns the numerator and denominator separately.
   */
  toDisplayParts(): { numerator: string; denominator: string; isWhole: boolean } {
    return {
      numerator: this.num.toString(),
      denominator: this.den.toString(),
      isWhole: this.den.eq(1),
    };
  }

  /** GCD for Big numbers using Euclidean algorithm */
  static gcdBig(a: Big, b: Big): Big {
    a = a.abs();
    b = b.abs();
    while (!b.eq(0)) {
      const temp = b;
      b = new Big(a.mod(b).toString()); // mod workaround
      a = temp;
    }
    return a;
  }

  /** Create fraction from integer */
  static fromInt(n: number): Fraction {
    return new Fraction(n, 1);
  }

  /** Create zero fraction */
  static zero(): Fraction {
    return new Fraction(0, 1);
  }
}
