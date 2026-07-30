// Scientific Calculator Engine (No external AI needed)

// 1. Matrix Operations (2x2 and 3x3)
export function calculate2x2Determinant(m: number[][]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

export function calculate3x3Determinant(m: number[][]): number {
  return (
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
  );
}

export function invert2x2Matrix(m: number[][]): number[][] | null {
  const det = calculate2x2Determinant(m);
  if (Math.abs(det) < 1e-12) return null; // Singular matrix
  return [
    [m[1][1] / det, -m[0][1] / det],
    [-m[1][0] / det, m[0][0] / det]
  ];
}

// 2. Quadratic Equation Solver: a x^2 + b x + c = 0
export function solveQuadratic(a: number, b: number, c: number) {
  if (Math.abs(a) < 1e-12) {
    // Linear
    if (Math.abs(b) < 1e-12) return { type: 'none', message: 'معادلة غير صالحة' };
    return { type: 'real', root1: -c / b, root2: null };
  }
  const delta = b * b - 4 * a * c;
  if (delta > 0) {
    const x1 = (-b + Math.sqrt(delta)) / (2 * a);
    const x2 = (-b - Math.sqrt(delta)) / (2 * a);
    return { type: 'real', root1: x1, root2: x2 };
  } else if (Math.abs(delta) < 1e-12) {
    const x = -b / (2 * a);
    return { type: 'real', root1: x, root2: x };
  } else {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-delta) / (2 * a);
    return {
      type: 'complex',
      root1: `${realPart.toFixed(4)} + ${imagPart.toFixed(4)}i`,
      root2: `${realPart.toFixed(4)} - ${imagPart.toFixed(4)}i`
    };
  }
}

// 3. Cubic Equation Solver: a x^3 + b x^2 + c x + d = 0 (Cardano's Formula)
export function solveCubic(a: number, b: number, c: number, d: number) {
  if (Math.abs(a) < 1e-12) {
    return solveQuadratic(b, c, d);
  }

  // Normalize
  const A = b / a;
  const B = c / a;
  const C = d / a;

  const Q = (3 * B - A * A) / 9;
  const R = (9 * A * B - 27 * C - 2 * A * A * A) / 54;
  const D = Q * Q * Q + R * R;

  if (D >= 0) {
    const S = Math.cbrt(R + Math.sqrt(D));
    const T = Math.cbrt(R - Math.sqrt(D));
    const x1 = -A / 3 + (S + T);
    return {
      root1: x1.toFixed(4),
      root2: (-A / 3 - (S + T) / 2).toFixed(4),
      root3: (-A / 3 - (S + T) / 2).toFixed(4)
    };
  } else {
    const th = Math.acos(R / Math.sqrt(-Q * Q * Q));
    const x1 = 2 * Math.sqrt(-Q) * Math.cos(th / 3) - A / 3;
    const x2 = 2 * Math.sqrt(-Q) * Math.cos((th + 2 * Math.PI) / 3) - A / 3;
    const x3 = 2 * Math.sqrt(-Q) * Math.cos((th + 4 * Math.PI) / 3) - A / 3;
    return {
      root1: x1.toFixed(4),
      root2: x2.toFixed(4),
      root3: x3.toFixed(4)
    };
  }
}

// 4. Numerical Solver (Newton-Raphson method for f(x) = 0)
export function newtonRaphsonSolve(fnExpr: (x: number) => number, x0: number = 1.0, maxIter: number = 100) {
  let x = x0;
  const h = 1e-5;

  for (let i = 0; i < maxIter; i++) {
    const fx = fnExpr(x);
    if (Math.abs(fx) < 1e-7) {
      return { converged: true, root: x, iterations: i };
    }
    // Numerical derivative f'(x)
    const dfx = (fnExpr(x + h) - fnExpr(x - h)) / (2 * h);
    if (Math.abs(dfx) < 1e-12) break; // Slope zero

    x = x - fx / dfx;
  }

  return { converged: false, root: x, iterations: maxIter };
}
