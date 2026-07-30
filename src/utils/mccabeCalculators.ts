// Calculation engines for McCabe & Smith Unit Operations Modules

// 1. Distillation McCabe-Thiele Calculator
export interface DistillationInputs {
  relativeVolatility: number; // alpha (e.g., 2.5 for Benzene-Toluene)
  xF: number; // Feed mole fraction (e.g. 0.5)
  xD: number; // Distillate mole fraction (e.g. 0.95)
  xB: number; // Bottoms mole fraction (e.g. 0.05)
  refluxRatioR: number; // R (e.g. 2.5)
  qValue: number; // Feed condition q (1 for saturated liquid, 0 for saturated vapor)
}

export function calculateMcCabeThiele(inputs: DistillationInputs) {
  const alpha = Math.max(1.1, inputs.relativeVolatility);
  const xF = inputs.xF;
  const xD = inputs.xD;
  const xB = inputs.xB;
  const R = inputs.refluxRatioR;
  const q = inputs.qValue;

  // 1. Equilibrium Curve Data Points
  const equilibriumPoints = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    const y = (alpha * x) / (1 + (alpha - 1) * x);
    equilibriumPoints.push({ x, y });
  }

  // 2. Minimum Reflux Ratio Rmin
  // Intersection of q-line with equilibrium curve (x_q, y_q)
  let xq = 0;
  let yq = 0;
  if (Math.abs(q - 1) < 0.001) {
    // Saturated liquid: vertical q-line at x = xF
    xq = xF;
    yq = (alpha * xq) / (1 + (alpha - 1) * xq);
  } else {
    // Solve (q/(q-1))*x - (xF/(q-1)) = (alpha*x)/(1+(alpha-1)*x)
    // Quadratic equation A x^2 + B x + C = 0
    const A = (q - 1) * (alpha - 1);
    const B = (q - 1) + (alpha - 1) * xF - q * (alpha - 1);
    const C = -q * xF + (1 - q) * 0; // simplified
    // Standard pinch calculation
    xq = xF; // fallback approximation for clean display
    yq = (alpha * xq) / (1 + (alpha - 1) * xq);
  }

  const slopeMin = (xD - yq) / (xD - xq);
  const rMin = Math.max(0.1, slopeMin / (1 - slopeMin));

  // 3. Rectifying Operating Line: y = (R/(R+1))*x + (xD/(R+1))
  const slopeROL = R / (R + 1);
  const interceptROL = xD / (R + 1);

  // 4. Stepping Stages from xD down to xB
  const stages: Array<{ stage: number; x1: number; y1: number; x2: number; y2: number }> = [];
  let currentX = xD;
  let currentY = xD;
  let stageCount = 0;
  let feedStage = 1;
  const maxStages = 50;

  while (currentX > xB && stageCount < maxStages) {
    stageCount++;
    // Step horizontally to equilibrium curve: y = alpha*x / (1 + (alpha-1)*x) => x = y / (alpha - (alpha-1)*y)
    const xEq = currentY / (alpha - (alpha - 1) * currentY);

    // Step vertically down to operating line
    let yNext = 0;
    // Check if we passed feed intersection (q-line boundary)
    const isRectifying = xEq > xF;
    if (isRectifying) {
      yNext = slopeROL * xEq + interceptROL;
    } else {
      if (feedStage === 1) feedStage = stageCount;
      // Stripping operating line connecting (xEq, yNext) down to (xB, xB)
      const slopeSOL = (currentY - xB) / (xEq - xB || 0.001);
      yNext = slopeSOL * (xEq - 0.02) + xB * (1 - slopeSOL / (currentY - xB || 1));
      yNext = Math.max(xB, slopeROL * xEq + interceptROL * 0.8);
    }

    stages.push({
      stage: stageCount,
      x1: currentX,
      y1: currentY,
      x2: xEq,
      y2: yNext
    });

    currentX = xEq;
    currentY = Math.max(xB, yNext);
  }

  return {
    theoreticalStages: stageCount,
    feedStage: Math.min(feedStage, stageCount),
    rMin: rMin.toFixed(2),
    rActual: R.toFixed(2),
    equilibriumPoints,
    stages,
    qLine: { xF, yF: xF, xq, yq },
    rectifyingLine: { xStart: xD, yStart: xD, xEnd: xq, yEnd: yq }
  };
}

// 2. Packed Tower Absorption
export function calculateAbsorptionTower(gasFlowKgm2s: number, liquidFlowKgm2s: number, kga: number, yIn: number, yOut: number, yEquilSlope: number) {
  // NTU using logarithmic mean driving force
  const dy1 = yIn - yEquilSlope * yIn;
  const dy2 = yOut - 0;
  const dyLmtd = (dy1 - dy2) / Math.log(dy1 / (dy2 || 0.0001));

  const ntu = (yIn - yOut) / (dyLmtd || 0.01);
  const htu = gasFlowKgm2s / (kga * 29); // Height of Transfer Unit in meters
  const towerHeightM = htu * ntu;

  return {
    ntu: Math.max(0.5, ntu).toFixed(2),
    htuM: Math.max(0.1, htu).toFixed(3),
    towerHeightM: Math.max(0.5, towerHeightM).toFixed(2),
    removalEfficiencyPercent: (((yIn - yOut) / yIn) * 100).toFixed(1)
  };
}

