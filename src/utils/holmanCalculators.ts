// Calculation engines for Holman Heat Transfer Modules

export interface ConductionLayer {
  name: string;
  thicknessMm: number;
  kValue: number; // W/m.K
}

export interface FinInputs {
  tbC: number;
  tInfC: number;
  lengthMm: number;
  thicknessMm: number;
  widthMm: number;
  kFin: number;
  hAmbient: number;
}

export interface RadiationInputs {
  t1C: number;
  t2C: number;
  area1M2: number;
  emissivity1: number;
  emissivity2: number;
  viewFactorF12: number;
}

export interface NaturalConvectionInputs {
  tsurfaceC: number;
  tambientC: number;
  heightM: number;
  orientation: 'vertical_plate' | 'horizontal_plate_up' | 'horizontal_plate_down';
}

export interface ForcedConvectionInputs {
  fluidVelocityMs: number;
  pipeDiameterMm: number;
  fluidTempC: number;
  wallTempC: number;
  fluidType: 'water' | 'air' | 'oil';
}

export interface TransientConductionInputs {
  initialTempC: number;
  ambientTempC: number;
  sphereRadiusMm: number;
  density: number;
  cp: number;
  k: number;
  h: number;
  timeSeconds: number;
}

export interface CriticalRadiusInputs {
  pipeOuterRadiusMm: number;
  insulationK: number;
  hOuter: number;
}

// 1. Conduction Multi-layer Wall
export function calculateConductionWall(layers: ConductionLayer[], surfaceAreaM2: number, tInsideC: number, tOutsideC: number) {
  let totalResistance = 0;
  const layerDetails = layers.map((layer, idx) => {
    const r = (layer.thicknessMm / 1000) / (layer.kValue * surfaceAreaM2);
    totalResistance += r;
    return {
      ...layer,
      resistance: r
    };
  });

  const deltaT = Math.abs(tInsideC - tOutsideC);
  const qWatts = totalResistance > 0 ? deltaT / totalResistance : 0;
  const qKw = qWatts / 1000;

  // Calculate interface temperatures
  let currentT = tInsideC;
  const interfaceTemps: number[] = [currentT];
  layerDetails.forEach(layer => {
    const drop = qWatts * layer.resistance;
    currentT = tInsideC > tOutsideC ? currentT - drop : currentT + drop;
    interfaceTemps.push(currentT);
  });

  return {
    qWatts,
    qKw,
    totalResistance,
    layerDetails,
    interfaceTemps
  };
}

// 2. Fin Heat Transfer
export function calculateFin(inputs: FinInputs) {
  const L = inputs.lengthMm / 1000; // m
  const t = inputs.thicknessMm / 1000; // m
  const w = inputs.widthMm / 1000; // m
  const Ac = w * t; // Cross section m²
  const P = 2 * (w + t); // Perimeter m
  const deltaT = inputs.tbC - inputs.tInfC;

  const m = Math.sqrt((inputs.hAmbient * P) / (inputs.kFin * Ac));
  const mL = m * L;
  const tanhML = Math.tanh(mL);

  // Fin heat transfer rate q_fin
  const qFinWatts = Math.sqrt(inputs.hAmbient * P * inputs.kFin * Ac) * deltaT * tanhML;
  
  // Ideal fin heat transfer rate (if entire fin was at base temp)
  const qMaxWatts = inputs.hAmbient * (P * L) * deltaT;
  
  // Fin Efficiency (η_fin)
  const efficiency = qMaxWatts > 0 ? (qFinWatts / qMaxWatts) * 100 : 0;

  // Temperature distribution along fin length x = 0 to L
  const points = [];
  const numSteps = 10;
  for (let i = 0; i <= numSteps; i++) {
    const x = (i / numSteps) * L;
    const tempAtX = inputs.tInfC + deltaT * (Math.cosh(m * (L - x)) / Math.cosh(mL));
    points.push({
      xMm: (x * 1000).toFixed(1),
      tempC: tempAtX.toFixed(1)
    });
  }

  return {
    m: m.toFixed(2),
    qFinWatts: qFinWatts.toFixed(2),
    qFinKw: (qFinWatts / 1000).toFixed(4),
    efficiencyPercent: efficiency.toFixed(1),
    points
  };
}

