import { UnitSystem } from '../types';

export const unitLabels = {
  SI: {
    temp: '°C',
    tempDiff: 'K',
    massFlow: 'kg/s',
    heatDuty: 'kW',
    area: 'm²',
    uCoef: 'W/m²·K',
    pressure: 'bar',
    length: 'm',
    diameter: 'mm',
    conductivity: 'W/m·K',
    fouling: 'm²·K/W',
    density: 'kg/m³',
    cp: 'J/kg·K',
    viscosity: 'mPa·s'
  },
  Imperial: {
    temp: '°F',
    tempDiff: '°F',
    massFlow: 'lb/h',
    heatDuty: 'BTU/h',
    area: 'ft²',
    uCoef: 'BTU/h·ft²·°F',
    pressure: 'psi',
    length: 'ft',
    diameter: 'in',
    conductivity: 'BTU/h·ft·°F',
    fouling: 'h·ft²·°F/BTU',
    density: 'lb/ft³',
    cp: 'BTU/lb·°F',
    viscosity: 'cP'
  }
};

export const convertTempToSi = (val: number, unit: UnitSystem): number => {
  if (unit === 'SI') return val;
  return (val - 32) / 1.8;
};

export const convertTempFromSi = (valC: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valC;
  return valC * 1.8 + 32;
};

export const convertTempDiffFromSi = (valK: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valK;
  return valK * 1.8;
};

export const convertMassFlowToSi = (val: number, unit: UnitSystem): number => {
  if (unit === 'SI') return val;
  return val / 7936.64; // lb/h to kg/s
};

export const convertMassFlowFromSi = (valKgS: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valKgS;
  return valKgS * 7936.64;
};

export const convertHeatDutyFromSi = (valKw: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valKw;
  return valKw * 3412.14; // kW to BTU/h
};

export const convertAreaFromSi = (valM2: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valM2;
  return valM2 * 10.7639; // m2 to ft2
};

export const convertUToSi = (val: number, unit: UnitSystem): number => {
  if (unit === 'SI') return val;
  return val / 0.17611; // BTU/h.ft2.°F to W/m2.K
};

export const convertUFromSi = (valWM2K: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valWM2K;
  return valWM2K * 0.17611;
};

export const convertPressureFromSi = (valBar: number, unit: UnitSystem): number => {
  if (unit === 'SI') return valBar;
  return valBar * 14.5038; // bar to psi
};
