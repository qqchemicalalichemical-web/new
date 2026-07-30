import {
  CalculationInputs,
  CalculationResults,
  ValidationIssue,
  RecommendationResult,
  StepByStepCalculation,
  ExchangerType
} from '../types';
import { getFluidPropertiesAtTemp } from '../data/fluidsDatabase';
import { convertTempToSi, convertMassFlowToSi, convertUToSi } from './unitConverter';

// Bowman Correction Factor F for Shell and Tube (1 Shell Pass, 2 or multi Tube Passes)
export function calculateFfactor(P: number, R: number): number {
  if (P <= 0 || P >= 1) return 1.0;
  if (R <= 0) return 1.0;

  if (Math.abs(R - 1.0) < 1e-5) {
    const term = P * Math.SQRT2;
    const denom = (1 - P) * Math.log((2 - P * (2 - Math.SQRT2)) / (2 - P * (2 + Math.SQRT2)));
    if (isNaN(denom) || denom === 0) return 1.0;
    return Math.min(1.0, Math.max(0.5, term / denom));
  }

  const sqrtR2plus1 = Math.sqrt(R * R + 1);
  const num = sqrtR2plus1 * Math.log((1 - P) / (1 - P * R));
  const den = (R - 1) * Math.log((2 - P * (R + 1 - sqrtR2plus1)) / (2 - P * (R + 1 + sqrtR2plus1)));

  if (isNaN(num) || isNaN(den) || den === 0) return 1.0;
  const F = num / den;
  return Math.min(1.0, Math.max(0.5, isNaN(F) ? 1.0 : F));
}

