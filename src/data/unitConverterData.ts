import { UnitCategory } from '../types';

export interface UnitDefinition {
  nameAr: string;
  nameEn: string;
  symbol: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface CategoryUnits {
  category: UnitCategory;
  nameAr: string;
  nameEn: string;
  baseUnit: string;
  units: UnitDefinition[];
}

export const unitCategoriesData: CategoryUnits[] = [
  {
    category: 'Length',
    nameAr: 'الطول (Length)',
    nameEn: 'Length',
    baseUnit: 'm',
    units: [
      { nameAr: 'متر', nameEn: 'Meter', symbol: 'm', toBase: v => v, fromBase: v => v },
      { nameAr: 'كيلومتر', nameEn: 'Kilometer', symbol: 'km', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'سنتيمتر', nameEn: 'Centimeter', symbol: 'cm', toBase: v => v * 0.01, fromBase: v => v * 100 },
      { nameAr: 'مليمتر', nameEn: 'Millimeter', symbol: 'mm', toBase: v => v * 0.001, fromBase: v => v * 1000 },
      { nameAr: 'ميكرومتر', nameEn: 'Micrometer', symbol: 'µm', toBase: v => v * 1e-6, fromBase: v => v * 1e6 },
      { nameAr: 'قدم', nameEn: 'Foot', symbol: 'ft', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      { nameAr: 'بوصة / إنش', nameEn: 'Inch', symbol: 'in', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      { nameAr: 'ميل', nameEn: 'Mile', symbol: 'mi', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 }
    ]
  },
  {
    category: 'Area',
    nameAr: 'المساحة (Area)',
    nameEn: 'Area',
    baseUnit: 'm²',
    units: [
      { nameAr: 'متر مربع', nameEn: 'Square Meter', symbol: 'm²', toBase: v => v, fromBase: v => v },
      { nameAr: 'سنتيمتر مربع', nameEn: 'Square Centimeter', symbol: 'cm²', toBase: v => v * 1e-4, fromBase: v => v * 1e4 },
      { nameAr: 'مليمتر مربع', nameEn: 'Square Millimeter', symbol: 'mm²', toBase: v => v * 1e-6, fromBase: v => v * 1e6 },
      { nameAr: 'قدم مربع', nameEn: 'Square Feet', symbol: 'ft²', toBase: v => v * 0.092903, fromBase: v => v / 0.092903 },
      { nameAr: 'بوصة مربعة', nameEn: 'Square Inch', symbol: 'in²', toBase: v => v * 0.00064516, fromBase: v => v / 0.00064516 },
      { nameAr: 'هكتار', nameEn: 'Hectare', symbol: 'ha', toBase: v => v * 10000, fromBase: v => v / 10000 }
    ]
  },
  {
    category: 'Volume',
    nameAr: 'الحجم (Volume)',
    nameEn: 'Volume',
    baseUnit: 'm³',
    units: [
      { nameAr: 'متر مكعب', nameEn: 'Cubic Meter', symbol: 'm³', toBase: v => v, fromBase: v => v },
      { nameAr: 'لتر', nameEn: 'Liter', symbol: 'L', toBase: v => v * 0.001, fromBase: v => v * 1000 },
      { nameAr: 'مليلتر / سم³', nameEn: 'Milliliter', symbol: 'mL', toBase: v => v * 1e-6, fromBase: v => v * 1e6 },
      { nameAr: 'قدم مكعب', nameEn: 'Cubic Feet', symbol: 'ft³', toBase: v => v * 0.0283168, fromBase: v => v / 0.0283168 },
      { nameAr: 'جالون أمريكي', nameEn: 'US Gallon', symbol: 'gal', toBase: v => v * 0.00378541, fromBase: v => v / 0.00378541 },
      { nameAr: 'برميل نفط', nameEn: 'Oil Barrel', symbol: 'bbl', toBase: v => v * 0.158987, fromBase: v => v / 0.158987 }
    ]
  },
  {
    category: 'Mass',
    nameAr: 'الكتلة (Mass)',
    nameEn: 'Mass',
    baseUnit: 'kg',
    units: [
      { nameAr: 'كيلوجرام', nameEn: 'Kilogram', symbol: 'kg', toBase: v => v, fromBase: v => v },
      { nameAr: 'جرام', nameEn: 'Gram', symbol: 'g', toBase: v => v * 0.001, fromBase: v => v * 1000 },
      { nameAr: 'طن متري', nameEn: 'Metric Ton', symbol: 'tonne', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'باوند / رطل', nameEn: 'Pound', symbol: 'lb', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
      { nameAr: 'أونصة', nameEn: 'Ounce', symbol: 'oz', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 }
    ]
  },
  {
    category: 'Density',
    nameAr: 'الكثافة (Density)',
    nameEn: 'Density',
    baseUnit: 'kg/m³',
    units: [
      { nameAr: 'كيلوجرام / متر مكعب', nameEn: 'kg/m³', symbol: 'kg/m³', toBase: v => v, fromBase: v => v },
      { nameAr: 'جرام / سم مكعب', nameEn: 'g/cm³', symbol: 'g/cm³', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'باوند / قدم مكعب', nameEn: 'lb/ft³', symbol: 'lb/ft³', toBase: v => v * 16.0185, fromBase: v => v / 16.0185 }
    ]
  },
  {
    category: 'Pressure',
    nameAr: 'الضغط (Pressure)',
    nameEn: 'Pressure',
    baseUnit: 'Pa',
    units: [
      { nameAr: 'باسكال', nameEn: 'Pascal', symbol: 'Pa', toBase: v => v, fromBase: v => v },
      { nameAr: 'كيلوباسكال', nameEn: 'Kilopascal', symbol: 'kPa', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'ميجاباسكال', nameEn: 'Megapascal', symbol: 'MPa', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { nameAr: 'بار', nameEn: 'Bar', symbol: 'bar', toBase: v => v * 100000, fromBase: v => v / 100000 },
      { nameAr: 'ضغط جوي قياسي', nameEn: 'Atmosphere', symbol: 'atm', toBase: v => v * 101325, fromBase: v => v / 101325 },
      { nameAr: 'باوند / بوصة مربعة', nameEn: 'Psi', symbol: 'psi', toBase: v => v * 6894.76, fromBase: v => v / 6894.76 },
      { nameAr: 'مليمتر زئبق (طور)', nameEn: 'mmHg', symbol: 'mmHg', toBase: v => v * 133.322, fromBase: v => v / 133.322 }
    ]
  },
  {
    category: 'Temperature',
    nameAr: 'درجة الحرارة (Temperature)',
    nameEn: 'Temperature',
    baseUnit: 'C',
    units: [
      { nameAr: 'سيليزيوس', nameEn: 'Celsius', symbol: '°C', toBase: v => v, fromBase: v => v },
      { nameAr: 'فهرنهايت', nameEn: 'Fahrenheit', symbol: '°F', toBase: v => (v - 32) / 1.8, fromBase: v => v * 1.8 + 32 },
      { nameAr: 'كلفن', nameEn: 'Kelvin', symbol: 'K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
      { nameAr: 'رانكين', nameEn: 'Rankine', symbol: '°R', toBase: v => (v - 491.67) / 1.8, fromBase: v => (v + 273.15) * 1.8 }
    ]
  },
  {
    category: 'Energy',
    nameAr: 'الطاقة والحرارة (Energy)',
    nameEn: 'Energy',
    baseUnit: 'J',
    units: [
      { nameAr: 'جول', nameEn: 'Joule', symbol: 'J', toBase: v => v, fromBase: v => v },
      { nameAr: 'كيلوجول', nameEn: 'Kilojoule', symbol: 'kJ', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'ميجاجول', nameEn: 'Megajoule', symbol: 'MJ', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { nameAr: 'سعرة حرارية', nameEn: 'Calorie', symbol: 'cal', toBase: v => v * 4.184, fromBase: v => v / 4.184 },
      { nameAr: 'كيلوسعرة', nameEn: 'Kilocalorie', symbol: 'kcal', toBase: v => v * 4184, fromBase: v => v / 4184 },
      { nameAr: 'وحدة حرارية بريطانية', nameEn: 'BTU', symbol: 'BTU', toBase: v => v * 1055.06, fromBase: v => v / 1055.06 },
      { nameAr: 'كيلوواط ساعة', nameEn: 'kWh', symbol: 'kWh', toBase: v => v * 3.6e6, fromBase: v => v / 3.6e6 }
    ]
  },
  {
    category: 'Power',
    nameAr: 'القدرة ومعدل التدفق الحراري (Power)',
    nameEn: 'Power',
    baseUnit: 'W',
    units: [
      { nameAr: 'واط', nameEn: 'Watt', symbol: 'W', toBase: v => v, fromBase: v => v },
      { nameAr: 'كيلوواط', nameEn: 'Kilowatt', symbol: 'kW', toBase: v => v * 1000, fromBase: v => v / 1000 },
      { nameAr: 'ميجاط', nameEn: 'Megawatt', symbol: 'MW', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
      { nameAr: 'حصان ميكانيكي', nameEn: 'Horsepower', symbol: 'hp', toBase: v => v * 745.7, fromBase: v => v / 745.7 },
      { nameAr: 'BTU / ساعة', nameEn: 'BTU/hr', symbol: 'BTU/h', toBase: v => v * 0.293071, fromBase: v => v / 0.293071 },
      { nameAr: 'طن تبريد', nameEn: 'Refrigeration Ton', symbol: 'TR', toBase: v => v * 3516.85, fromBase: v => v / 3516.85 }
    ]
  },
  {
    category: 'Heat Transfer Coefficient',
    nameAr: 'معامل الانتقال الحراري الكلي (Overall U)',
    nameEn: 'Overall U',
    baseUnit: 'W/m²·K',
    units: [
      { nameAr: 'W / (m²·K)', nameEn: 'W/m²K', symbol: 'W/m²K', toBase: v => v, fromBase: v => v },
      { nameAr: 'BTU / (h·ft²·°F)', nameEn: 'BTU/h.ft².°F', symbol: 'BTU/h·ft²·°F', toBase: v => v * 5.67826, fromBase: v => v / 5.67826 },
      { nameAr: 'kcal / (h·m²·°C)', nameEn: 'kcal/h.m².°C', symbol: 'kcal/h·m²·°C', toBase: v => v * 1.163, fromBase: v => v / 1.163 }
    ]
  },
  {
    category: 'Thermal Conductivity',
    nameAr: 'الموصلية الحرارية (Thermal Conductivity k)',
    nameEn: 'Thermal Conductivity',
    baseUnit: 'W/m·K',
    units: [
      { nameAr: 'W / (m·K)', nameEn: 'W/m.K', symbol: 'W/m·K', toBase: v => v, fromBase: v => v },
      { nameAr: 'BTU / (h·ft·°F)', nameEn: 'BTU/h.ft.°F', symbol: 'BTU/h·ft·°F', toBase: v => v * 1.73073, fromBase: v => v / 1.73073 },
      { nameAr: 'cal / (s·cm·°C)', nameEn: 'cal/s.cm.°C', symbol: 'cal/s·cm·°C', toBase: v => v * 418.4, fromBase: v => v / 418.4 }
    ]
  },
  {
    category: 'Viscosity',
    nameAr: 'اللزوجة الديناميكية (Dynamic Viscosity)',
    nameEn: 'Viscosity',
    baseUnit: 'Pa·s',
    units: [
      { nameAr: 'باسكال · ثانية (N·s/m²)', nameEn: 'Pa.s', symbol: 'Pa·s', toBase: v => v, fromBase: v => v },
      { nameAr: 'سنتي بواز (cP / mPa·s)', nameEn: 'Centipoise', symbol: 'cP', toBase: v => v * 0.001, fromBase: v => v * 1000 },
      { nameAr: 'بواز', nameEn: 'Poise', symbol: 'P', toBase: v => v * 0.1, fromBase: v => v * 10 },
      { nameAr: 'باوند / (قدم · ثانية)', nameEn: 'lb/ft.s', symbol: 'lb/ft·s', toBase: v => v * 1.48816, fromBase: v => v / 1.48816 }
    ]
  },
  {
    category: 'Fouling Factor',
    nameAr: 'معامل الاتساخ (Fouling Factor Rd)',
    nameEn: 'Fouling Factor',
    baseUnit: 'm²·K/W',
    units: [
      { nameAr: 'm²·K / W', nameEn: 'm²K/W', symbol: 'm²·K/W', toBase: v => v, fromBase: v => v },
      { nameAr: 'h·ft²·°F / BTU', nameEn: 'hr.ft².°F/BTU', symbol: 'h·ft²·°F/BTU', toBase: v => v * 0.17611, fromBase: v => v / 0.17611 }
    ]
  },
  {
    category: 'Mass Flow',
    nameAr: 'معدل التدفق الكتلي (Mass Flow Rate)',
    nameEn: 'Mass Flow',
    baseUnit: 'kg/s',
    units: [
      { nameAr: 'كيلوجرام / ثانية', nameEn: 'kg/s', symbol: 'kg/s', toBase: v => v, fromBase: v => v },
      { nameAr: 'كيلوجرام / ساعة', nameEn: 'kg/h', symbol: 'kg/h', toBase: v => v / 3600, fromBase: v => v * 3600 },
      { nameAr: 'باوند / ساعة', nameEn: 'lb/h', symbol: 'lb/h', toBase: v => v * 0.000125998, fromBase: v => v / 0.000125998 },
      { nameAr: 'طن / ساعة', nameEn: 'tonne/h', symbol: 't/h', toBase: v => v * 0.277778, fromBase: v => v / 0.277778 }
    ]
  },
  {
    category: 'Volume Flow',
    nameAr: 'معدل التدفق الحجمي (Volume Flow Rate)',
    nameEn: 'Volume Flow',
    baseUnit: 'm³/s',
    units: [
      { nameAr: 'متر مكعب / ثانية', nameEn: 'm³/s', symbol: 'm³/s', toBase: v => v, fromBase: v => v },
      { nameAr: 'متر مكعب / ساعة', nameEn: 'm³/h', symbol: 'm³/h', toBase: v => v / 3600, fromBase: v => v * 3600 },
      { nameAr: 'لتر / دقيقة', nameEn: 'L/min (GPM-equiv)', symbol: 'L/min', toBase: v => v * 1.66667e-5, fromBase: v => v * 60000 },
      { nameAr: 'جالون / دقيقة (GPM)', nameEn: 'GPM', symbol: 'GPM', toBase: v => v * 6.30902e-5, fromBase: v => v / 6.30902e-5 },
      { nameAr: 'قدم مكعب / دقيقة (CFM)', nameEn: 'CFM', symbol: 'CFM', toBase: v => v * 0.000471947, fromBase: v => v / 0.000471947 }
    ]
  }
];