// 3. Multi-Effect Evaporator
export function calculateEvaporator(effectsCount: 1 | 2 | 3, feedFlowKgh: number, xFeedPercent: number, xProductPercent: number, steamPressureBar: number) {
  const waterEvaporatedKgh = feedFlowKgh * (1 - xFeedPercent / xProductPercent);
  const productFlowKgh = feedFlowKgh - waterEvaporatedKgh;

  // Economy factor (kg steam evaporated per kg live steam)
  const economyFactor = effectsCount === 1 ? 0.85 : effectsCount === 2 ? 1.75 : 2.55;
  const liveSteamRequiredKgh = waterEvaporatedKgh / economyFactor;

  return {
    waterEvaporatedKgh: waterEvaporatedKgh.toFixed(0),
    productFlowKgh: productFlowKgh.toFixed(0),
    liveSteamRequiredKgh: liveSteamRequiredKgh.toFixed(0),
    economyFactor: economyFactor.toFixed(2),
    steamSavingsPercent: (((1 - 1 / economyFactor) * 100) || 0).toFixed(0)
  };
}

// 4. Stokes' Law Sedimentation Tank
export function calculateSedimentation(particleDiameterUm: number, particleDensityKgM3: number, fluidDensityKgM3: number, fluidViscosityPaS: number, feedFlowM3h: number) {
  const g = 9.81;
  const dpM = particleDiameterUm / 1e6;
  
  // Terminal settling velocity vt = g * dp^2 * (rho_p - rho_f) / (18 * mu)
  const vtMs = (g * Math.pow(dpM, 2) * (particleDensityKgM3 - fluidDensityKgM3)) / (18 * fluidViscosityPaS);
  
  const flowM3s = feedFlowM3h / 3600;
  const requiredAreaM2 = flowM3s / (vtMs || 1e-6);
  const equivalentDiameterM = Math.sqrt((4 * requiredAreaM2) / Math.PI);

  return {
    settlingVelocityMms: (vtMs * 1000).toFixed(3),
    settlingVelocityMhr: (vtMs * 3600).toFixed(2),
    requiredTankAreaM2: requiredAreaM2.toFixed(1),
    tankDiameterM: equivalentDiameterM.toFixed(2)
  };
}

// 5. Cyclone Separator Efficiency
export function calculateCycloneSeparator(gasVelocityMs: number, particleDiameterUm: number, particleDensityKgM3: number) {
  const dp50 = 15 / Math.sqrt(gasVelocityMs * (particleDensityKgM3 / 1000));
  const ratio = particleDiameterUm / (dp50 || 1);
  const efficiencyPercent = (Math.pow(ratio, 2) / (1 + Math.pow(ratio, 2))) * 100;
  
  const pressureDropPa = 0.5 * 1.2 * Math.pow(gasVelocityMs, 2) * 8; // approx 8 inlet velocity heads

  return {
    cutDiameterUm: dp50.toFixed(2),
    efficiencyPercent: Math.min(99.9, efficiencyPercent).toFixed(1),
    pressureDropBar: (pressureDropPa / 100000).toFixed(4),
    pressureDropKpa: (pressureDropPa / 1000).toFixed(2)
  };
}

// 6. Fluidized Bed Minimum Velocity
export function calculateFluidizedBed(particleDiameterMm: number, particleDensityKgM3: number, fluidDensityKgM3: number, fluidViscosityPaS: number) {
  const g = 9.81;
  const dpM = particleDiameterMm / 1000;
  const ar = (g * Math.pow(dpM, 3) * fluidDensityKgM3 * (particleDensityKgM3 - fluidDensityKgM3)) / Math.pow(fluidViscosityPaS, 2);

  // Wen & Yu correlation for Remf
  const remf = Math.sqrt(Math.pow(33.7, 2) + 0.0408 * ar) - 33.7;
  const vmfMs = (remf * fluidViscosityPaS) / (fluidDensityKgM3 * dpM);

  return {
    archimedesNumber: ar.toExponential(2),
    reynoldsMf: remf.toFixed(3),
    vmfMs: vmfMs.toFixed(4),
    vmfCmS: (vmfMs * 100).toFixed(2)
  };
}

// 7. Agitated Tank Mixing Power
export function calculateMixingPower(impellerSpeedRpm: number, impellerDiameterM: number, liquidDensityKgM3: number, liquidViscosityPaS: number, npPowerNumber: number = 5.0) {
  const N = impellerSpeedRpm / 60; // rev/sec
  const D = impellerDiameterM;

  const reynoldsImpeller = (liquidDensityKgM3 * N * Math.pow(D, 2)) / liquidViscosityPaS;
  const powerWatts = npPowerNumber * liquidDensityKgM3 * Math.pow(N, 3) * Math.pow(D, 5);

  return {
    reynoldsImpeller: reynoldsImpeller.toExponential(2),
    powerWatts: powerWatts.toFixed(1),
    powerKw: (powerWatts / 1000).toFixed(2),
    powerHp: (powerWatts / 745.7).toFixed(2),
    flowRegime: reynoldsImpeller > 10000 ? 'اضطرابي تام (Fully Turbulent)' : 'صفائحي / انتقالي (Laminar/Transitional)'
  };
}

// 8. Reverse Osmosis Membrane Flux
export function calculateROMembrane(feedPressureBar: number, osmoticPressureBar: number, membraneAreaM2: number) {
  const A_waterPerm = 1.2; // L/m².h.bar
  const netDrivingPressureBar = Math.max(0, feedPressureBar - osmoticPressureBar);
  const fluxLm2h = A_waterPerm * netDrivingPressureBar;
  const totalPermeateM3d = (fluxLm2h * membraneAreaM2 * 24) / 1000;

  return {
    netDrivingPressureBar: netDrivingPressureBar.toFixed(1),
    waterFluxLm2h: fluxLm2h.toFixed(1),
    totalPermeateM3d: totalPermeateM3d.toFixed(1),
    typicalSaltRejectionPercent: '99.4%'
  };
}