export function calculateResults(inputs: CalculationInputs): CalculationResults {
  // 1. Normalize all inputs to SI for calculation
  const Thin = convertTempToSi(inputs.thin, inputs.unitSystem);
  const Thout = convertTempToSi(inputs.thout, inputs.unitSystem);
  const Tcin = convertTempToSi(inputs.tcin, inputs.unitSystem);
  const Tcout = convertTempToSi(inputs.tcout, inputs.unitSystem);

  const mhKgS = convertMassFlowToSi(inputs.mh, inputs.unitSystem);
  const mcKgS = convertMassFlowToSi(inputs.mc, inputs.unitSystem);

  const uWm2K = convertUToSi(inputs.uAssumed, inputs.unitSystem);

  // Average temperatures for property evaluation
  const ThAvg = (Thin + Thout) / 2;
  const TcAvg = (Tcin + Tcout) / 2;

  const hotFluidProps = getFluidPropertiesAtTemp(inputs.hotFluidId, ThAvg);
  const coldFluidProps = getFluidPropertiesAtTemp(inputs.coldFluidId, TcAvg);

  const Cph = inputs.cphOverride || hotFluidProps.cp;
  const Cpc = inputs.cpcOverride || coldFluidProps.cp;

  // 2. Heat Duties
  const qHotKw = (mhKgS * Cph * Math.abs(Thin - Thout)) / 1000;
  const qColdKw = (mcKgS * Cpc * Math.abs(Tcout - Tcin)) / 1000;
  const qDesignKw = (qHotKw + qColdKw) / 2;

  // 3. Temperature differences & LMTD
  let dT1 = 0;
  let dT2 = 0;

  if (inputs.flowType === 'parallel') {
    dT1 = Thin - Tcin;
    dT2 = Thout - Tcout;
  } else {
    // Counter flow / default
    dT1 = Thin - Tcout;
    dT2 = Thout - Tcin;
  }

  let lmtd = 0;
  if (dT1 > 0 && dT2 > 0) {
    if (Math.abs(dT1 - dT2) < 1e-4) {
      lmtd = dT1;
    } else {
      lmtd = (dT1 - dT2) / Math.log(dT1 / dT2);
    }
  }

  let correctionFactorF = 1.0;
  if (inputs.flowType === 'shell12') {
    const P = (Tcout - Tcin) / Math.max(1e-4, Thin - Tcin);
    const R = (Thin - Thout) / Math.max(1e-4, Tcout - Tcin);
    correctionFactorF = calculateFfactor(P, R);
  }

  const effectiveLmtd = Math.max(0, lmtd * correctionFactorF);
  const requiredAreaM2 = (uWm2K > 0 && effectiveLmtd > 0)
    ? (qDesignKw * 1000) / (uWm2K * effectiveLmtd)
    : 0;

  // 4. NTU Method Calculations
  const chKwK = (mhKgS * Cph) / 1000;
  const ccKwK = (mcKgS * Cpc) / 1000;

  const cminKwK = Math.min(chKwK, ccKwK);
  const cmaxKwK = Math.max(chKwK, ccKwK);
  const capacityRatioCr = cmaxKwK > 0 ? cminKwK / cmaxKwK : 0;

  const areaForNtu = inputs.areaAssumed || requiredAreaM2 || 10;
  const ntu = cminKwK > 0 ? (uWm2K * areaForNtu) / 1000 / cminKwK : 0;

  let effectivenessEps = 0;
  if (ntu > 0) {
    if (inputs.flowType === 'parallel') {
      effectivenessEps = (1 - Math.exp(-ntu * (1 + capacityRatioCr))) / (1 + capacityRatioCr);
    } else if (inputs.flowType === 'shell12') {
      const s = Math.sqrt(1 + capacityRatioCr * capacityRatioCr);
      const expTerm = Math.exp(-ntu * s);
      effectivenessEps = 2 / (1 + capacityRatioCr + s * ((1 + expTerm) / Math.max(1e-6, 1 - expTerm)));
    } else {
      // Counter flow
      if (Math.abs(capacityRatioCr - 1.0) < 1e-4) {
        effectivenessEps = ntu / (1 + ntu);
      } else {
        const expTerm = Math.exp(-ntu * (1 - capacityRatioCr));
        effectivenessEps = (1 - expTerm) / (1 - capacityRatioCr * expTerm);
      }
    }
  }

  effectivenessEps = Math.min(1.0, Math.max(0, effectivenessEps));

  const qMaxKw = cminKwK * Math.max(0, Thin - Tcin);
  const qNtuKw = effectivenessEps * qMaxKw;

  const calculatedThout = Thin - (chKwK > 0 ? qNtuKw / chKwK : 0);
  const calculatedTcout = Tcin + (ccKwK > 0 ? qNtuKw / ccKwK : 0);

  // 5. Detailed U coefficient calculation
  const Di = (inputs.di_mm || 20) / 1000;
  const Do = (inputs.do_mm || 25) / 1000;
  const L = inputs.length_m || 3;
  const Ntubes = inputs.numTubes || 1;
  const kwall = inputs.ktube || 45;
  const Rfi = inputs.rfi || 0.0002;
  const Rfo = inputs.rfo || 0.0002;
  const hi = inputs.hi || 2500;
  const ho = inputs.ho || 1500;

  const Ai = Math.PI * Di * L * Ntubes;
  const Ao = Math.PI * Do * L * Ntubes;

  const rInnerConv = Ai > 0 ? 1 / (hi * Ai) : 0;
  const rInnerFouling = Ai > 0 ? Rfi / Ai : 0;
  const rTubeWall = (kwall > 0 && Di > 0) ? Math.log(Do / Di) / (2 * Math.PI * kwall * L * Ntubes) : 0;
  const rOuterFouling = Ao > 0 ? Rfo / Ao : 0;
  const rOuterConv = Ao > 0 ? 1 / (ho * Ao) : 0;

  const rTotal = rInnerConv + rInnerFouling + rTubeWall + rOuterFouling + rOuterConv;
  const calculatedUo = (rTotal > 0 && Ao > 0) ? 1 / (rTotal * Ao) : uWm2K;
  const calculatedUi = (rTotal > 0 && Ai > 0) ? 1 / (rTotal * Ai) : uWm2K;

  // 6. Generate Temperature Profile (20 steps along normalized length)
  const steps = 20;
  const temperatureProfile = [];

  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    let th = Thin;
    let tc = Tcin;

    if (inputs.flowType === 'parallel') {
      // Exponential decay approach for parallel flow
      const decay = Math.exp(-x * ntu * (1 + capacityRatioCr));
      th = Thin - (chKwK > 0 ? (cminKwK * (Thin - Tcin) * (1 - decay)) / (chKwK * (1 + capacityRatioCr)) : 0);
      tc = Tcin + (ccKwK > 0 ? (cminKwK * (Thin - Tcin) * (1 - decay)) / (ccKwK * (1 + capacityRatioCr)) : 0);
    } else {
      // Counter flow profile approximation
      if (Math.abs(capacityRatioCr - 1.0) < 1e-4) {
        th = Thin - x * (Thin - calculatedThout);
        tc = Tcout - x * (Tcout - Tcin);
      } else {
        const expX = Math.exp(-x * ntu * (1 - capacityRatioCr));
        const expTotal = Math.exp(-ntu * (1 - capacityRatioCr));
        const frac = (1 - expX) / Math.max(1e-6, 1 - capacityRatioCr * expTotal);

        th = Thin - (chKwK > 0 ? (cminKwK * (Thin - Tcin) * frac) / chKwK : 0);
        tc = Tcout - (ccKwK > 0 ? (cminKwK * (Thin - Tcin) * (1 - frac * capacityRatioCr)) / ccKwK : 0);
      }
    }

    temperatureProfile.push({
      xNormalized: Number(x.toFixed(2)),
      th: Number(th.toFixed(1)),
      tc: Number(tc.toFixed(1)),
      dT: Number(Math.abs(th - tc).toFixed(1))
    });
  }

  return {
    lmtd: Number(lmtd.toFixed(2)),
    correctionFactorF: Number(correctionFactorF.toFixed(3)),
    effectiveLmtd: Number(effectiveLmtd.toFixed(2)),
    qHotKw: Number(qHotKw.toFixed(2)),
    qColdKw: Number(qColdKw.toFixed(2)),
    qDesignKw: Number(qDesignKw.toFixed(2)),
    requiredAreaM2: Number(requiredAreaM2.toFixed(3)),
    chKwK: Number(chKwK.toFixed(3)),
    ccKwK: Number(ccKwK.toFixed(3)),
    cminKwK: Number(cminKwK.toFixed(3)),
    cmaxKwK: Number(cmaxKwK.toFixed(3)),
    capacityRatioCr: Number(capacityRatioCr.toFixed(3)),
    ntu: Number(ntu.toFixed(3)),
    effectivenessEps: Number(effectivenessEps.toFixed(3)),
    qMaxKw: Number(qMaxKw.toFixed(2)),
    qNtuKw: Number(qNtuKw.toFixed(2)),
    calculatedThout: Number(calculatedThout.toFixed(1)),
    calculatedTcout: Number(calculatedTcout.toFixed(1)),
    calculatedUo: Number(calculatedUo.toFixed(1)),
    calculatedUi: Number(calculatedUi.toFixed(1)),
    resistanceBreakdown: {
      rInnerConv,
      rInnerFouling,
      rTubeWall,
      rOuterFouling,
      rOuterConv,
      rTotal
    },
    hotFluidProps,
    coldFluidProps,
    temperatureProfile
  };
}

