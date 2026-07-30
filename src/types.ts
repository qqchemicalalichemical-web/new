export type UnitSystem = 'SI' | 'Imperial';

export type FlowType = 'counter' | 'parallel' | 'shell12' | 'cross_unmixed';

export type ExchangerType = 'shell_and_tube' | 'plate_and_frame' | 'double_pipe' | 'air_cooled' | 'spiral';

// Top-Level Navigation Sections
export type MainSection =
  | 'holman_heat_transfer'
  | 'mccabe_unit_operations'
  | 'engineering_calculator'
  | 'unit_converter'
  | 'engineering_database'
  | 'reports_projects';

// Section 1: Holman Heat Transfer Modules (13 Modules)
export type HolmanModuleId =
  | 'lmtd'
  | 'ntu'
  | 'overall_u'
  | 'conduction'
  | 'fins'
  | 'radiation'
  | 'natural_convection'
  | 'forced_convection'
  | 'boiling'
  | 'condensation'
  | 'transient_conduction'
  | 'critical_radius'
  | 'exchanger_selection';

// Section 2: McCabe Unit Operations Modules (15 Modules)
export type McCabeModuleId =
  | 'distillation'
  | 'absorption'
  | 'extraction'
  | 'drying'
  | 'filtration'
  | 'evaporation'
  | 'crystallization'
  | 'sedimentation'
  | 'cyclone'
  | 'fluidization'
  | 'mixing'
  | 'humidification'
  | 'adsorption'
  | 'ion_exchange'
  | 'membrane';

export interface FluidPropertyPoint {
  tempC: number;
  rho: number; // kg/m3
  cp: number;  // J/kg.K
  k: number;   // W/m.K
  mu: number;  // Pa.s
  pr: number;
}

export interface FluidDefinition {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'water_steam' | 'oils' | 'gases' | 'refrigerants' | 'glycols' | 'custom';
  description: string;
  points: FluidPropertyPoint[];
}

export interface CalculationInputs {
  unitSystem: UnitSystem;
  flowType: FlowType;
  exchangerType: ExchangerType;
  
  // Temperatures in °C or °F depending on unitSystem
  thin: number;
  thout: number;
  tcin: number;
  tcout: number;
  
  // Mass flow rates
  mh: number; // kg/s or lb/h
  mc: number; // kg/s or lb/h
  
  // Fluids
  hotFluidId: string;
  coldFluidId: string;
  
  // Custom properties if overridden
  cphOverride?: number;
  cpcOverride?: number;
  
  // Overall heat transfer
  uAssumed: number; // W/m²K or BTU/h.ft².°F
  areaAssumed?: number; // m² or ft²
  
  // Geometric & Fouling details for U calculation
  di_mm: number;
  do_mm: number;
  length_m: number;
  numTubes: number;
  ktube: number;
  rfi: number;
  rfo: number;
  hi: number;
  ho: number;

  // Operating context for Auto-Recommendation
  maxPressureBar: number;
  spaceConstraint: 'tight' | 'flexible' | 'extreme_compact';
  foulingSeverity: 'low' | 'medium' | 'high' | 'slurry';
  budgetPriority: 'low_initial' | 'balanced' | 'low_lifecycle';
}

export interface CalculationResults {
  // LMTD Method
  lmtd: number;
  correctionFactorF: number;
  effectiveLmtd: number;
  qHotKw: number;
  qColdKw: number;
  qDesignKw: number;
  requiredAreaM2: number;

  // NTU Method
  chKwK: number;
  ccKwK: number;
  cminKwK: number;
  cmaxKwK: number;
  capacityRatioCr: number;
  ntu: number;
  effectivenessEps: number;
  qMaxKw: number;
  qNtuKw: number;
  calculatedThout: number;
  calculatedTcout: number;

  // U Coefficient Details
  calculatedUo: number;
  calculatedUi: number;
  resistanceBreakdown: {
    rInnerConv: number;
    rInnerFouling: number;
    rTubeWall: number;
    rOuterFouling: number;
    rOuterConv: number;
    rTotal: number;
  };

  // Fluid Properties calculated at average temperatures
  hotFluidProps: FluidPropertyPoint;
  coldFluidProps: FluidPropertyPoint;

  // Temperature Profiles across exchanger (0 to 1 normalized length)
  temperatureProfile: Array<{
    xNormalized: number;
    th: number;
    tc: number;
    dT: number;
  }>;
}

export interface ValidationIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  messageAr: string;
  messageEn: string;
  field?: string;
  recommendationAr?: string;
}

export interface RecommendationResult {
  recommendedType: ExchangerType;
  matchScore: number;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  prosAr: string[];
  consAr: string[];
  alternativesAr: Array<{
    type: ExchangerType;
    titleAr: string;
    score: number;
  }>;
}

export interface StepByStepCalculation {
  stepNumber: number;
  titleAr: string;
  formulaTex: string;
  substitutionAr: string;
  resultAr: string;
  explanationAr: string;
}

export interface SavedProject {
  id: string;
  name: string;
  date: string;
  notes?: string;
  inputs: CalculationInputs;
}

// Converter Categories
export type UnitCategory =
  | 'Length'
  | 'Area'
  | 'Volume'
  | 'Velocity'
  | 'Mass'
  | 'Density'
  | 'Pressure'
  | 'Force'
  | 'Temperature'
  | 'Energy'
  | 'Power'
  | 'Heat Flux'
  | 'Heat Transfer Coefficient'
  | 'Thermal Conductivity'
  | 'Specific Heat'
  | 'Viscosity'
  | 'Kinematic Viscosity'
  | 'Diffusivity'
  | 'Mass Flow'
  | 'Volume Flow'
  | 'Mole'
  | 'Concentration'
  | 'Gas Constant'
  | 'Steam Units'
  | 'Fouling Factor'
  | 'Overall U';

// Scientific Calculator Types
export type CalcMode = 'scientific' | 'matrix' | 'polynomial' | 'solver';

// Material Database Types
export interface MaterialProperty {
  id: string;
  nameAr: string;
  nameEn: string;
  category: 'Fluids' | 'Gases' | 'Refrigerants' | 'Metals' | 'Insulation' | 'Pipes';
  density: number; // kg/m³
  specificHeat: number; // J/kg.K
  thermalConductivity: number; // W/m.K
  viscosity?: number; // Pa.s
  emissivity?: number;
  roughnessMm?: number; // mm
  foulingFactor?: number; // m²K/W
  descriptionAr: string;
}

