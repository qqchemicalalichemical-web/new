import React, { useState } from 'react';
import { quizQuestions, QuizItem } from '../../data/quizData';
import { Language, translations } from '../../data/translations';
import { HelpCircle, CheckCircle2, XCircle, Trophy, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';

interface QuizTabProps {
  language: Language;
}

export const QuizTab: React.FC<QuizTabProps> = ({ language }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const t = translations[language];
  const q: QuizItem = quizQuestions[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
    setIsAnswered(true);

    if (index === q.correctIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowResults(false);
  };

  const getQuestionText = () => (language === 'en' ? q.questionEn : language === 'de' ? q.questionDe : q.questionAr);
  const getOptions = () => (language === 'en' ? q.optionsEn : language === 'de' ? q.optionsDe : q.optionsAr);
  const getExplanation = () => (language === 'en' ? q.explanationEn : language === 'de' ? q.explanationDe : q.explanationAr);

  return (
    <div className="space-y-6 dir-rtl font-mono">
      {/* Quiz Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            {t.quizMode} - اختبار المفاهيم الهندسية والعمليات الصناعية
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            اختبر فهمك لمبادئ انتقال الحرارة، التقطير، الامتصاص، وديناميكا الموائع مع تصحيح وشرح تفصيلي فورياً.
          </p>
        </div>

        <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs font-bold text-amber-400">
          السؤال {currentQuestionIndex + 1} / {quizQuestions.length}
        </div>
      </div>

      {/* Quiz Body or Final Results */}
      {showResults ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-slate-100">اكتمل الاختبار بنجاح!</h3>
          <p className="text-sm text-slate-300">
            درجتك النهائية: <strong className="text-amber-400 text-xl font-mono">{score}</strong> من أصل {quizQuestions.length}
          </p>
          <div className="text-xs text-slate-400">
            {score === quizQuestions.length
              ? '🏆 ممتاز جداً! فهم استثنائي لمبادئ الهندسة الكيميائية.'
              : score >= quizQuestions.length / 2
              ? '👍 أداء جيد جداً! يمكنك مراجعة الشرح في الأسئلة لتعزيز المفاهيم.'
              : '📖 حاول مرة أخرى لمراجعة المبادئ وتصميم المبادلات والتقطير.'}
          </div>
          <button
            onClick={handleRestart}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.restartQuiz}</span>
          </button>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          {/* Category Tag & Question Text */}
          <div className="space-y-2">
            <span className="bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] px-2.5 py-1 rounded-full font-bold">
              {q.category}
            </span>
            <h3 className="text-base font-bold text-slate-100 leading-relaxed">{getQuestionText()}</h3>
          </div>

          {/* Options List */}
          <div className="space-y-3">
            {getOptions().map((opt, idx) => {
              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';

              if (isAnswered) {
                if (idx === q.correctIndex) {
                  btnStyle = 'bg-emerald-950/80 border-emerald-600 text-emerald-200 font-bold';
                } else if (idx === selectedOption) {
                  btnStyle = 'bg-rose-950/80 border-rose-600 text-rose-200';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border text-right text-xs transition flex items-center justify-between ${btnStyle}`}
                >
                  <span>{opt}</span>
                  {isAnswered && idx === q.correctIndex && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                  {isAnswered && idx === selectedOption && idx !== q.correctIndex && (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswered && (
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                الشرح التوضيحي الهندي (Engineering Explanation):
              </span>
              <p className="text-slate-300 leading-relaxed">{getExplanation()}</p>
            </div>
          )}

          {/* Next Button */}
          {isAnswered && (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center gap-2"
              >
                <span>التالي (Next)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