// Feature #9: Validation Engine with thermodynamic sanity checks
export function validateInputs(inputs: CalculationInputs): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const Thin = convertTempToSi(inputs.thin, inputs.unitSystem);
  const Thout = convertTempToSi(inputs.thout, inputs.unitSystem);
  const Tcin = convertTempToSi(inputs.tcin, inputs.unitSystem);
  const Tcout = convertTempToSi(inputs.tcout, inputs.unitSystem);

  // 1. Hot stream temperature direction check
  if (Thin <= Thout) {
    issues.push({
      id: 'hot_temp_direction',
      severity: 'error',
      field: 'thout',
      messageAr: 'درجة حرارة مخرج السائل الساخن Th,out يجب أن تكون أقل من درجة حرارة المدخل Th,in (عملية تبريد).',
      messageEn: 'Hot outlet temperature Th,out must be less than inlet Thin.',
      recommendationAr: 'تأكد من إدخال درجة حرارة خروج أخفض للسائل الساخن.'
    });
  }

  // 2. Cold stream temperature direction check
  if (Tcout <= Tcin) {
    issues.push({
      id: 'cold_temp_direction',
      severity: 'error',
      field: 'tcout',
      messageAr: 'درجة حرارة مخرج السائل البارد Tc,out يجب أن تكون أعلى من درجة حرارة المدخل Tc,in (عملية تسخين).',
      messageEn: 'Cold outlet temperature Tc,out must be greater than inlet Tcin.',
      recommendationAr: 'تأكد من أن درجة حرارة مخرج السائل البارد أعلى من دخوله.'
    });
  }

  // 3. Second Law of Thermodynamics: Hot inlet must be warmer than Cold inlet
  if (Thin <= Tcin) {
    issues.push({
      id: 'second_law_violation',
      severity: 'error',
      field: 'thin',
      messageAr: 'انتهاك للقانون الثاني للديناميكا الحرارية: مدخل السائل الساخن Th,in ينبغي أن يكون أدفأ من مدخل البارد Tc,in.',
      messageEn: 'Hot inlet Thin must be higher than cold inlet Tcin.',
      recommendationAr: 'ارفع درجة حرارة السائل الساخن أو اخفض درجة حرارة المائع البارد.'
    });
  }

  // 4. Parallel flow temperature cross check
  if (inputs.flowType === 'parallel' && Tcout >= Thout) {
    issues.push({
      id: 'parallel_temp_cross',
      severity: 'error',
      field: 'flowType',
      messageAr: 'في التدفق المتوازي، من المستحيل فيزيائيًا أن تتجاوز درجة حرارة مخرج البارد مخرج الساخن (Tc,out ≥ Th,out).',
      messageEn: 'In parallel flow, Tc,out cannot exceed Th,out.',
      recommendationAr: 'غيّر نوع التدفق إلى تدفق متعاكس (Counter-flow) لتحقيق تبادل حراري أعمق.'
    });
  }

  // 5. Mass flow rate sanity
  if (inputs.mh <= 0 || inputs.mc <= 0) {
    issues.push({
      id: 'zero_mass_flow',
      severity: 'error',
      field: 'mh',
      messageAr: 'معدل التدفق الكتلي ṁ يجب أن يكون قيمة موجبة أكبر من الصفر.',
      messageEn: 'Mass flow rates must be strictly positive.',
      recommendationAr: 'أدخل معدلات تدفق كتلية غير صفرية.'
    });
  }

  // 6. Overall U sanity
  if (inputs.uAssumed <= 0) {
    issues.push({
      id: 'invalid_u',
      severity: 'error',
      field: 'uAssumed',
      messageAr: 'معامل الانتقال الحراري الكلي U يجب أن يكون أكبر من الصفر.',
      messageEn: 'Overall U coefficient must be greater than zero.'
    });
  }

  // 7. Pinch point / Small LMTD warning
  const dT1 = inputs.flowType === 'parallel' ? (Thin - Tcin) : (Thin - Tcout);
  const dT2 = inputs.flowType === 'parallel' ? (Thout - Tcout) : (Thout - Tcin);

  if (dT1 < 3 || dT2 < 3) {
    issues.push({
      id: 'pinch_point_warning',
      severity: 'warning',
      messageAr: 'تحذير نقطة الاقتراب الحراري (Pinch Point): فرق درجات الحرارة عند أحد الأطراف أقل من 3°C، مما يتطلب مساحة مبادل ضخمة جدًا.',
      messageEn: 'Pinch point warning: temperature difference < 3°C leads to huge area.',
      recommendationAr: 'زيادة معدل التدفق أو قبول درجات حرارة خروج مختلفة.'
    });
  }

  return issues;
}

