import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Bookmark, Maximize, Minimize, AlertCircle, Play, Pause, LogOut, Sun, Moon } from 'lucide-react';
import type { Exam, Question, QuestionOption } from '../utils/markdownParser';
import { MarkdownRenderer } from './MarkdownRenderer';


interface ExamScreenProps {
  exam: Exam;
  questions: Question[]; // Possibly randomized order
  randomizedChoices: Record<string, QuestionOption[]>; // Mapped by question.id
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  timeSpent: number;
  durationLeft: number | null; // Seconds remaining, or null
  currentQuestionIndex: number;
  isDark: boolean;
  toggleDarkMode: () => void;
  onUpdateAnswer: (questionId: string, answer: string) => void;
  onToggleFlag: (questionId: string) => void;
  onUpdateIndex: (index: number) => void;
  onUpdateTimeSpent: (seconds: number) => void;
  onUpdateDurationLeft: (seconds: number | null) => void;
  onSubmitExam: () => void;
  onExitWithoutSubmit: () => void;
}

export const ExamScreen: React.FC<ExamScreenProps> = ({
  exam,
  questions,
  randomizedChoices,
  answers,
  flags,
  timeSpent,
  durationLeft,
  currentQuestionIndex,
  isDark,
  toggleDarkMode,
  onUpdateAnswer,
  onToggleFlag,
  onUpdateIndex,
  onUpdateTimeSpent,
  onUpdateDurationLeft,
  onSubmitExam,
  onExitWithoutSubmit,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const currentQuestion = questions[currentQuestionIndex];

  // 1. Fullscreen toggler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 2. Timer Effects
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Increment time spent
      onUpdateTimeSpent(timeSpent + 1);

      // Decrement duration left if timer exists
      if (durationLeft !== null) {
        if (durationLeft <= 1) {
          // Time is up! Submit automatically
          clearInterval(interval);
          onUpdateDurationLeft(0);
          alert('Waktu ujian telah habis! Hasil ujian Anda akan dikirimkan otomatis.');
          onSubmitExam();
        } else {
          onUpdateDurationLeft(durationLeft - 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeSpent, durationLeft, onUpdateTimeSpent, onUpdateDurationLeft, onSubmitExam]);

  // 3. Keyboard Navigation Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused) return;

      // Avoid shortcuts if user is typing in short answer text inputs or essays textareas
      const activeElement = document.activeElement;
      const isTyping = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';

      if (isTyping) {
        // Esc to blur input is helpful
        if (e.key === 'Escape') {
          (activeElement as HTMLElement).blur();
        }
        return;
      }

      if (e.key === 'ArrowLeft') {
        // Previous question
        if (currentQuestionIndex > 0) {
          onUpdateIndex(currentQuestionIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        // Next question
        if (currentQuestionIndex < questions.length - 1) {
          onUpdateIndex(currentQuestionIndex + 1);
        }
      } else if (e.key.toLowerCase() === 'f') {
        // Flag question
        onToggleFlag(currentQuestion.id);
      } else if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
        // Multiple choice selection shortcuts: 1-5 or A-E
        const key = e.key.toUpperCase();
        const optionsList = randomizedChoices[currentQuestion.id] || currentQuestion.options;
        
        // Match numbers 1-9
        const numberIndex = parseInt(key, 10) - 1;
        if (numberIndex >= 0 && numberIndex < optionsList.length) {
          onUpdateAnswer(currentQuestion.id, optionsList[numberIndex].id);
          return;
        }

        // Match letters A-Z
        const letterIndex = key.charCodeAt(0) - 65; // 'A' is 65
        if (letterIndex >= 0 && letterIndex < optionsList.length) {
          // Find option corresponding to letterId
          const option = optionsList[letterIndex];
          onUpdateAnswer(currentQuestion.id, option.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, questions, currentQuestion, randomizedChoices, isPaused, onUpdateIndex, onToggleFlag, onUpdateAnswer]);

  // Format timer string
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    return hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`;
  };

  const totalAnswered = questions.filter(q => !!answers[q.id]?.trim()).length;
  const progressPercent = (totalAnswered / questions.length) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      
      {/* Top Navbar */}
      <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-900 bg-white dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowExitConfirm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors border border-rose-100 dark:border-rose-950/40"
            title="Keluar dari Ujian"
          >
            <LogOut size={14} />
            Keluar
          </button>
          <div className="h-4 w-[1px] bg-gray-200 dark:bg-gray-800"></div>
          <div>
            <h1 className="text-base md:text-lg font-bold truncate max-w-[200px] md:max-w-[400px]">
              {exam.metadata.title}
            </h1>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {/* Timer Display */}
          {durationLeft !== null && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              durationLeft < 60
                ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 animate-pulse'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}>
              <span className="text-xs uppercase font-sans tracking-wide">Sisa Waktu:</span>
              <span>{formatTime(durationLeft)}</span>
            </div>
          )}

          {/* Pause Button */}
          {durationLeft !== null && (
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title={isPaused ? 'Lanjutkan Ujian' : 'Jeda Ujian'}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title="Toggle Layar Penuh"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>

          {/* Theme Button */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-900 sticky top-[65px] z-20">
        <div
          className="h-full bg-violet-600 dark:bg-violet-500 transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* Main Grid View */}
      {isPaused ? (
        // Pause Screen Overlay
        <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-xl text-center">
            <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-2">Ujian Disedot (Paused)</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Timer sedang dihentikan sementara. Pertanyaan dan jawaban Anda disembunyikan untuk menjaga kejujuran ujian.
            </p>
            <button
              onClick={() => setIsPaused(false)}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-semibold rounded-xl transition-all shadow-lg shadow-violet-500/15"
            >
              Lanjutkan Ujian
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
          
          {/* LEFT PANEL: Navigasi Soal (Grid) */}
          <aside className="lg:col-span-1 flex flex-col gap-5 h-fit lg:sticky lg:top-[85px]">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Navigasi Soal</span>
                <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                  {totalAnswered} / {questions.length} Terisi
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const isAnswered = !!answers[q.id]?.trim();
                  const isFlagged = !!flags[q.id];

                  let btnStyle = "border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 text-gray-700 dark:text-gray-300 hover:border-violet-500 hover:text-violet-600";
                  
                  if (isAnswered) {
                    btnStyle = "border-violet-500 bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-300";
                  }
                  if (isCurrent) {
                    btnStyle = "ring-2 ring-violet-500 ring-offset-2 dark:ring-offset-slate-900 border-transparent bg-violet-600 text-white hover:text-white";
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => onUpdateIndex(idx)}
                      className={`relative aspect-square rounded-xl border font-bold text-sm flex items-center justify-center transition-all cursor-pointer ${btnStyle}`}
                    >
                      {idx + 1}
                      {isFlagged && (
                        <div className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white rounded-full p-0.5 shadow-sm border border-white dark:border-slate-900">
                          <Bookmark size={8} className="fill-current" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-violet-600 rounded-sm"></span> Current
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-violet-50 dark:bg-violet-950/20 border border-violet-500 rounded-sm"></span> Answered
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 bg-white dark:bg-slate-950 border border-gray-200 dark:border-gray-800 rounded-sm"></span> Empty
                </div>
              </div>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="bg-slate-100 dark:bg-slate-900/30 rounded-2xl p-4 border border-slate-200/50 dark:border-slate-800/30 hidden lg:block">
              <span className="block font-bold text-[10px] uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-2">Pintasan Keyboard</span>
              <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5">
                <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">←</kbd> / <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">→</kbd> Navigasi soal</li>
                <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">F</kbd> Tandai bintang / bookmark</li>
                <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">1-5</kbd> / <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">A-E</kbd> Pilih opsi PG</li>
                <li><kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-700 shadow-sm text-[10px]">Esc</kbd> Batalkan fokus input teks</li>
              </ul>
            </div>
          </aside>

          {/* CENTER PANEL: Question Display Area */}
          <main className="lg:col-span-3 flex flex-col justify-between bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px]">
            
            {/* Header Soal */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
                  SOAL NOMOR {currentQuestionIndex + 1}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                  {currentQuestion.type === 'multiple-choice' ? 'Pilihan Ganda' : currentQuestion.type === 'short-answer' ? 'Isian Singkat' : 'Esai'}
                </span>
              </div>
              <button
                onClick={() => onToggleFlag(currentQuestion.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                  flags[currentQuestion.id]
                    ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40'
                    : 'bg-white dark:bg-slate-900 text-gray-500 border-gray-200 dark:border-gray-850 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Bookmark size={14} className={flags[currentQuestion.id] ? 'fill-current' : ''} />
                {flags[currentQuestion.id] ? 'Telah Ditandai' : 'Tandai Ragu-ragu'}
              </button>
            </div>

            {/* Question Text */}
            <div className="p-8 flex-1 space-y-6 overflow-y-auto">
              <div className="text-base md:text-lg font-bold text-gray-950 dark:text-white leading-relaxed">
                <MarkdownRenderer content={currentQuestion.title} isInline={true} />
              </div>
              
              {currentQuestion.body && (
                <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed border-t border-gray-100 dark:border-gray-800/50 pt-4">
                  <MarkdownRenderer content={currentQuestion.body} />
                </div>
              )}

              {/* Answer Input Controls */}
              <div className="border-t border-gray-100 dark:border-gray-800/50 pt-6 mt-6">
                <span className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Jawaban Anda:</span>
                
                {currentQuestion.type === 'multiple-choice' && (
                  <div className="space-y-3">
                    {(randomizedChoices[currentQuestion.id] || currentQuestion.options || []).map((opt) => {
                      const isSelected = answers[currentQuestion.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => onUpdateAnswer(currentQuestion.id, opt.id)}
                          className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all group cursor-pointer ${
                            isSelected
                              ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 shadow-sm'
                              : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-700 hover:bg-slate-50/50 dark:hover:bg-slate-950/10'
                          }`}
                        >
                          <div className={`h-6 w-6 rounded-lg border font-bold text-xs flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-violet-600 border-violet-600 text-white'
                              : 'border-gray-300 dark:border-gray-700 text-gray-500 group-hover:border-gray-400'
                          }`}>
                            {opt.id}
                          </div>
                          <span className={`text-sm font-medium ${
                            isSelected ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            <MarkdownRenderer content={opt.text} isInline={true} />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {currentQuestion.type === 'short-answer' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => onUpdateAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Ketik jawaban singkat Anda di sini..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-sm"
                    />
                    <span className="absolute right-3 top-3.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      Autosaved
                    </span>
                  </div>
                )}

                {currentQuestion.type === 'essay' && (
                  <div className="relative">
                    <textarea
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => onUpdateAnswer(currentQuestion.id, e.target.value)}
                      placeholder="Tuliskan jawaban esai Anda secara lengkap dan detail..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium text-sm leading-relaxed"
                    />
                    <span className="absolute right-3 bottom-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                      Autosaved
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/30 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => onUpdateIndex(currentQuestionIndex - 1)}
                disabled={currentQuestionIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft size={18} />
                Sebelumnya
              </button>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() => onUpdateIndex(currentQuestionIndex + 1)}
                  className="flex items-center gap-1.5 px-5 py-2 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-bold rounded-xl transition-all shadow-md shadow-violet-500/10 cursor-pointer"
                >
                  Selanjutnya
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setShowSubmitConfirm(true)}
                  className="flex items-center gap-1.5 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                >
                  Selesai & Kumpulkan
                </button>
              )}
            </div>
          </main>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selesai Mengerjakan Ujian?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Anda telah menjawab <strong>{totalAnswered} dari {questions.length}</strong> pertanyaan. Apakah Anda yakin ingin mengumpulkan ujian sekarang?
            </p>
            {totalAnswered < questions.length && (
              <div className="mb-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-100 dark:border-amber-900/50">
                Peringatan: Ada {questions.length - totalAnswered} soal yang belum Anda jawab.
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Kembali Periksa
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  onSubmitExam();
                }}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Exit Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 max-w-md w-full text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Batalkan Ujian?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Keluar sekarang akan menyimpan progres Anda saat ini ke local storage, namun sesi ujian akan terhenti. Anda dapat melanjutkannya nanti.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 dark:hover:text-white border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Lanjutkan Mengerjakan
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitWithoutSubmit();
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Ya, Keluar Ujian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
