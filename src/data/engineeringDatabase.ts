import { MaterialProperty } from '../types';

export const engineeringMaterialsData: MaterialProperty[] = [
  // FLUIDS & LIQUIDS
  {
    id: 'water_liquid',
    nameAr: 'ماء سائل (Water Liquid 25°C)',
    nameEn: 'Water (Liquid, 25°C)',
    category: 'Fluids',
    density: 997,
    specificHeat: 4182,
    thermalConductivity: 0.607,
    viscosity: 0.00089,
    foulingFactor: 0.000176,
    descriptionAr: 'المائع الهندسي الأكثر استخداماً للتبريد والتسخين الصناعي.'
  },
  {
    id: 'engine_oil',
    nameAr: 'زيت المحركات (Engine Oil SAE 30)',
    nameEn: 'Engine Oil (SAE 30)',
    category: 'Fluids',
    density: 885,
    specificHeat: 1900,
    thermalConductivity: 0.145,
    viscosity: 0.29,
    foulingFactor: 0.0005,
    descriptionAr: 'زيت تزييت وتبريد صناعي ذو لزوجة عالية وموصلية حرارية منخفضة.'
  },
  {
    id: 'ethylene_glycol_50',
    nameAr: 'إيثيلين جليكول 50% (Ethylene Glycol)',
    nameEn: 'Ethylene Glycol (50% Solution)',
    category: 'Fluids',
    density: 1065,
    specificHeat: 3350,
    thermalConductivity: 0.38,
    viscosity: 0.0028,
    foulingFactor: 0.0003,
    descriptionAr: 'محلول مائي مضاد للتجمد مستخدم في أنظمة التبريد والتكييف HVAC.'
  },
  {
    id: 'ethanol_liquid',
    nameAr: 'إيثانول نقي (Ethanol Liquid)',
    nameEn: 'Ethanol (Pure Liquid)',
    category: 'Fluids',
    density: 789,
    specificHeat: 2440,
    thermalConductivity: 0.171,
    viscosity: 0.0012,
    descriptionAr: 'مذيب عضوي ومادة أولية كيميائية شائعة في عمليات التقطير.'
  },
  {
    id: 'benzene_liquid',
    nameAr: 'بنزين نقي (Benzene Liquid)',
    nameEn: 'Benzene (Liquid)',
    category: 'Fluids',
    density: 876,
    specificHeat: 1720,
    thermalConductivity: 0.144,
    viscosity: 0.00065,
    descriptionAr: 'مركب هيدروكربوني أروماتي مستخدم في البتروكيماويات.'
  },
  {
    id: 'acetone_liquid',
    nameAr: 'أسيتون (Acetone Liquid)',
    nameEn: 'Acetone',
    category: 'Fluids',
    density: 791,
    specificHeat: 2160,
    thermalConductivity: 0.18,
    viscosity: 0.00032,
    descriptionAr: 'مذيب عضوي متطاير سريع التبخير.'
  },

  // GASES
  {
    id: 'air_gas',
    nameAr: 'هواء (Air at 1 atm, 25°C)',
    nameEn: 'Air (1 atm, 25°C)',
    category: 'Gases',
    density: 1.184,
    specificHeat: 1007,
    thermalConductivity: 0.0262,
    viscosity: 0.0000184,
    descriptionAr: 'غاز التبريد والتجفيف الطبيعي الأساسي.'
  },
  {
    id: 'methane_gas',
    nameAr: 'غاز الميثان (Methane CH4)',
    nameEn: 'Methane (CH4)',
    category: 'Gases',
    density: 0.657,
    specificHeat: 2220,
    thermalConductivity: 0.034,
    viscosity: 0.000011,
    descriptionAr: 'المكون الرئيسي للغاز الطبيعي وقود الغلايات والتوربينات.'
  },
  {
    id: 'hydrogen_gas',
    nameAr: 'غاز الهيدروجين (Hydrogen H2)',
    nameEn: 'Hydrogen (H2)',
    category: 'Gases',
    density: 0.082,
    specificHeat: 14300,
    thermalConductivity: 0.182,
    viscosity: 0.0000089,
    descriptionAr: 'غاز خفيف جداً ذو موصلية حرارية وسعة حرارية عالية استثنائياً.'
  },
  {
    id: 'co2_gas',
    nameAr: 'ثاني أكسيد الكربون (CO2)',
    nameEn: 'Carbon Dioxide (CO2)',
    category: 'Gases',
    density: 1.798,
    specificHeat: 846,
    thermalConductivity: 0.0168,
    viscosity: 0.0000148,
    descriptionAr: 'غاز غازات الدفيئة ومائع تبريد فوق حرج.'
  },

  // REFRIGERANTS
  {
    id: 'ammonia_r717',
    nameAr: 'أمونيا (Ammonia R-717)',
    nameEn: 'Ammonia (R-717)',
    category: 'Refrigerants',
    density: 610,
    specificHeat: 4700,
    thermalConductivity: 0.52,
    viscosity: 0.00015,
    descriptionAr: 'وسيط تبريد صناعي ممتاز في مخازن التبريد والمصانع.'
  },
  {
    id: 'r134a',
    nameAr: 'وسيط التبريد (R-134a)',
    nameEn: 'Refrigerant R-134a',
    category: 'Refrigerants',
    density: 1206,
    specificHeat: 1420,
    thermalConductivity: 0.082,
    viscosity: 0.0002,
    descriptionAr: 'وسيط تبريد في المكيفات ومبردات السيارات.'
  },

  // METALS (TUBE & WALL MATERIALS)
  {
    id: 'copper_pure',
    nameAr: 'نحاس أحمر نقي (Copper Pure)',
    nameEn: 'Pure Copper',
    category: 'Metals',
    density: 8960,
    specificHeat: 385,
    thermalConductivity: 401,
    emissivity: 0.03,
    roughnessMm: 0.0015,
    descriptionAr: 'أعلى موصلية حرارية للأنابيب والمبادلات الحرارية.'
  },
  {
    id: 'aluminum_6061',
    nameAr: 'ألومنيوم (Aluminum 6061)',
    nameEn: 'Aluminum 6061',
    category: 'Metals',
    density: 2700,
    specificHeat: 897,
    thermalConductivity: 205,
    emissivity: 0.09,
    roughnessMm: 0.0015,
    descriptionAr: 'معدن خفيف الوزن عالي الموصلية لمبادلات السيارات والمشعاعات.'
  },
  {
    id: 'stainless_steel_316',
    nameAr: 'صلب مقاوم للصدأ (Stainless Steel 316)',
    nameEn: 'Stainless Steel 316',
    category: 'Metals',
    density: 8000,
    specificHeat: 500,
    thermalConductivity: 16.3,
    emissivity: 0.28,
    roughnessMm: 0.002,
    descriptionAr: 'مقاوم عالي للتآكل والأحماض، مستخدم في الصناعات الصيدلانية والغذائية.'
  },
  {
    id: 'carbon_steel',
    nameAr: 'حديد صلب كربوني (Carbon Steel)',
    nameEn: 'Carbon Steel',
    category: 'Metals',
    density: 7850,
    specificHeat: 465,
    thermalConductivity: 54,
    emissivity: 0.8,
    roughnessMm: 0.045,
    descriptionAr: 'المعدن الأساسي الاقتصادي في غلاف وأنابيب مصافي النفط.'
  },
  {
    id: 'titanium_gr2',
    nameAr: 'تيتانيوم (Titanium Grade 2)',
    nameEn: 'Titanium Grade 2',
    category: 'Metals',
    density: 4510,
    specificHeat: 522,
    thermalConductivity: 21.9,
    emissivity: 0.3,
    roughnessMm: 0.0015,
    descriptionAr: 'مقاومة مطلقة لتآكل مياه البحر والتطبيقات البحرية.'
  },

  // INSULATION & PIPES
  {
    id: 'glass_wool',
    nameAr: 'صوف زجاجي عازل (Glass Wool Insulation)',
    nameEn: 'Glass Wool',
    category: 'Insulation',
    density: 24,
    specificHeat: 835,
    thermalConductivity: 0.038,
    descriptionAr: 'عازل حراري ممتاز لمنع مفقودات الحرارة في الأنابيب والغلايات.'
  },
  {
    id: 'polyurethane_foam',
    nameAr: 'فوم بولي يوريثان (Polyurethane Foam)',
    nameEn: 'Polyurethane Rigid Foam',
    category: 'Insulation',
    density: 30,
    specificHeat: 1400,
    thermalConductivity: 0.024,
    descriptionAr: 'أدنى موصلية حرارية لعزل خطوط الأنابيب فائقة البرودة (Cryogenic).'
  },
  {
    id: 'pvc_pipe',
    nameAr: 'أنابيب بلاستيك PVC',
    nameEn: 'PVC Pipe',
    category: 'Pipes',
    density: 1380,
    specificHeat: 1000,
    thermalConductivity: 0.19,
    roughnessMm: 0.0015,
    descriptionAr: 'أنابيب بلاستيكية لنقل المياه والسوائل غير الحارة.'
  }
];
