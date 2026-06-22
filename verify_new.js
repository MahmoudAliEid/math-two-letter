/**
 * Verification script for the new calculation system.
 * Tests both handwritten examples with 10 significant digits + rounding.
 */
const Big = require('big.js');
Big.DP = 200;
Big.RM = Big.roundDown;

// ── Fraction class ──
class Fraction {
  constructor(num, den = 1) {
    let n = new Big(num);
    let d = new Big(den);
    if (d.eq(0)) throw new Error('Division by zero');
    if (d.lt(0)) { n = n.times(-1); d = d.times(-1); }
    const g = Fraction.gcdBig(n.abs(), d.abs());
    this.num = n.div(g);
    this.den = d.div(g);
  }
  add(other) {
    return new Fraction(
      this.num.times(other.den).plus(other.num.times(this.den)),
      this.den.times(other.den)
    );
  }
  divide(other) {
    return new Fraction(this.num.times(other.den), this.den.times(other.num));
  }
  toString() {
    if (this.den.eq(1)) return this.num.toString();
    return `${this.num}/${this.den}`;
  }
  toDecimal(p) {
    Big.DP = p + 10; Big.RM = Big.roundDown;
    return this.num.div(this.den).toFixed(p);
  }
  static gcdBig(a, b) {
    a = a.abs(); b = b.abs();
    while (!b.eq(0)) { const t = b; b = new Big(a.mod(b).toString()); a = t; }
    return a;
  }
  static fromInt(n) { return new Fraction(n, 1); }
  static zero() { return new Fraction(0, 1); }
}

// ── Radical ──
function simplifyRadical(n) {
  if (n <= 1) return { coefficient: n === 0 ? 0 : 1, radicand: n };
  let c = 1, r = n;
  while (r % 4 === 0) { c *= 2; r /= 4; }
  let f = 3;
  while (f * f <= r) { while (r % (f*f) === 0) { c *= f; r /= (f*f); } f += 2; }
  return { coefficient: c, radicand: r };
}
function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a,b]=[b,a%b]; } return a; }
function sqrtOfFraction(num, den) {
  if (num === 0) return { coefficient: 0, radicand: 0, denominator: 1, isPerfect: true };
  const { coefficient, radicand } = simplifyRadical(num * den);
  const g = gcd(coefficient, den);
  return { coefficient: coefficient/g, radicand, denominator: den/g, isPerfect: radicand === 1 };
}
function formatRadical(f) {
  if (f.isPerfect || f.radicand === 1) return f.denominator === 1 ? `${f.coefficient}` : `${f.coefficient}/${f.denominator}`;
  const rp = f.coefficient === 1 ? `√${f.radicand}` : `${f.coefficient}√${f.radicand}`;
  return f.denominator === 1 ? rp : `${rp} / ${f.denominator}`;
}

// ── BigSqrt ──
function bigSqrt(v, p) {
  Big.DP = p + 40; Big.RM = Big.roundDown;
  let x = new Big(Math.sqrt(Number(v)) || 1);
  const two = new Big(2);
  for (let i = 0; i < 60; i++) { const nx = x.plus(v.div(x)).div(two); if (nx.eq(x)) break; x = nx; }
  return x.toFixed(p);
}

// ── Round to significant digits (with standard rounding) ──
function roundToSigFigs(decStr, sigFigs) {
  Big.DP = 200; Big.RM = Big.roundHalfUp;
  const val = new Big(decStr);
  const intPart = decStr.split('.')[0].replace(/^-/, '') || '0';
  const intDigits = intPart === '0' ? 1 : intPart.length;
  const decPlaces = Math.max(0, sigFigs - intDigits);
  return val.toFixed(decPlaces);
}

// ── Digit reduction ──
function reduceDecimalDigits(decStr) {
  const parts = decStr.split('.');
  const intPart = parts[0] || '0';
  const fracDigits = (parts[1] || '').split('').map(Number);
  let sum = fracDigits.reduce((a,b) => a+b, 0);
  const steps = [`Digits(${fracDigits.length}): ${fracDigits.join('+')} = ${sum} → ${intPart}.${sum}`];
  while (sum > 9) {
    const d = sum.toString().split('').map(Number);
    sum = d.reduce((a,b) => a+b, 0);
    steps.push(`${d.join('+')} = ${sum} → ${intPart}.${sum}`);
  }
  return { finalValue: `${intPart}.${sum}`, steps };
}

// ── Normalization ──
const NORM = {'ا':'أ','أ':'أ','إ':'أ','آ':'أ','ى':'أ','ء':'أ','ئ':'أ','ؤ':'أ','ة':'ت','ه':'ه'};
function normalize(t) {
  let n = t.replace(/[\s\u064B-\u0652]/g, '');
  for (const [k,v] of Object.entries(NORM)) n = n.split(k).join(v);
  return n;
}

// ── Main test ──
function testWord(text) {
  const norm = normalize(text);
  const charMap = new Map(), charOrder = [];
  let pos = 0;
  for (const char of norm) { pos++; if (!charMap.has(char)) { charMap.set(char, []); charOrder.push(char); } charMap.get(char).push(pos); }
  const N = pos;
  const nFrac = Fraction.fromInt(N);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  "${text}" → "${norm}" | N=${N}`);
  console.log(`${'═'.repeat(60)}`);

  let gt = Fraction.zero();
  charOrder.forEach(c => {
    const positions = charMap.get(c);
    let ct = Fraction.zero();
    const details = [];
    positions.forEach(p => {
      const r = Fraction.fromInt(p*p).divide(nFrac);
      ct = ct.add(r);
      details.push(`${p}²/${N}=${r}`);
    });
    gt = gt.add(ct);
    console.log(`  ${c}: [${positions}] → ${details.join(' + ')} = ${ct}`);
  });

  console.log(`\n  Grand Total: ${gt}`);
  
  const num = Number(gt.num), den = Number(gt.den);
  const radical = sqrtOfFraction(num, den);
  console.log(`  Radical: ${formatRadical(radical)}`);
  
  const gtBig = new Big(gt.num.toString()).div(new Big(gt.den.toString()));
  const sqrtDec = bigSqrt(gtBig, 60);
  console.log(`  √ decimal: ${sqrtDec.substring(0, 40)}...`);
  
  const rounded = roundToSigFigs(sqrtDec, 10);
  console.log(`  Rounded (10 sig figs): ${rounded}`);
  
  const reduction = reduceDecimalDigits(rounded);
  reduction.steps.forEach(s => console.log(`    ${s}`));
  console.log(`\n  ★ Final: ${reduction.finalValue}`);
  
  return { grandTotal: gt.toString(), final: reduction.finalValue };
}

// ── Tests ──
console.log('\n🔬 VERIFICATION with 10 significant digits + rounding\n');

const r1 = testWord('قهوه');
const r2 = testWord('مروحه');

console.log(`\n${'═'.repeat(60)}`);
const t1 = r1.grandTotal === '15/2' && r1.final === '2.5';
const t2 = r2.grandTotal === '11' && r2.final === '3.2';
console.log(`Test 1 (قهوه):  GT=${r1.grandTotal} Final=${r1.final}  ${t1 ? '✅' : '❌'}`);
console.log(`Test 2 (مروحه): GT=${r2.grandTotal} Final=${r2.final}  ${t2 ? '✅' : '❌'}`);
console.log(t1 && t2 ? '\n🎉 ALL TESTS PASSED!' : '\n⚠️ SOME TESTS FAILED');
console.log(`${'═'.repeat(60)}\n`);
