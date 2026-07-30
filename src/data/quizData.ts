export interface QuizItem {
  id: string;
  category: string;
  questionAr: string;
  questionEn: string;
  questionDe: string;
  optionsAr: string[];
  optionsEn: string[];
  optionsDe: string[];
  correctIndex: number;
  explanationAr: string;
  explanationEn: string;
  explanationDe: string;
}

export const quizQuestions: QuizItem[] = [
  {
    id: 'q1',
    category: 'Distillation',
    questionAr: 'في مخطط ماكيب-ثيلي (McCabe-Thiele)، ما الذي يمثله خط التغذية q-line عندما يكون السائل عند درجة الغليان المشبعة (Saturated Liquid)؟',
    questionEn: 'In a McCabe-Thiele diagram, what is the slope of the q-line for a saturated liquid feed?',
    questionDe: 'Was ist die Steigung der q-Linie für einen gesättigten flüssigen Zulauf im McCabe-Thiele-Diagramm?',
    optionsAr: ['عمودي تماماً (مائل بـ ∞)', 'أفقي تماماً (مائل بـ 0)', 'مائل بـ -1', 'مائل بـ +1'],
    optionsEn: ['Vertical (slope = ∞)', 'Horizontal (slope = 0)', 'Slope = -1', 'Slope = +1'],
    optionsDe: ['Vertikal (Steigung = ∞)', 'Horizontal (Steigung = 0)', 'Steigung = -1', 'Steigung = +1'],
    correctIndex: 0,
    explanationAr: 'عندما تكون التغذية سائلاً مشبعاً فإن قيمة q = 1، وبالتالي ميل خط التغذية q/(q-1) يساوي (1/0) وهو خط عمودي تماماً.',
    explanationEn: 'For a saturated liquid feed, q = 1. The slope of the q-line is q/(q-1) = 1/0, which results in a vertical line.',
    explanationDe: 'Für einen gesättigten flüssigen Zulauf ist q = 1. Die Steigung der q-Linie ist q/(q-1) = 1/0, was zu einer vertikalen Linie führt.'
  },
  {
    id: 'q2',
    category: 'Heat Exchanger',
    questionAr: 'متى يكون معامل تصحيح درجة الحرارة اللوغاريتمية F = 1.0 في المبادلات الحرارية؟',
    questionEn: 'When does the LMTD correction factor F equal 1.0?',
    questionDe: 'Wann ist der LMTD-Korrekturfaktor F gleich 1,0?',
    optionsAr: [
      'في جريان التيار المباشر والمتعاكس الصافي (True Counter-current or Co-current 1-1)',
      'في المبادلات متعددة الأنابيب والغلاف (Shell and Tube 1-2)',
      'عند وجود غليان متكثف فقط',
      'في حالة الجريان المتصالب (Cross-flow) فقط'
    ],
    optionsEn: [
      'In pure counter-current or co-current single-pass (1-1 exchanger)',
      'In shell and tube multi-pass (1-2 exchanger)',
      'Only when condensation boiling occurs',
      'In pure cross-flow exchangers'
    ],
    optionsDe: [
      'Bei reinem Gegenstrom oder Gleichstrom mit 1 Durchgang (1-1 Tauscher)',
      'Bei Mehrgang-Rohrbündeltauschern (1-2 Tauscher)',
      'Nur wenn Kondensationssieden auftritt',
      'Bei reinen Kreuzstromtauschern'
    ],
    correctIndex: 0,
    explanationAr: 'معامل التصحيح F يكون 1.0 فقط للجريان المستقيم أحادي الممر 1-1 (True Counter-current or Co-current)، ويقل عن 1 للمبادلات متعددة الممرات.',
    explanationEn: 'The correction factor F is 1.0 only for pure 1-1 single-pass heat exchangers. It drops below 1 for multi-pass exchangers.',
    explanationDe: 'Der Korrekturfaktor F beträgt 1,0 nur für reine 1-1-Eingang-Wärmetauscher und sinkt bei Mehrgangtauschern unter 1.'
  },
  {
    id: 'q3',
    category: 'Fluid Mechanics',
    questionAr: 'ما هو رقم رينولدز (Reynolds Number) الذي يفصل بين الجريان الصفيحي (Laminar) والجريان الاضطرابي (Turbulent) داخل الأنابيب الدائرية؟',
    questionEn: 'What is the critical Reynolds Number for transition from laminar to turbulent flow in circular pipes?',
    questionDe: 'Was ist die kritische Reynolds-Zahl für den Übergang von laminarer zu turbulenter Strömung in kreisförmigen Rohren?',
    optionsAr: ['Re ≈ 2300', 'Re ≈ 500', 'Re ≈ 10,000', 'Re ≈ 100,000'],
    optionsEn: ['Re ≈ 2300', 'Re ≈ 500', 'Re ≈ 10,000', 'Re ≈ 100,000'],
    optionsDe: ['Re ≈ 2300', 'Re ≈ 500', 'Re ≈ 10,000', 'Re ≈ 100,000'],
    correctIndex: 0,
    explanationAr: 'في الأنابيب الدائرية، يعتبر Re < 2100 جرياناً صفيحياً، و Re > 4000 جرياناً اضطرابياً، والمنطقة الانتقالية تبدأ حول Re = 2300.',
    explanationEn: 'In circular pipes, Re < 2100 is laminar, Re > 4000 is turbulent, and the transition threshold is around Re = 2300.',
    explanationDe: 'In kreisförmigen Rohren gilt Re < 2100 als laminar, Re > 4000 als turbulent, mit einer Übergangsschwelle bei ca. Re = 2300.'
  },
  {
    id: 'q4',
    category: 'Absorption & Adsorption',
    questionAr: 'ما الفرق الأساسي بين الامتصاص (Absorption) والادمصاص (Adsorption)؟',
    questionEn: 'What is the fundamental difference between Absorption and Adsorption?',
    questionDe: 'Was ist der grundlegende Unterschied zwischen Absorption und Adsorption?',
    optionsAr: [
      'الامتصاص ظاهرة حجمية تذوب في المائع، والادمصاص ظاهرة سطحية تتراكم على سطح المادة الصلبة',
      'الامتصاص يحدث للصلب فقط، والادمصاص للسوائل فقط',
      'لا يوجد فرق، هما نفس العملية',
      'الادمصاص يحتاج حرارة عالية دائماً والامتصاص لا يحتاج'
    ],
    optionsEn: [
      'Absorption is a bulk volume phenomenon into a fluid, whereas Adsorption is a surface accumulation phenomenon',
      'Absorption happens in solids only, Adsorption in liquids only',
      'There is no difference, they are identical',
      'Adsorption always requires high heat while Absorption does not'
    ],
    optionsDe: [
      'Absorption ist ein Volumenphänomen in eine Flüssigkeit, Adsorption ist eine Oberflächenanlagerung',
      'Absorption findet nur in Feststoffen statt, Adsorption nur in Flüssigkeiten',
      'Es gibt keinen Unterschied',
      'Adsorption erfordert immer hohe Wärme'
    ],
    correctIndex: 0,
    explanationAr: 'الامتصاص (Absorption) هو تخلل المادة داخل حجم المائع الآخر، أما الادمصاص (Adsorption) فهو التماس والتراكم السطحي للجزيئات على سطح المادة الماصة الصلبة.',
    explanationEn: 'Absorption involves molecules penetrating into the bulk phase of another medium, while Adsorption is the surface accumulation of molecules on a solid surface.',
    explanationDe: 'Absorption beinhaltet das Eindringen von Molekülen in das Gesamtvolumen, während Adsorption die Oberflächenanlagerung an einem Feststoff ist.'
  },
  {
    id: 'q5',
    category: 'Evaporation',
    questionAr: 'ما هي الفائدة الرئيسية لاستخدام المبخرات متعددة التأثير (Multiple-Effect Evaporators)؟',
    questionEn: 'What is the main economic advantage of using multiple-effect evaporators?',
    questionDe: 'Was ist der Hauptvorteil von Mehrfacheffekt-Verdampfern?',
    optionsAr: [
      'توفير استهلاك البخار الحي وتكرار استخدام بخار السائل كمصدر حراري',
      'تقليل حجم الخزان بنسبة 90%',
      'منع الغليان تماماً',
      'زيادة الضغط إلى 100 bar'
    ],
    optionsEn: [
      'Saving live steam consumption by reusing generated vapor as heating medium in subsequent effects',
      'Reducing vessel volume by 90%',
      'Preventing boiling completely',
      'Increasing pressure to 100 bar'
    ],
    optionsDe: [
      'Einsparung von Frischdampf durch Wiederverwendung des erzeugten Dampfes in nachfolgenden Stufen',
      'Reduzierung des Behältervolumens um 90%',
      'Vollständige Verhinderung des Siedens',
      'Druckerhöhung auf 100 bar'
    ],
    correctIndex: 0,
    explanationAr: 'تسمح المبخرات متعددة التأثير باستخدام البخار المتصاعد من التأثير الأول كوسيلة تسخين للتأثير الثاني تحت ضغط أقل، مما يضاعف الاقتصادية البخارية (Steam Economy).',
    explanationEn: 'Multiple-effect evaporators reuse vapor generated from one effect as the heating medium for the next effect at lower pressure, multiplying steam economy.',
    explanationDe: 'Mehrfacheffekt-Verdampfer nutzen den Brüden einer Stufe als Heizmedium der nächsten Stufe bei niedrigerem Druck, was die Dampfwirtschaftlichkeit vervielfacht.'
  }
];