// 3. Radiation Heat Transfer
export function calculateRadiation(inputs: RadiationInputs) {
  const sigma = 5.670374e-8; // Stefan-Boltzmann constant W/m²K⁴
  const T1K = inputs.t1C + 273.15;
  const T2K = inputs.t2C + 273.15;

  // Net emissivity factor for two gray parallel plates
  const e1 = inputs.emissivity1;
  const e2 = inputs.emissivity2;
  const netEmissivity = 1 / ((1 / e1) + (1 / e2) - 1);

  const qRadiationWatts = sigma * inputs.area1M2 * inputs.viewFactorF12 * netEmissivity * (Math.pow(T1K, 4) - Math.pow(T2K, 4));

  return {
    qWatts: qRadiationWatts.toFixed(2),
    qKw: (qRadiationWatts / 1000).toFixed(3),
    netEmissivity: netEmissivity.toFixed(3),
    sigma: '5.67 × 10⁻⁸ W/m²K⁴'
  };
}

// 4. Natural Convection
export function calculateNaturalConvection(inputs: NaturalConvectionInputs) {
  const g = 9.81;
  const tFilmC = (inputs.tsurfaceC + inputs.tambientC) / 2;
  const tFilmK = tFilmC + 273.15;
  const beta = 1 / tFilmK; // Expansion coef for air
  const deltaT = Math.abs(inputs.tsurfaceC - inputs.tambientC);

  // Air properties at tFilm approx
  const nu = 1.58e-5; // Kinematic viscosity m²/s
  const kAir = 0.026; // W/m.K
  const pr = 0.71;

  const L = inputs.heightM;
  const grashof = (g * beta * deltaT * Math.pow(L, 3)) / Math.pow(nu, 2);
  const rayleigh = grashof * pr;

  // Nusselt correlation
  let nusselt = 0;
  if (rayleigh < 1e9) {
    nusselt = 0.59 * Math.pow(rayleigh, 0.25); // Laminar
  } else {
    nusselt = 0.1 * Math.pow(rayleigh, 1 / 3); // Turbulent
  }

  const hConv = (nusselt * kAir) / L;
  const qFluxWattsM2 = hConv * deltaT;

  return {
    grashof: grashof.toExponential(2),
    rayleigh: rayleigh.toExponential(2),
    nusselt: nusselt.toFixed(2),
    hConv: hConv.toFixed(2),
    qFluxWattsM2: qFluxWattsM2.toFixed(1),
    flowRegime: rayleigh > 1e9 ? 'اضطرابي (Turbulent)' : 'صفائحي (Laminar)'
  };
}

// 5. Forced Convection Internal Flow
export function calculateForcedConvection(inputs: ForcedConvectionInputs) {
  const D = inputs.pipeDiameterMm / 1000; // m
  const velocity = inputs.fluidVelocityMs;
  
  // Water default props at 25°C
  const rho = inputs.fluidType === 'water' ? 997 : inputs.fluidType === 'air' ? 1.18 : 885;
  const mu = inputs.fluidType === 'water' ? 0.00089 : inputs.fluidType === 'air' ? 0.0000184 : 0.05;
  const kFluid = inputs.fluidType === 'water' ? 0.607 : inputs.fluidType === 'air' ? 0.026 : 0.145;
  const cp = inputs.fluidType === 'water' ? 4182 : inputs.fluidType === 'air' ? 1007 : 1900;
  const pr = (cp * mu) / kFluid;

  const reynolds = (rho * velocity * D) / mu;

  let nusselt = 0;
  let flowRegime = '';

  if (reynolds < 2300) {
    flowRegime = 'صفائحي (Laminar)';
    nusselt = 3.66; // Fully developed laminar
  } else {
    flowRegime = 'اضطرابي (Turbulent)';
    // Dittus-Boelter correlation
    const n = inputs.wallTempC > inputs.fluidTempC ? 0.4 : 0.3; // heating vs cooling
    nusselt = 0.023 * Math.pow(reynolds, 0.8) * Math.pow(pr, n);
  }

  const hConv = (nusselt * kFluid) / D;
  const deltaT = Math.abs(inputs.wallTempC - inputs.fluidTempC);
  const heatFlux = hConv * deltaT;

  return {
    reynolds: reynolds.toFixed(0),
    prandtl: pr.toFixed(2),
    nusselt: nusselt.toFixed(2),
    hConv: hConv.toFixed(1),
    heatFluxWattsM2: heatFlux.toFixed(1),
    flowRegime
  };
}

