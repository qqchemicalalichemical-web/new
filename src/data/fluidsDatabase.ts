import { FluidDefinition, FluidPropertyPoint } from '../types';

export const fluidsDatabase: FluidDefinition[] = [
  {
    id: 'water',
    nameAr: 'ماء نقي (Water)',
    nameEn: 'Water',
    category: 'water_steam',
    description: 'الماء المائع الأكثر استخدامًا في المبادلات الحرارية المائية والتبريد.',
    points: [
      { tempC: 0, rho: 999.8, cp: 4217, k: 0.561, mu: 0.001792, pr: 13.5 },
      { tempC: 20, rho: 998.2, cp: 4182, k: 0.598, mu: 0.001002, pr: 7.01 },
      { tempC: 40, rho: 992.2, cp: 4179, k: 0.631, mu: 0.000653, pr: 4.32 },
      { tempC: 60, rho: 983.2, cp: 4185, k: 0.654, mu: 0.000467, pr: 2.99 },
      { tempC: 80, rho: 971.8, cp: 4197, k: 0.670, mu: 0.000355, pr: 2.22 },
      { tempC: 100, rho: 958.4, cp: 4216, k: 0.679, mu: 0.000282, pr: 1.75 },
      { tempC: 120, rho: 943.1, cp: 4244, k: 0.683, mu: 0.000230, pr: 1.43 }
    ]
  },
  {
    id: 'engine_oil_sae30',
    nameAr: 'زيت محرك SAE 30',
    nameEn: 'Engine Oil SAE 30',
    category: 'oils',
    description: 'زيت تشحيم عالي اللزوجة يتأثر بقوة بدرجة الحرارة.',
    points: [
      { tempC: 0, rho: 899, cp: 1796, k: 0.147, mu: 3.85, pr: 47100 },
      { tempC: 20, rho: 888, cp: 1880, k: 0.145, mu: 0.80, pr: 10400 },
      { tempC: 40, rho: 876, cp: 1964, k: 0.144, mu: 0.21, pr: 2870 },
      { tempC: 60, rho: 864, cp: 2048, k: 0.140, mu: 0.075, pr: 1050 },
      { tempC: 80, rho: 852, cp: 2132, k: 0.138, mu: 0.032, pr: 490 },
      { tempC: 100, rho: 840, cp: 2219, k: 0.137, mu: 0.017, pr: 275 },
      { tempC: 120, rho: 828, cp: 2307, k: 0.135, mu: 0.010, pr: 170 }
    ]
  },
  {
    id: 'air',
    nameAr: 'هواء (Air at 1 atm)',
    nameEn: 'Air (1 atm)',
    category: 'gases',
    description: 'غاز هواء جوي قياسي يُستخدم كوسط تبريد بالهواء (Air Coolers).',
    points: [
      { tempC: 0, rho: 1.293, cp: 1005, k: 0.0243, mu: 0.0000172, pr: 0.715 },
      { tempC: 20, rho: 1.204, cp: 1007, k: 0.0257, mu: 0.0000181, pr: 0.709 },
      { tempC: 40, rho: 1.127, cp: 1008, k: 0.0271, mu: 0.0000191, pr: 0.708 },
      { tempC: 60, rho: 1.059, cp: 1009, k: 0.0285, mu: 0.0000200, pr: 0.707 },
      { tempC: 80, rho: 0.999, cp: 1010, k: 0.0299, mu: 0.0000209, pr: 0.706 },
      { tempC: 100, rho: 0.946, cp: 1011, k: 0.0313, mu: 0.0000218, pr: 0.703 }
    ]
  },
  {
    id: 'ethylene_glycol_50',
    nameAr: 'إيثيلين غليكول 50% مائي (Ethylene Glycol 50%)',
    nameEn: 'Ethylene Glycol (50%)',
    category: 'glycols',
    description: 'محلول مانع للتجمد شائع في أنظمة التكييف HVAC والتبريد الصناعي.',
    points: [
      { tempC: -10, rho: 1079, cp: 3260, k: 0.380, mu: 0.00950, pr: 81.4 },
      { tempC: 10, rho: 1072, cp: 3320, k: 0.392, mu: 0.00480, pr: 40.6 },
      { tempC: 30, rho: 1062, cp: 3380, k: 0.402, mu: 0.00270, pr: 22.7 },
      { tempC: 50, rho: 1050, cp: 3450, k: 0.412, mu: 0.00170, pr: 14.2 },
      { tempC: 70, rho: 1037, cp: 3520, k: 0.420, mu: 0.00115, pr: 9.63 },
      { tempC: 90, rho: 1022, cp: 3600, k: 0.428, mu: 0.00082, pr: 6.90 }
    ]
  },
  {
    id: 'propylene_glycol_50',
    nameAr: 'بروبيلين غليكول 50% (Propylene Glycol)',
    nameEn: 'Propylene Glycol (50%)',
    category: 'glycols',
    description: 'سائل تبريد غير سام شائع في الصناعات الغذائية والدوائية.',
    points: [
      { tempC: 0, rho: 1052, cp: 3410, k: 0.360, mu: 0.0150, pr: 142.0 },
      { tempC: 20, rho: 1042, cp: 3490, k: 0.370, mu: 0.0065, pr: 61.3 },
      { tempC: 40, rho: 1030, cp: 3570, k: 0.380, mu: 0.0033, pr: 31.0 },
      { tempC: 60, rho: 1017, cp: 3660, k: 0.388, mu: 0.0019, pr: 17.9 },
      { tempC: 80, rho: 1002, cp: 3750, k: 0.395, mu: 0.0012, pr: 11.4 }
    ]
  },
  {
    id: 'steam_saturated',
    nameAr: 'بخار مشبع (Saturated Steam 1 atm)',
    nameEn: 'Saturated Steam',
    category: 'water_steam',
    description: 'وسيط تسخين عالي الكفاءة يُستخدم في المبادلات الحرارية البخارية (Reboilers).',
    points: [
      { tempC: 100, rho: 0.598, cp: 2077, k: 0.0248, mu: 0.0000121, pr: 1.01 },
      { tempC: 120, rho: 1.121, cp: 2130, k: 0.0264, mu: 0.0000129, pr: 1.04 },
      { tempC: 140, rho: 1.966, cp: 2200, k: 0.0282, mu: 0.0000137, pr: 1.07 },
      { tempC: 160, rho: 3.259, cp: 2310, k: 0.0302, mu: 0.0000145, pr: 1.11 },
      { tempC: 180, rho: 5.158, cp: 2470, k: 0.0326, mu: 0.0000153, pr: 1.16 }
    ]
  },
  {
    id: 'ammonia_liquid',
    nameAr: 'أمونيا سائلة (Liquid Ammonia)',
    nameEn: 'Liquid Ammonia',
    category: 'refrigerants',
    description: 'وسيط تبريد صناعي ممتاز تمتاز بسعة حرارية عالية جداً.',
    points: [
      { tempC: -20, rho: 665, cp: 4520, k: 0.547, mu: 0.000255, pr: 2.11 },
      { tempC: 0, rho: 638, cp: 4660, k: 0.515, mu: 0.000195, pr: 1.76 },
      { tempC: 20, rho: 610, cp: 4800, k: 0.480, mu: 0.000152, pr: 1.52 },
      { tempC: 40, rho: 579, cp: 5080, k: 0.442, mu: 0.000121, pr: 1.39 }
    ]
  },
  {
    id: 'r134a_liquid',
    nameAr: 'وسيط تبريد R134a سائل',
    nameEn: 'R134a Liquid',
    category: 'refrigerants',
    description: 'غاز فريون شائع في التكييف ومضخات الحرارة والتبريد التجاري.',
    points: [
      { tempC: -10, rho: 1327, cp: 1340, k: 0.092, mu: 0.000270, pr: 3.93 },
      { tempC: 10, rho: 1261, cp: 1400, k: 0.086, mu: 0.000210, pr: 3.42 },
      { tempC: 30, rho: 1188, cp: 1470, k: 0.079, mu: 0.000170, pr: 3.16 },
      { tempC: 50, rho: 1102, cp: 1580, k: 0.071, mu: 0.000135, pr: 3.00 }
    ]
  },
  {
    id: 'therminol_66',
    nameAr: 'زيت نقل الحرارة (Therminol 66)',
    nameEn: 'Therminol 66',
    category: 'oils',
    description: 'سائل نقل حراري صناعي ممتاز للعمليات عالية الحرارة حتى 345°C دون ضغط مرتفع.',
    points: [
      { tempC: 20, rho: 1008, cp: 1570, k: 0.118, mu: 0.0600, pr: 799 },
      { tempC: 100, rho: 955, cp: 1840, k: 0.112, mu: 0.0035, pr: 57.4 },
      { tempC: 200, rho: 885, cp: 2180, k: 0.102, mu: 0.0008, pr: 17.1 },
      { tempC: 300, rho: 808, cp: 2520, k: 0.091, mu: 0.0003, pr: 8.31 }
    ]
  },
  {
    id: 'ethanol',
    nameAr: 'إيثانول نقي (Ethanol)',
    nameEn: 'Ethanol',
    category: 'custom',
    description: 'كحول إيثيلي مستخدم في الصناعات الكيميائية والصيدلانية.',
    points: [
      { tempC: 0, rho: 806, cp: 2330, k: 0.177, mu: 0.00177, pr: 23.3 },
      { tempC: 20, rho: 789, cp: 2440, k: 0.171, mu: 0.00120, pr: 17.1 },
      { tempC: 40, rho: 772, cp: 2570, k: 0.166, mu: 0.00083, pr: 12.9 },
      { tempC: 60, rho: 754, cp: 2730, k: 0.160, mu: 0.00059, pr: 10.1 }
    ]
  },
  {
    id: 'crude_oil_medium',
    nameAr: 'نفط خام متوسط (Crude Oil 30 API)',
    nameEn: 'Medium Crude Oil',
    category: 'oils',
    description: 'نفط خام لمصفاة التكرير بمحتوى أسفلت متوسط وتلوث عالي.',
    points: [
      { tempC: 15, rho: 875, cp: 1880, k: 0.133, mu: 0.0180, pr: 254 },
      { tempC: 50, rho: 852, cp: 2010, k: 0.130, mu: 0.0055, pr: 85.0 },
      { tempC: 100, rho: 818, cp: 2210, k: 0.125, mu: 0.0018, pr: 31.8 },
      { tempC: 150, rho: 782, cp: 2420, k: 0.119, mu: 0.0009, pr: 18.3 },
      { tempC: 200, rho: 745, cp: 2650, k: 0.113, mu: 0.0005, pr: 11.7 }
    ]
  },
  {
    id: 'seawater',
    nameAr: 'ماء البحر (Sea Water 3.5%)',
    nameEn: 'Sea Water (3.5%)',
    category: 'water_steam',
    description: 'مائع مالح يُستخدم في محطات التحلية والتبريد البحري، ويتطلب مقاومة تآكل.',
    points: [
      { tempC: 0, rho: 1028, cp: 4005, k: 0.560, mu: 0.00188, pr: 13.4 },
      { tempC: 20, rho: 1025, cp: 4000, k: 0.596, mu: 0.00108, pr: 7.25 },
      { tempC: 40, rho: 1018, cp: 4002, k: 0.627, mu: 0.00070, pr: 4.46 },
      { tempC: 60, rho: 1009, cp: 4010, k: 0.648, mu: 0.00050, pr: 3.10 },
      { tempC: 80, rho: 997, cp: 4022, k: 0.662, mu: 0.00038, pr: 2.31 }
    ]
  },
  {
    id: 'milk_whole',
    nameAr: 'حليب كامل الدسم (Whole Milk)',
    nameEn: 'Whole Milk',
    category: 'custom',
    description: 'مائع غذائي حساس للحرارة يُستخدم في وحدات البسترة والتعقيم.',
    points: [
      { tempC: 5, rho: 1035, cp: 3930, k: 0.530, mu: 0.00280, pr: 20.7 },
      { tempC: 20, rho: 1030, cp: 3930, k: 0.550, mu: 0.00180, pr: 12.8 },
      { tempC: 50, rho: 1018, cp: 3950, k: 0.580, mu: 0.00095, pr: 6.47 },
      { tempC: 72, rho: 1008, cp: 3970, k: 0.600, mu: 0.00065, pr: 4.30 }
    ]
  },
  {
    id: 'benzene',
    nameAr: 'بنزين نقي (Benzene Liquid)',
    nameEn: 'Liquid Benzene',
    category: 'custom',
    description: 'مذيب هيدروكربوني أروماتي شائع في الصناعات البتروكيميائية.',
    points: [
      { tempC: 10, rho: 889, cp: 1680, k: 0.147, mu: 0.00076, pr: 8.68 },
      { tempC: 30, rho: 868, cp: 1750, k: 0.143, mu: 0.00056, pr: 6.85 },
      { tempC: 50, rho: 846, cp: 1830, k: 0.138, mu: 0.00043, pr: 5.70 },
      { tempC: 70, rho: 823, cp: 1920, k: 0.133, mu: 0.00034, pr: 4.91 }
    ]
  },
  {
    id: 'nitrogen_gas',
    nameAr: 'غاز النيتروجين (Nitrogen Gas 1 atm)',
    nameEn: 'Nitrogen Gas',
    category: 'gases',
    description: 'غاز خامل يُستخدم في عمليات البتروكيماويات والتبريد العميق.',
    points: [
      { tempC: -50, rho: 1.530, cp: 1042, k: 0.0198, mu: 0.0000147, pr: 0.773 },
      { tempC: 0, rho: 1.250, cp: 1039, k: 0.0240, mu: 0.0000166, pr: 0.718 },
      { tempC: 50, rho: 1.056, cp: 1040, k: 0.0275, mu: 0.0000187, pr: 0.707 },
      { tempC: 100, rho: 0.915, cp: 1042, k: 0.0308, mu: 0.0000206, pr: 0.697 }
    ]
  }
];