// Feature #7: Smart Auto-Suggestion Engine
export function recommendExchangerType(inputs: CalculationInputs): RecommendationResult {
  const pBar = inputs.maxPressureBar || 10;
  const Thin = convertTempToSi(inputs.thin, inputs.unitSystem);
  const fouling = inputs.foulingSeverity;
  const space = inputs.spaceConstraint;
  const budget = inputs.budgetPriority;

  let scoreShellAndTube = 75;
  let scorePlateFrame = 70;
  let scoreDoublePipe = 50;
  let scoreAirCooled = 40;
  let scoreSpiral = 45;

  // Pressure factor
  if (pBar > 30) {
    scoreShellAndTube += 25;
    scorePlateFrame -= 40;
    scoreDoublePipe += 15;
  } else if (pBar < 15) {
    scorePlateFrame += 20;
  }

  // Temperature factor
  if (Thin > 200) {
    scoreShellAndTube += 20;
    scorePlateFrame -= 30;
  }

  // Space constraint
  if (space === 'tight' || space === 'extreme_compact') {
    scorePlateFrame += 25;
    scoreShellAndTube -= 15;
    scoreDoublePipe -= 20;
  }

  // Fouling / Slurry
  if (fouling === 'slurry' || fouling === 'high') {
    scoreSpiral += 35;
    scoreShellAndTube += 10;
    scorePlateFrame -= 15;
  }

  // Low mass flow small duty
  if (inputs.mh < 1.0 && inputs.mc < 1.0) {
    scoreDoublePipe += 30;
  }

  // Air cooling
  if (inputs.coldFluidId === 'air') {
    scoreAirCooled += 45;
  }

  // Find max score
  const scores = [
    { type: 'shell_and_tube' as ExchangerType, score: Math.min(99, scoreShellAndTube), titleAr: 'قشرة وأنبوب (Shell & Tube)' },
    { type: 'plate_and_frame' as ExchangerType, score: Math.min(99, scorePlateFrame), titleAr: 'ألواح صفائحية (Plate & Frame)' },
    { type: 'double_pipe' as ExchangerType, score: Math.min(99, scoreDoublePipe), titleAr: 'أنبوب مزدوج (Double Pipe)' },
    { type: 'spiral' as ExchangerType, score: Math.min(99, scoreSpiral), titleAr: 'حلزوني (Spiral Exchanger)' },
    { type: 'air_cooled' as ExchangerType, score: Math.min(99, scoreAirCooled), titleAr: 'مبرد هوائي (Air-Cooled Fin-Fan)' }
  ].sort((a, b) => b.score - a.score);

  const best = scores[0];

  const descriptions: Record<ExchangerType, { desc: string; pros: string[]; cons: string[] }> = {
    shell_and_tube: {
      desc: 'المبادل الحراري الأكثر شيوعاً واعتمادية في المنشآت الصناعية والمصافي، يتحمل الضغوط العالية والحرارة المرتفعة مع إمكانية تنظيف ميكانيكي ممتازة.',
      pros: ['تحمل ضغوط تشغيلية تزيد عن 300 bar', 'مناسب لدرجات حرارة يتجاوز 500°C', 'سهولة الصيانة والتنظيف الميكانيكي للأنابيب'],
      cons: ['بصمة مكانيّة وحجم كبير مقارنة بالألواح', 'كفاءة انتقال حراري أقل مقارنة بمبادلات الألواح']
    },
    plate_and_frame: {
      desc: 'مبادل ذو كفاءة حرارية هائلة وإحكام عالي جداً للمساحة، يُعد الخيار الأمثل للتكييف HVAC والتطبيقات الغذائية والصيدلانية.',
      pros: ['إحكام مساحة استثنائي (توفير حتى 80% من مساحة الأرضية)', 'معامل انتقال حراري U عالي جداً (حتى 3000 W/m²K)', 'إمكانية التوسعة المستقبلية بإضافة ألواح'],
      cons: ['محدودية الضغط (عادة أصل من 25 bar)', 'حساسية الجوانات Rubber Gaskets للحرارة العالية (>180°C)']
    },
    double_pipe: {
      desc: 'بسيط التصميم ومناسب جداً للتطبيقات الصغرى والأحمال الحرارية المنخفضة ومعدلات التدفق القليلة.',
      pros: ['أقل تكلفة أولية وتصنيع بسيط', 'تدفق متعاكس مثالي (Counter-flow)', 'مرونة في التركيب والتجميع'],
      cons: ['غير اقتصادي للمساحات الحرارية الكبيرة (A > 50 m²)', 'يشغل طريفاً طويلاً إذا تم تمديده']
    },
    spiral: {
      desc: 'تصميم حلزوني ذكي يمتاز بخاصية التنظيف الذاتي للجريان الدوامي، خيار مثالي للموائع عالية التلوث والعوالق.',
      pros: ['مقاومة عالية جداً للتلوث والانسداد (Self-cleaning)', 'ممر جريان واحد يمنع التحلل المائل', 'صيانة منخفضة في التطبيقات الصعبة'],
      cons: ['تكلفة تصنيع أولية عالية', 'محدودية الضغوط العالية جداً']
    },
    air_cooled: {
      desc: 'مبادل مبرد بالهواء الجوي مزود بزعانف لإلغاء الحاجة لمياه التبريد، يُستخدم بالصحاري والمناطق القاحلة.',
      pros: ['لا يحتاج مصادر مياه تبريد', 'تكلفة تشغيلية منخفضة جداً', 'صديق للبيئة بدون استهلاك مائي'],
      cons: ['معامل انتقال حراري low للغاية من جانب الهواء', 'يتطلب مراوح ضخمة ومساحة أرضية واسعة']
    }
  };

  const details = descriptions[best.type];

  return {
    recommendedType: best.type,
    matchScore: Math.max(65, best.score),
    titleAr: best.titleAr,
    titleEn: best.type,
    descriptionAr: details.desc,
    prosAr: details.pros,
    consAr: details.cons,
    alternativesAr: scores.slice(1, 4)
  };
}