// 6. Transient Conduction (Lumped Capacitance)
export function calculateTransientConduction(inputs: TransientConductionInputs) {
  const r = inputs.sphereRadiusMm / 1000;
  const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
  const surfaceArea = 4 * Math.PI * Math.pow(r, 2);
  const lc = volume / surfaceArea; // Characteristic length r/3

  const biot = (inputs.h * lc) / inputs.k;
  const alpha = inputs.k / (inputs.density * inputs.cp);
  const fourier = (alpha * inputs.timeSeconds) / Math.pow(lc, 2);

  // Temperature at time t
  const exponent = - (inputs.h * surfaceArea * inputs.timeSeconds) / (inputs.density * volume * inputs.cp);
  const tempC = inputs.ambientTempC + (inputs.initialTempC - inputs.ambientTempC) * Math.exp(exponent);

  // Time curve generator for animation
  const curve = [];
  const totalSteps = 20;
  const maxT = Math.max(60, inputs.timeSeconds * 1.5);
  for (let i = 0; i <= totalSteps; i++) {
    const tCurrent = (i / totalSteps) * maxT;
    const expCur = - (inputs.h * surfaceArea * tCurrent) / (inputs.density * volume * inputs.cp);
    const tempCur = inputs.ambientTempC + (inputs.initialTempC - inputs.ambientTempC) * Math.exp(expCur);
    curve.push({
      time: tCurrent.toFixed(1),
      tempC: tempCur.toFixed(1)
    });
  }

  return {
    biotNumber: biot.toFixed(4),
    fourierNumber: fourier.toFixed(2),
    isLumpedValid: biot < 0.1,
    currentTempC: tempC.toFixed(1),
    curve
  };
}

// 7. Critical Insulation Radius
export function calculateCriticalRadius(inputs: CriticalRadiusInputs) {
  const r1 = inputs.pipeOuterRadiusMm / 1000; // inner radius of insulation m
  const kIns = inputs.insulationK;
  const hOut = inputs.hOuter;

  // Critical radius for cylinder = k / h
  const rCritM = kIns / hOut;
  const rCritMm = rCritM * 1000;

  // Calculate heat loss vs insulation radius curve
  const points = [];
  const rMaxMm = Math.max(rCritMm * 2.5, r1 * 1000 * 3);
  const steps = 15;

  for (let i = 0; i <= steps; i++) {
    const rOuterMm = (r1 * 1000) + (i / steps) * (rMaxMm - r1 * 1000);
    const rOuterM = rOuterMm / 1000;
    
    // Thermal resistance per meter length = ln(rOuter/r1)/(2*pi*k) + 1/(2*pi*rOuter*h)
    const rIns = Math.log(rOuterM / r1) / (2 * Math.PI * kIns);
    const rConv = 1 / (2 * Math.PI * rOuterM * hOut);
    const totalR = rIns + rConv;
    const qPerMeter = 100 / totalR; // assume 100°C delta T

    points.push({
      rMm: rOuterMm.toFixed(1),
      qWattsPerM: qPerMeter.toFixed(1),
      isCritical: Math.abs(rOuterMm - rCritMm) < 2
    });
  }

  return {
    rCriticalMm: rCritMm.toFixed(2),
    rPipeMm: (r1 * 1000).toFixed(2),
    isPipeBelowCritical: r1 * 1000 < rCritMm,
    points
  };
}
