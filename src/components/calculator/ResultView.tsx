'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CalculationResult } from '@/lib/calculate';
import { Hash, Divide, Sigma, Calculator, Radical, Sparkles } from 'lucide-react';


interface ResultViewProps {
    result: CalculationResult | null;
}

/** Step badge component */
function StepBadge({ step, label, icon: Icon }: { step: number; label: string; icon: React.ElementType }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-500/20">
                    {step}
                </div>
                <Icon className="w-5 h-5 text-emerald-400/60" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">{label}</h3>
        </div>
    );
}

/** Fraction display component - renders a/b as stacked fraction */
function FractionDisplay({ value, className = '' }: { value: string; className?: string }) {
    if (!value.includes('/')) {
        return <span className={`font-mono font-bold ${className}`}>{value}</span>;
    }
    const [num, den] = value.split('/');
    return (
        <span className={`inline-flex flex-col items-center leading-none ${className}`}>
            <span className="font-mono font-bold text-[0.85em] pb-0.5">{num}</span>
            <span className="w-full h-[1.5px] bg-current opacity-40 rounded-full" />
            <span className="font-mono font-bold text-[0.85em] pt-0.5">{den}</span>
        </span>
    );
}

export default function ResultView({ result }: ResultViewProps) {
    if (!result) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* ── Final Results Summary Card ── */}
            <Card className="glass border-emerald-500/20 overflow-hidden relative bg-gradient-to-br from-emerald-950/20 via-slate-900/40 to-teal-950/20">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />
                <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-emerald-500/20">
                            ★
                        </div>
                        <Sparkles className="w-5 h-5 text-emerald-400/60 animate-pulse" />
                        <h3 className="text-lg font-bold text-white tracking-tight">خلاصة النتائج النهائية</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Hero Display: Final Value */}
                        <div className="md:col-span-5 text-center flex flex-col items-center justify-center border-b md:border-b-0 md:border-l border-white/5 pb-6 md:pb-0 md:pl-6 relative">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />
                            </div>
                            <span className="text-[0.65rem] font-black text-emerald-400 uppercase tracking-wider block mb-2">النتيجة النهائية</span>
                            <div className="relative">
                                <span className="text-7xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
                                    {result.digitReduction.finalValue}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-7 space-y-4" dir="rtl">
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-xs font-bold text-slate-400">الناتج الإجمالي (Step 4)</span>
                                <span className="text-lg font-bold text-white font-mono">
                                    <FractionDisplay value={result.grandTotal} />
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-white/5">
                                <span className="text-xs font-bold text-slate-400">الصيغة الجذرية (Step 5)</span>
                                <span className="text-sm font-bold text-teal-300 font-mono" dir="ltr">
                                    √({result.grandTotal}) = {result.radicalDisplay}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-bold text-slate-400">قيمة الآلة الحاسبة</span>
                                <span className="text-md font-bold text-amber-400/90 font-mono" dir="ltr">
                                    {result.sqrtRounded}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ── Step 1: Natural Count ── */}
            <Card className="glass border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <StepBadge step={1} label="العد الطبيعي" icon={Hash} />

                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">إجمالي الحروف</span>
                            <span className="text-xs text-slate-600">N</span>
                        </div>
                        <span className="text-3xl font-black text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                            {result.totalChars}
                        </span>
                    </div>

                    {/* Character position strip */}
                    <div className="flex flex-wrap gap-2 justify-center" dir="rtl">
                        {result.charPositions.map((cp, i) => (
                            <div
                                key={i}
                                className="relative group flex flex-col items-center gap-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all duration-300 min-w-[52px]"
                            >
                                <span className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                                    {cp.char}
                                </span>
                                <span className="text-[0.6rem] font-black text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                                    {cp.position}
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── Step 2 & 3: Position Weighting + Character Aggregation ── */}
            <Card className="glass border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <StepBadge step={2} label="الترجيح الموضعي" icon={Divide} />
                    <p className="text-xs text-slate-500 mb-5 font-medium -mt-4">
                        لكل حرف في الموضع <span className="text-teal-400 font-mono">p</span>: القيمة = <span className="text-teal-400 font-mono">p² / N</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {result.charAnalysis.map((analysis, idx) => (
                            <div
                                key={idx}
                                className="relative p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-emerald-500/20 transition-all duration-500 group"
                            >
                                {/* Character header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-4xl font-black text-white group-hover:text-emerald-300 transition-colors duration-300">
                                            {analysis.char}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest">مواقع</span>
                                            <span className="text-xs text-teal-400 font-mono font-bold">
                                                [{analysis.positions.join(', ')}]
                                            </span>
                                        </div>
                                    </div>

                                    {/* Step 3: Character total */}
                                    <div className="text-right">
                                        <span className="text-[0.55rem] font-black text-slate-500 uppercase tracking-widest block mb-1">المجموع</span>
                                        <span className="text-emerald-400 text-xl">
                                            <FractionDisplay value={analysis.charTotal} />
                                        </span>
                                    </div>
                                </div>

                                {/* Position weight details */}
                                <div className="space-y-1.5">
                                    {analysis.positionWeights.map((pw, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.02] border border-white/[0.03] text-sm"
                                        >
                                            <span className="text-slate-400 font-mono text-xs">
                                                {pw.position}² ÷ {result.totalChars}
                                            </span>
                                            <span className="text-white font-mono font-bold">
                                                <FractionDisplay value={pw.exactValue} className="text-xs" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── Step 3: Aggregation Summary ── */}
            <Card className="glass border-white/5 overflow-hidden">
                <CardContent className="p-6">
                    <StepBadge step={3} label="تجميع قيم الحروف" icon={Sigma} />

                    <div className="flex flex-wrap gap-3 justify-center" dir="rtl">
                        {result.charAnalysis.map((analysis, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 py-3 px-5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-teal-500/30 transition-all duration-300"
                            >
                                <span className="text-2xl font-bold text-white">{analysis.char}</span>
                                <span className="text-slate-600">=</span>
                                <span className="text-teal-400 text-lg">
                                    <FractionDisplay value={analysis.charTotal} />
                                </span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ── Step 4: Grand Total ── */}
            <Card className="glass border-white/5 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 opacity-50" />
                <CardContent className="p-6">
                    <StepBadge step={4} label="الناتج الإجمالي" icon={Calculator} />

                    {/* Summation formula */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mb-5 text-slate-400 font-mono text-sm" dir="ltr">
                        {result.charAnalysis.map((analysis, idx) => (
                            <span key={idx} className="flex items-center gap-1.5">
                                {idx > 0 && <span className="text-emerald-500/50 text-lg">+</span>}
                                <FractionDisplay value={analysis.charTotal} className="text-slate-300" />
                            </span>
                        ))}
                        <span className="text-emerald-500 text-lg mx-2">=</span>
                    </div>

                    {/* Grand total display */}
                    <div className="text-center py-6">
                        <div className="text-5xl font-black text-white mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            <FractionDisplay value={result.grandTotal} />
                        </div>
                        <p className="text-slate-500 font-mono text-sm mt-3">
                            ≈ {result.grandTotalDecimal.substring(0, 40)}{result.grandTotalDecimal.length > 40 ? '...' : ''}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* ── Step 5: Square Root & Simplification ── */}
            <Card className="glass border-white/5 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
                <CardContent className="p-6 relative">
                    <StepBadge step={5} label="الجذر التربيعي والتبسيط" icon={Radical} />

                    {/* Radical form */}
                    <div className="text-center py-8 space-y-8">
                        {/* Radical expression */}
                        <div>
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-3">الصيغة الجذرية</span>
                            <div className="text-4xl font-black text-emerald-400 drop-shadow-[0_0_25px_rgba(52,211,153,0.3)]" dir="ltr">
                                √({result.grandTotal})
                            </div>
                            <div className="text-2xl font-bold text-teal-300 mt-2" dir="ltr">
                                = {result.radicalDisplay}
                            </div>
                        </div>

                        {/* High-precision decimal */}
                        <div>
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-3">القيمة العشرية الدقيقة</span>
                            <div className="p-4 rounded-xl bg-black/20 border border-white/5 overflow-x-auto">
                                <p className="font-mono text-sm text-slate-300 break-all leading-relaxed whitespace-pre-wrap" dir="ltr">
                                    {result.sqrtDecimal.substring(0, 72)}
                                    {result.sqrtDecimal.length > 72 ? '...' : ''}
                                </p>
                            </div>
                        </div>

                        {/* Rounded calculator value */}
                        <div>
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-3">قيمة الآلة الحاسبة (١٠ أرقام معنوية)</span>
                            <div className="text-3xl font-black text-amber-400/90 font-mono" dir="ltr">
                                {result.sqrtRounded}
                            </div>
                        </div>

                        {/* Digit reduction steps */}
                        <div>
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-4">مراحل التبسيط الرقمي</span>
                            <div className="space-y-2 max-w-lg mx-auto">
                                {result.digitReduction.steps.map((step, i) => {
                                    const isLast = i === result.digitReduction.steps.length - 1;
                                    return (
                                        <div
                                            key={i}
                                            className={`
                                                flex items-center justify-between py-2.5 px-4 rounded-xl text-sm transition-all duration-300
                                                ${isLast
                                                    ? 'bg-emerald-500/15 border-2 border-emerald-500/30 text-emerald-300 shadow-lg shadow-emerald-500/10'
                                                    : 'bg-white/[0.02] border border-white/[0.03] text-slate-400'}
                                            `}
                                        >
                                            <span className="text-xs font-bold opacity-70">{step.label}</span>
                                            <span className={`font-mono font-bold ${isLast ? 'text-lg' : ''}`} dir="ltr">
                                                {step.value}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Final simplified value - hero display */}
                        <div className="relative pt-6">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
                            </div>
                            <span className="text-[0.6rem] font-black text-slate-500 uppercase tracking-widest block mb-3">النتيجة النهائية</span>
                            <div className="relative">
                                <span className="text-7xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-2xl">
                                    {result.digitReduction.finalValue}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