// Feature #8: Educational Step-by-Step Generator
export function generateStepByStep(inputs: CalculationInputs, results: CalculationResults): StepByStepCalculation[] {
  const isSi = inputs.unitSystem === 'SI';
  const tempUnit = isSi ? '°C' : '°F';
  const qUnit = isSi ? 'kW' : 'BTU/h';

  const Thin = inputs.thin;
  const Thout = inputs.thout;
  const Tcin = inputs.tcin;
  const Tcout = inputs.tcout;

  return [
    {
      stepNumber: 1,
      titleAr: 'حساب الحمل الحراري للمائعين (Heat Duties Qh & Qc)',
      formulaTex: 'Q = \\dot{m} \\cdot C_p \\cdot \\Delta T',
      substitutionAr: `Q_h = ${inputs.mh} \\times ${results.hotFluidProps.cp} \\times (${Thin} - ${Thout}) = ${results.qHotKw} \\text{ ${qUnit}}`,
      resultAr: `Q_{design} = ${results.qDesignKw} ${qUnit}`,
      explanationAr: 'نعوض معدل التدفق الكتلي والحرارة النوعية وفارق درجات الحرارة لحساب الطاقة الحرارية المنقولة من المائع الساخن وإلى المائع البارد.'
    },
    {
      stepNumber: 2,
      titleAr: 'حساب فروق درجات الحرارة عند الأطراف (\\Delta T_1 & \\Delta T_2)',
      formulaTex: inputs.flowType === 'parallel'
        ? '\\Delta T_1 = T_{h,in} - T_{c,in}, \\quad \\Delta T_2 = T_{h,out} - T_{c,out}'
        : '\\Delta T_1 = T_{h,in} - T_{c,out}, \\quad \\Delta T_2 = T_{h,out} - T_{c,in}',
      substitutionAr: inputs.flowType === 'parallel'
        ? `\\Delta T_1 = ${Thin} - ${Tcin} = ${Thin - Tcin}${tempUnit}, \\quad \\Delta T_2 = ${Thout} - ${Tcout} = ${Thout - Tcout}${tempUnit}`
        : `\\Delta T_1 = ${Thin} - ${Tcout} = ${Thin - Tcout}${tempUnit}, \\quad \\Delta T_2 = ${Thout} - ${Tcin} = ${Thout - Tcin}${tempUnit}`,
      resultAr: `\\Delta T_1 = ${(Thin - Tcout).toFixed(1)}${tempUnit}, \\quad \\Delta T_2 = ${(Thout - Tcin).toFixed(1)}${tempUnit}`,
      explanationAr: 'في التدفق المتعاكس (Counter-flow)، يُقاس فارق الحرارة عند طرف الدخول الساخن مقابل الخروج البارد، وعند الخروج الساخن مقابل الدخول البارد.'
    },
    {
      stepNumber: 3,
      titleAr: 'حساب فرق درجات الحرارة اللوغاريتمي المتوسط (LMTD)',
      formulaTex: '\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}',
      substitutionAr: `\\Delta T_{lm} = \\frac{${(Thin - Tcout).toFixed(1)} - ${(Thout - Tcin).toFixed(1)}}{\\ln(${(Thin - Tcout).toFixed(1)} / ${(Thout - Tcin).toFixed(1)})}`,
      resultAr: `LMTD = ${results.lmtd} K`,
      explanationAr: 'يُمثّل LMTD المتوسط الهندسي المتكامل لدفع درجة الحرارة المحرك للانتقال الحراري عبر طول المبادل.'
    },
    {
      stepNumber: 4,
      titleAr: 'تطبيق عامل التصحيح F لحالة القشرة والأنبوب (Correction Factor F)',
      formulaTex: 'F = f(P, R), \\quad \\Delta T_{eff} = F \\cdot LMTD',
      substitutionAr: `F = ${results.correctionFactorF}, \\quad \\Delta T_{eff} = ${results.correctionFactorF} \\times ${results.lmtd}`,
      resultAr: `\\Delta T_{eff} = ${results.effectiveLmtd} K`,
      explanationAr: 'في مبادلات القشرة والأنبوب متعددة الممرات، لا يكون الجريان متعاكساً بالكامل 100%، لذا نضرب في عامل التصحيح F لتحصيل LMTD الفعّال.'
    },
    {
      stepNumber: 5,
      titleAr: 'حساب المساحة الحرارية المطلوبة (Required Area A)',
      formulaTex: 'A = \\frac{Q}{U \\cdot \\Delta T_{eff}}',
      substitutionAr: `A = \\frac{${results.qDesignKw} \\times 1000}{${inputs.uAssumed} \\times ${results.effectiveLmtd}}`,
      resultAr: `A_{req} = ${results.requiredAreaM2} ${isSi ? 'm²' : 'ft²'}`,
      explanationAr: 'يقسم إجمالي الطاقة الحرارية Q على حاصل ضرب معامل U في LMTD الفعّال لإيجاد مساحة السطح الحراري اللازمة للأنبوب أو اللوح.'
    },
    {
      stepNumber: 6,
      titleAr: 'حساب الفعالية وعدد وحدات الانتقال (\\varepsilon-NTU Method)',
      formulaTex: 'NTU = \\frac{U \\cdot A}{C_{min}}, \\quad \\varepsilon = \\frac{1 - e^{-NTU(1-C_r)}}{1 - C_r e^{-NTU(1-C_r)}}',
      substitutionAr: `NTU = \\frac{${inputs.uAssumed} \\times ${results.requiredAreaM2}}{${results.cminKwK} \\times 1000} = ${results.ntu}, \\quad C_r = ${results.capacityRatioCr}`,
      resultAr: `\\varepsilon = ${(results.effectivenessEps * 100).toFixed(1)}\\%`,
      explanationAr: 'توضح طريقة الفعالية NTU نسبة الحرارة المنقولة فعلياً مقارنة بالحد الأقصى النظري الممكن ديناميكياً.'
    }
  ];
}
