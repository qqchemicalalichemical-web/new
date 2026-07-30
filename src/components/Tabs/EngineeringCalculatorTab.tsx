import React, { useState } from 'react';
import { CalcMode } from '../../types';
import {
  calculate2x2Determinant,
  calculate3x3Determinant,
  invert2x2Matrix,
  solveQuadratic,
  solveCubic,
  newtonRaphsonSolve
} from '../../utils/scientificCalculatorEngine';

import {
  Calculator,
  Grid,
  Sparkles,
  Layers,
  CheckCircle2,
  Delete,
  RotateCcw
} from 'lucide-react';

export const EngineeringCalculatorTab: React.FC = () => {
  const [mode, setMode] = useState<CalcMode>('scientific');

  // Scientific Calc Screen State
  const [display, setDisplay] = useState('0');

  // Matrix State 2x2
  const [m2, setM2] = useState<number[][]>([
    [4, 2],
    [1, 3]
  ]);
  const [m2ResultDet, setM2ResultDet] = useState<number | null>(null);
  const [m2ResultInv, setM2ResultInv] = useState<number[][] | null>(null);

  // Polynomial State (Quadratic)
  const [quadA, setQuadA] = useState(1);
  const [quadB, setQuadB] = useState(-5);
  const [quadC, setQuadC] = useState(6);
  const [quadResult, setQuadResult] = useState<any>(null);

  // Numerical Solver State f(x) = x^3 - x - 2 = 0
  const [initialGuess, setInitialGuess] = useState(1.5);
  const [solverResult, setSolverResult] = useState<any>(null);

  // Scientific button handles
  const handleBtnClick = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay(prev => prev + val);
    }
  };

  const handleClear = () => setDisplay('0');

  const handleEvaluate = () => {
    try {
      // Safe math expression evaluator replacement
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(');

      // Evaluate safely
      const evalRes = Function(`'use strict'; return (${expr})`)();
      setDisplay(String(evalRes));
    } catch (err) {
      setDisplay('Error');
    }
  };

  // Matrix calculation
  const handleCalc2x2 = () => {
    const det = calculate2x2Determinant(m2);
    const inv = invert2x2Matrix(m2);
    setM2ResultDet(det);
    setM2ResultInv(inv);
  };

  // Solve Quadratic
  const handleSolveQuad = () => {
    const res = solveQuadratic(quadA, quadB, quadC);
    setQuadResult(res);
  };

  // Solve Newton Raphson
  const handleSolveNewton = () => {
    // Solve f(x) = x^3 - x - 2 = 0
    const res = newtonRaphsonSolve(x => Math.pow(x, 3) - x - 2, initialGuess);
    setSolverResult(res);
  };

  return (
    <div className="space-y-6 dir-rtl font-mono">
      {/* Header & Modes Selector */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-500" />
            الحاسبة الهندسية المتقدمة (Scientific & Numerical Engineering Calculator)
          </h2>
          <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-bold">
            بدون AI • خوارزميات مباشرة 100%
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setMode('scientific')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'scientific' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            1. الحاسبة العلمية (Scientific Calculator)
          </button>
          <button
            onClick={() => setMode('matrix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'matrix' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            2. حاسبة المصفوفات (Matrix Operations)
          </button>
          <button
            onClick={() => setMode('polynomial')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'polynomial' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            3. مفسر المعادلات (Polynomial Solver)
          </button>
          <button
            onClick={() => setMode('solver')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'solver' ? 'bg-amber-600 text-white shadow' : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            4. المنفذ العددي (Numerical Newton-Raphson)
          </button>
        </div>
      </div>

      {/* MODE 1: SCIENTIFIC CALCULATOR */}
      {mode === 'scientific' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-4">
          {/* LCD Display */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-left">
            <div className="text-[10px] text-slate-500 font-mono">SCIENTIFIC LCD DISPLAY</div>
            <div className="text-3xl font-bold font-mono text-amber-400 overflow-x-auto tracking-wider mt-1">
              {display}
            </div>
          </div>

          {/* Keypad Buttons */}
          <div className="grid grid-cols-4 gap-2 text-sm font-bold dir-ltr">
            <button onClick={() => handleBtnClick('sin(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">sin</button>
            <button onClick={() => handleBtnClick('cos(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">cos</button>
            <button onClick={() => handleBtnClick('tan(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">tan</button>
            <button onClick={handleClear} className="bg-rose-900/80 hover:bg-rose-800 text-white p-3 rounded-lg border border-rose-700">AC</button>

            <button onClick={() => handleBtnClick('sqrt(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">√</button>
            <button onClick={() => handleBtnClick('log(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">log</button>
            <button onClick={() => handleBtnClick('ln(')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3 rounded-lg border border-slate-700">ln</button>

            <button onClick={() => handleBtnClick('÷')} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 p-3 rounded-lg border border-amber-500/30">÷</button>

            <button onClick={() => handleBtnClick('7')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">7</button>
            <button onClick={() => handleBtnClick('8')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">8</button>
            <button onClick={() => handleBtnClick('9')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">9</button>
            <button onClick={() => handleBtnClick('×')} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 p-3 rounded-lg border border-amber-500/30">×</button>

            <button onClick={() => handleBtnClick('4')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">4</button>
            <button onClick={() => handleBtnClick('5')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">5</button>
            <button onClick={() => handleBtnClick('6')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">6</button>
            <button onClick={() => handleBtnClick('-')} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 p-3 rounded-lg border border-amber-500/30">-</button>

            <button onClick={() => handleBtnClick('1')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">1</button>
            <button onClick={() => handleBtnClick('2')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">2</button>
            <button onClick={() => handleBtnClick('3')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">3</button>
            <button onClick={() => handleBtnClick('+')} className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 p-3 rounded-lg border border-amber-500/30">+</button>

            <button onClick={() => handleBtnClick('0')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">0</button>
            <button onClick={() => handleBtnClick('.')} className="bg-slate-950 hover:bg-slate-800 text-slate-100 p-3.5 rounded-lg border border-slate-800">.</button>
            <button onClick={() => handleBtnClick('π')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-3.5 rounded-lg border border-slate-700">π</button>
            <button onClick={handleEvaluate} className="bg-gradient-to-r from-amber-600 to-amber-500 text-white p-3.5 rounded-lg font-bold shadow-lg shadow-amber-600/30">=</button>
          </div>
        </div>
      )}

      {/* MODE 2: MATRIX CALCULATOR */}
      {mode === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-4 h-4 text-amber-500" />
            حاسبة محدد معكوس المصفوفات (2×2 Matrix Operations):
          </h3>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto dir-ltr">
            <input
              type="number"
              value={m2[0][0]}
              onChange={e => setM2([[+e.target.value, m2[0][1]], m2[1]])}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-bold text-amber-400"
            />
            <input
              type="number"
              value={m2[0][1]}
              onChange={e => setM2([[m2[0][0], +e.target.value], m2[1]])}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-bold text-amber-400"
            />
            <input
              type="number"
              value={m2[1][0]}
              onChange={e => setM2([m2[0], [+e.target.value, m2[1][1]]])}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-bold text-amber-400"
            />
            <input
              type="number"
              value={m2[1][1]}
              onChange={e => setM2([m2[0], [m2[1][0], +e.target.value]])}
              className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-center font-bold text-amber-400"
            />
          </div>

          <button
            onClick={handleCalc2x2}
            className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow-lg shadow-amber-600/20"
          >
            حساب المحدد Det(A) والمعكوس A⁻¹
          </button>

          {m2ResultDet !== null && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 max-w-md mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">المحدد Determinant det(A):</span>
                <span className="font-bold text-emerald-400 text-base">{m2ResultDet}</span>
              </div>
              {m2ResultInv && (
                <div>
                  <span className="text-slate-400 block mb-1">المعكوس Inverse Matrix A⁻¹:</span>
                  <div className="grid grid-cols-2 gap-2 text-center text-cyan-300 font-bold bg-slate-900 p-2 rounded-lg dir-ltr">
                    <div>{m2ResultInv[0][0].toFixed(3)}</div>
                    <div>{m2ResultInv[0][1].toFixed(3)}</div>
                    <div>{m2ResultInv[1][0].toFixed(3)}</div>
                    <div>{m2ResultInv[1][1].toFixed(3)}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODE 3: POLYNOMIAL SOLVER */}
      {mode === 'polynomial' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100">مفسر المعادلات التربيعية a x² + b x + c = 0</h3>

          <div className="grid grid-cols-3 gap-3 max-w-md">
            <div>
              <label className="text-slate-400 text-[11px] block">المعامل a:</label>
              <input
                type="number"
                value={quadA}
                onChange={e => setQuadA(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block">المعامل b:</label>
              <input
                type="number"
                value={quadB}
                onChange={e => setQuadB(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] block">المعامل c:</label>
              <input
                type="number"
                value={quadC}
                onChange={e => setQuadC(+e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold"
              />
            </div>
          </div>

          <button
            onClick={handleSolveQuad}
            className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow"
          >
            إيجاد الجذور (Roots)
          </button>

          {quadResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md text-xs space-y-1">
              <div className="text-slate-400">الجذر الأول x1: <span className="text-emerald-400 font-bold text-sm">{quadResult.root1}</span></div>
              <div className="text-slate-400">الجذر الثاني x2: <span className="text-cyan-300 font-bold text-sm">{quadResult.root2}</span></div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: NUMERICAL NEWTON-RAPHSON SOLVER */}
      {mode === 'solver' && (
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-100">
            المنفذ العددي نيوتن-رافسون f(x) = x³ - x - 2 = 0
          </h3>

          <div>
            <label className="text-slate-400 text-[11px] block mb-1">التخمين الأولي Initial Guess x0:</label>
            <input
              type="number"
              step="0.1"
              value={initialGuess}
              onChange={e => setInitialGuess(+e.target.value)}
              className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-amber-400 font-bold w-48"
            />
          </div>

          <button
            onClick={handleSolveNewton}
            className="px-6 py-2.5 bg-amber-600 text-white font-bold rounded-xl shadow"
          >
            تنفيذ حل نيوتن-رافسون (Iterate Newton-Raphson)
          </button>

          {solverResult && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 max-w-md text-xs space-y-1">
              <div className="text-slate-400">التمفصل المستهدف x*: <span className="text-emerald-400 font-bold text-sm">{solverResult.root?.toFixed(6)}</span></div>
              <div className="text-slate-400">عدد التكرارات: <span className="text-amber-400 font-bold">{solverResult.iterations} خطوات</span></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
