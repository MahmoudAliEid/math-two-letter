
function normalize(text) {
    const map = {
        'ا': 'أ', 'أ': 'أ', 'إ': 'أ', 'آ': 'أ', 'ى': 'أ', 'ء': 'أ', 'ئ': 'أ', 'ؤ': 'أ',
        'ة': 'ت', 'ه': 'ه'
    };
    let n = text.replace(/[\s\u064B-\u0652]/g, '');
    for (const [k, v] of Object.entries(map)) {
        n = n.split(k).join(v);
    }
    return n;
}

function reduce(num) {
    let s = num.toString();
    const steps = [s];
    let curr = num;
    while (curr > 9) {
        let digits = curr.toString().split('').map(Number);
        curr = digits.reduce((a, b) => a + b, 0);
        steps.push(digits.join('+') + '=' + curr);
    }
    return { final: curr, steps };
}

function test(text) {
    const norm = normalize(text);
    const charMap = new Map();
    const charOrder = [];
    for (let i = 0; i < norm.length; i++) {
        const c = norm[i];
        if (!charMap.has(c)) {
            charMap.set(c, []);
            charOrder.push(c);
        }
        charMap.get(c).push(i + 1);
    }

    console.log(`\nText: "${text}" -> Normalized: "${norm}"`);
    let totalReducedSum = 0;
    charOrder.forEach(c => {
        const pos = charMap.get(c);
        const sum = pos.reduce((a, b) => a + b, 0);
        const red = reduce(sum);
        totalReducedSum += red.final;
        console.log(`  ${c}: pos=[${pos}] sum=${sum} steps=[${red.steps.join(' -> ')}] final=${red.final}`);
    });
    const finalTotal = reduce(totalReducedSum);
    console.log(`Final Sum: ${totalReducedSum} -> Final Reduced: ${finalTotal.final}`);
}

test("جميل و جميلة");
test("نور أنور");
test("أ إ آ ى ء ئ ؤ");