// Linear / Polynomial Property Interpolator based on temperature
export function getFluidPropertiesAtTemp(fluidId: string, tempC: number): FluidPropertyPoint {
  const fluid = fluidsDatabase.find(f => f.id === fluidId) || fluidsDatabase[0];
  const pts = fluid.points;

  // Clamp if out of bounds
  if (tempC <= pts[0].tempC) return { ...pts[0] };
  if (tempC >= pts[pts.length - 1].tempC) return { ...pts[pts.length - 1] };

  // Find segment
  let idx = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    if (tempC >= pts[i].tempC && tempC <= pts[i + 1].tempC) {
      idx = i;
      break;
    }
  }

  const p1 = pts[idx];
  const p2 = pts[idx + 1];
  const frac = (tempC - p1.tempC) / (p2.tempC - p1.tempC);

  const lerp = (v1: number, v2: number) => v1 + frac * (v2 - v1);

  const rho = lerp(p1.rho, p2.rho);
  const cp = lerp(p1.cp, p2.cp);
  const k = lerp(p1.k, p2.k);

  // Viscosity uses log-linear interpolation for realistic fluid behavior
  const logMu1 = Math.log(p1.mu);
  const logMu2 = Math.log(p2.mu);
  const mu = Math.exp(logMu1 + frac * (logMu2 - logMu1));

  const pr = (cp * mu) / k;

  return {
    tempC,
    rho: Number(rho.toFixed(2)),
    cp: Number(cp.toFixed(1)),
    k: Number(k.toFixed(4)),
    mu: Number(mu.toFixed(7)),
    pr: Number(pr.toFixed(2))
  };
}
