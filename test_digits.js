const Big = require('big.js');
Big.DP = 200;
Big.RM = Big.roundDown;

function bigSqrt(v, p) {
  Big.DP = p + 40;
  let x = new Big(Math.sqrt(Number(v)) || 1);
  const two = new Big(2);
  for (let i = 0; i < 60; i++) {
    const nx = x.plus(v.div(x)).div(two);
    if (nx.eq(x)) break;
    x = nx;
  }
  return x.toFixed(p);
}

// Test approach: use a fixed number of SIGNIFICANT digits (including integer part)
// Common calculator displays: 8, 9, 10, 12 significant digits

const s1 = bigSqrt(new Big('7.5'), 100);  // sqrt(15/2)
const s2 = bigSqrt(new Big('11'), 100);   // sqrt(11)

console.log('sqrt(15/2) = ' + s1.substring(0, 60));
console.log('sqrt(11)   = ' + s2.substring(0, 60));
console.log('');

// The image shows:
// sqrt(15/2) -> "2.738612788" (10 chars total = 1 int + 9 dec digits = 10 sig digits)
// sqrt(11)   -> "3.31662479" (10 chars total = 1 int + 8 dec digits = 9 sig digits)
// Hmm. Actually let me count: 2.738612788 = digits: 2,7,3,8,6,1,2,7,8,8 = 10 sig digits
// But the real value is 2.7386127875... so 2.738612788 doesn't match (it would be 2.7386127875 if using 11 sig digits)
// Unless the calculator ROUNDED: 2.738612787... round to 9 decimal places -> 2.738612788 (rounding up the 7)

// So let's try: take N DECIMAL digits but with ROUNDING (not truncation)
for (let sigFigs = 7; sigFigs <= 14; sigFigs++) {
  // For each number, calculate decimal digits = sigFigs - (integer digits)
  const intDigits1 = 1; // "2" has 1 digit
  const intDigits2 = 1; // "3" has 1 digit
  const decDigits1 = sigFigs - intDigits1;
  const decDigits2 = sigFigs - intDigits2;

  // Get digits with ROUNDING (as a calculator would)
  const prevDP = Big.DP; Big.DP = 200;
  const val1 = new Big(s1);
  const val2 = new Big(s2);
  
  // Round to decDigits decimal places
  Big.RM = Big.roundHalfUp;
  const rounded1 = val1.toFixed(decDigits1);
  const rounded2 = val2.toFixed(decDigits2);
  Big.RM = Big.roundDown;
  Big.DP = prevDP;

  // Get just decimal digits
  const digs1 = rounded1.split('.')[1] || '';
  const digs2 = rounded2.split('.')[1] || '';
  
  // Sum decimal digits
  let sum1 = digs1.split('').map(Number).reduce((a,b)=>a+b,0);
  let sum2 = digs2.split('').map(Number).reduce((a,b)=>a+b,0);
  
  // Reduce to single digit
  let r1 = sum1;
  while (r1 > 9) { r1 = r1.toString().split('').map(Number).reduce((a,b)=>a+b,0); }
  let r2 = sum2;
  while (r2 > 9) { r2 = r2.toString().split('').map(Number).reduce((a,b)=>a+b,0); }

  const m1 = r1 === 5 ? 'v' : ' ';
  const m2 = r2 === 2 ? 'v' : ' ';
  console.log('sigFigs=' + sigFigs + ': dec1=' + decDigits1 + ' "' + rounded1 + '" sum=' + sum1 + '->' + r1 + ' (2.' + r1 + ')' + m1 + '  dec2=' + decDigits2 + ' "' + rounded2 + '" sum=' + sum2 + '->' + r2 + ' (3.' + r2 + ')' + m2 + (r1===5&&r2===2 ? '  BOTH!' : ''));
}

// Also test with TRUNCATION
console.log('\n--- With truncation (no rounding): ---');
for (let sigFigs = 7; sigFigs <= 14; sigFigs++) {
  const decDigits1 = sigFigs - 1;
  const decDigits2 = sigFigs - 1;
  const digs1 = s1.split('.')[1].substring(0, decDigits1);
  const digs2 = s2.split('.')[1].substring(0, decDigits2);
  let sum1 = digs1.split('').map(Number).reduce((a,b)=>a+b,0);
  let sum2 = digs2.split('').map(Number).reduce((a,b)=>a+b,0);
  let r1 = sum1; while (r1 > 9) { r1 = r1.toString().split('').map(Number).reduce((a,b)=>a+b,0); }
  let r2 = sum2; while (r2 > 9) { r2 = r2.toString().split('').map(Number).reduce((a,b)=>a+b,0); }
  const m1 = r1 === 5 ? 'v' : ' ';
  const m2 = r2 === 2 ? 'v' : ' ';
  console.log('sigFigs=' + sigFigs + ': dec=' + decDigits1 + ' "' + s1.substring(0, sigFigs+1) + '" sum=' + sum1 + '->' + r1 + ' (2.' + r1 + ')' + m1 + '  "' + s2.substring(0, sigFigs+1) + '" sum=' + sum2 + '->' + r2 + ' (3.' + r2 + ')' + m2 + (r1===5&&r2===2 ? '  BOTH!' : ''));
}
