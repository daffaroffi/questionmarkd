import React, { useEffect, useState } from 'react';
import { Download, Award, Clock, CheckCircle2, XCircle, HelpCircle, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { exportExamResultToMarkdown } from '../utils/markdownParser';
import type { Exam, Question } from '../utils/markdownParser';
import { MarkdownRenderer } from './MarkdownRenderer';
import { translations } from '../utils/translations';
import type { LangType } from '../utils/translations';

interface ResultScreenProps {
  exam: Exam;
  questions: Question[];
  answers: Record<string, string>;
  timeSpent: number;
  onRestart: () => void;
  lang: LangType;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  exam,
  questions,
  answers,
  timeSpent,
  onRestart,
  lang,
}) => {
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const t = translations[lang];

  // 1. Calculate Scores
  let correctCount = 0;
  let wrongCount = 0;
  let essayCount = 0;

  questions.forEach(q => {
    const userAnswer = answers[q.id] || '';
    if (q.type === 'multiple-choice' && q.options) {
      const correctOpt = q.options.find(o => o.isCorrect);
      if (correctOpt) {
        if (userAnswer === correctOpt.id) {
          correctCount++;
        } else {
          wrongCount++;
        }
      }
    } else if (q.type === 'short-answer') {
      const acceptableAnswers = q.correctAnswer?.split('|').map(s => s.trim().toLowerCase()) || [];
      if (acceptableAnswers.includes(userAnswer.trim().toLowerCase())) {
        correctCount++;
      } else {
        wrongCount++;
      }
    } else if (q.type === 'essay') {
      essayCount++;
    }
  });

  const evaluableCount = questions.length - essayCount;
  const scorePercent = evaluableCount > 0 ? (correctCount / evaluableCount) * 100 : 100;

  // 2. Trigger Confetti on Mount
  useEffect(() => {
    if (scorePercent >= 60) {
      // School/victory blast
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    } else {
      // Gentle confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [scorePercent]);

  // 3. Download Markdown Report
  const handleDownloadReport = () => {
    const reportData = {
      total: questions.length,
      correct: correctCount,
      wrong: wrongCount,
      essayCount,
      scorePercent,
    };
    const markdown = exportExamResultToMarkdown(exam, answers, reportData, timeSpent);
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Format filename: exam-result-title.md
    const prefix = lang === 'id' ? 'hasil-ujian' : 'exam-result';
    const sanitizedTitle = exam.metadata.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.setAttribute('download', `${prefix}-${sanitizedTitle}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return lang === 'id' ? `${mins} Menit ${secs} Detik` : `${mins}m ${secs}s`;
  };

  const toggleExpandQuestion = (id: string) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300 pb-16">
      
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl w-full mx-auto flex items-center justify-between">
          <button
            onClick={onRestart}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t.resultRestartBtn}
          </button>
          <span className="font-extrabold text-sm text-violet-600 dark:text-violet-400">{t.resultSummaryTitle}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 space-y-8 flex-1">
        
        {/* Score Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm text-center relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-emerald-500"></div>

          <div className="bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 p-4 rounded-2xl w-fit mx-auto mb-4">
            <Award size={36} />
          </div>

          <h2 className="text-xl font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">{t.resultScoreLabel}</h2>
          
          <div className="my-6">
            <span className="text-6xl md:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {scorePercent.toFixed(1)}%
            </span>
          </div>

          <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {exam.metadata.title}
          </p>

          <p className="text-sm text-gray-500 dark:text-gray-450 max-w-md mx-auto mb-6">
            {scorePercent >= 80
              ? t.resultScoreDescHigh
              : scorePercent >= 60
              ? t.resultScoreDescMid
              : t.resultScoreDescLow}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleDownloadReport}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-bold rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={18} />
              {t.resultDownloadReport}
            </button>
            <button
              onClick={onRestart}
              className="px-6 py-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all cursor-pointer"
            >
              {t.resultNewExam}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <CheckCircle2 size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.resultStatCorrect}</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{correctCount} <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t.resultStatUnit}</span></span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
              <XCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.resultStatWrong}</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{wrongCount} <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t.resultStatUnit}</span></span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-amber-500 dark:text-amber-400 mb-1">
              <HelpCircle size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.resultStatEssay}</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{essayCount} <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t.resultStatUnit}</span></span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 flex flex-col justify-center shadow-sm">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
              <Clock size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{t.resultStatDuration}</span>
            </div>
            <span className="text-base font-extrabold text-gray-900 dark:text-white leading-tight truncate" title={formatDuration(timeSpent)}>
              {Math.floor(timeSpent / 60)}m {timeSpent % 60}s
            </span>
          </div>
        </div>

        {/* Review Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.resultDetailTitle}</h3>
          
          <div className="space-y-3">
            {questions.map((q, idx) => {
              const isExpanded = expandedQuestionId === q.id;
              const userAnswer = answers[q.id] || '';
              let statusBadge = null;

              if (q.type === 'multiple-choice' && q.options) {
                const correctOpt = q.options.find(o => o.isCorrect);
                if (correctOpt) {
                  const isCorrect = userAnswer === correctOpt.id;
                  statusBadge = isCorrect 
                    ? <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded">{t.resultDetailCorrect}</span>
                    : <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded">{t.resultDetailWrong}</span>;
                }
              } else if (q.type === 'short-answer') {
                const acceptableAnswers = q.correctAnswer?.split('|').map(s => s.trim().toLowerCase()) || [];
                const isCorrect = acceptableAnswers.includes(userAnswer.trim().toLowerCase());
                statusBadge = isCorrect 
                  ? <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded">{t.resultDetailCorrect}</span>
                  : <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded">{t.resultDetailWrong}</span>;
              } else if (q.type === 'essay') {
                statusBadge = <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded">{t.resultDetailUnevaluated}</span>;
              }

              return (
                <div
                  key={q.id}
                  className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => toggleExpandQuestion(q.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3 pr-4 truncate">
                      <span className="font-bold text-sm text-gray-400 dark:text-gray-500">#{idx + 1}</span>
                      <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        <MarkdownRenderer content={q.title} isInline={true} />
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {statusBadge}
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-6 pb-6 pt-2 border-t border-gray-150 dark:border-gray-800 space-y-4">
                      {q.body && (
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl text-sm border border-slate-100 dark:border-slate-900">
                          <MarkdownRenderer content={q.body} />
                        </div>
                      )}

                      {/* Display Question details and User responses */}
                      <div className="space-y-3">
                        <span className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{t.resultDetailOptionHeader}</span>
                        
                        {q.type === 'multiple-choice' && q.options && (
                          <div className="space-y-2">
                            {q.options.map(opt => {
                              const isUserAnswer = userAnswer === opt.id;
                              let borderStyle = "border-gray-100 dark:border-gray-800";
                              let textStyle = "text-gray-700 dark:text-gray-300";
                              let icon = null;

                              if (opt.isCorrect) {
                                borderStyle = "border-emerald-200 dark:border-emerald-950 bg-emerald-50/20 dark:bg-emerald-950/10";
                                textStyle = "text-emerald-700 dark:text-emerald-400 font-semibold";
                                icon = <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />;
                              } else if (isUserAnswer && !opt.isCorrect) {
                                borderStyle = "border-rose-200 dark:border-rose-950 bg-rose-50/20 dark:bg-rose-950/10";
                                textStyle = "text-rose-700 dark:text-rose-450 font-semibold";
                                icon = <XCircle size={16} className="text-rose-500 flex-shrink-0" />;
                              }

                              return (
                                <div key={opt.id} className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs ${borderStyle}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded font-bold ${
                                      opt.isCorrect
                                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-350'
                                        : (isUserAnswer
                                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-350'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500')
                                    }`}>
                                      {opt.id}
                                    </span>
                                    <span className={textStyle}>
                                      <MarkdownRenderer content={opt.text} isInline={true} />
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    {isUserAnswer && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide mr-1">{t.resultDetailChosenOption}</span>}
                                    {icon}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {q.type === 'short-answer' && (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="p-3 rounded-xl border border-gray-150 dark:border-gray-800 bg-slate-50 dark:bg-slate-950/25">
                                <span className="block font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-1">{t.resultDetailShortAnswerUser}</span>
                                <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{userAnswer || (lang === 'id' ? '(Tidak Diisi)' : '(Not Answered)')}</span>
                              </div>
                              <div className="p-3 rounded-xl border border-emerald-100 dark:border-emerald-950/50 bg-emerald-50/10 dark:bg-emerald-950/5">
                                <span className="block font-bold text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-wider mb-1">{t.resultDetailShortAnswerCorrect}</span>
                                <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{q.correctAnswer?.split('|').map(s => s.trim()).join(' / ')}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {q.type === 'essay' && (
                          <div className="space-y-2 text-xs">
                            <div className="p-4 rounded-xl border border-gray-150 dark:border-gray-800 bg-slate-50 dark:bg-slate-950/25">
                              <span className="block font-bold text-[10px] text-gray-400 uppercase tracking-wider mb-2">{t.resultDetailEssayUser}</span>
                              <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300 font-medium">
                                {userAnswer || t.resultDetailEssayPlaceholder}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
