import React, { useState } from 'react';
import { ArrowLeft, Clock, Shuffle, Play } from 'lucide-react';
import type { Exam } from '../utils/markdownParser';


interface SetupScreenProps {
  exam: Exam;
  onStartExam: (settings: {
    title: string;
    duration: number | null;
    randomizeQuestions: boolean;
    randomizeChoices: boolean;
  }) => void;
  onBack: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ exam, onStartExam, onBack }) => {
  const [title, setTitle] = useState(exam.metadata.title);
  const [enableTimer, setEnableTimer] = useState(exam.metadata.duration !== null);
  const [duration, setDuration] = useState<number>(exam.metadata.duration || 30);
  const [randomizeQuestions, setRandomizeQuestions] = useState(exam.metadata.randomizeQuestions);
  const [randomizeChoices, setRandomizeChoices] = useState(exam.metadata.randomizeChoices);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartExam({
      title: title.trim(),
      duration: enableTimer ? Math.max(1, duration) : null,
      randomizeQuestions,
      randomizeChoices,
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="px-6 py-4 max-w-4xl w-full mx-auto flex items-center">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Kembali
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
              Pengaturan Ujian
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Periksa dan sesuaikan opsi di bawah ini sebelum memulai sesi ujian Anda.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Override */}
            <div>
              <label htmlFor="exam-title" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Judul Ujian
              </label>
              <input
                type="text"
                id="exam-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all font-medium"
                required
              />
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-900">
              <div className="text-center p-2">
                <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Jumlah Soal</span>
                <span className="block text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
                  {exam.questions.length} <span className="text-xs font-medium text-gray-400 dark:text-gray-500">butir</span>
                </span>
              </div>
              <div className="text-center p-2 border-l border-slate-100 dark:border-slate-900">
                <span className="block text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tipe Soal</span>
                <div className="flex justify-center gap-1.5 mt-2 flex-wrap">
                  {exam.questions.some(q => q.type === 'multiple-choice') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-violet-100 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 rounded-md">
                      Pilihan Ganda
                    </span>
                  )}
                  {exam.questions.some(q => q.type === 'short-answer') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-md">
                      Isian
                    </span>
                  )}
                  {exam.questions.some(q => q.type === 'essay') && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 rounded-md">
                      Esai
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Timer Settings */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 p-2 rounded-xl">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white">Batasi Durasi Ujian</h4>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Gunakan hitung mundur dan kirim otomatis.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableTimer}
                    onChange={(e) => setEnableTimer(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none dark:bg-gray-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600 rounded-full"></div>
                </label>
              </div>

              {enableTimer && (
                <div className="flex items-center gap-3 pt-2 pl-12 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Durasi:</span>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-20 px-3 py-1.5 text-center font-bold text-gray-900 dark:text-white rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Menit</span>
                </div>
              )}
            </div>

            {/* Randomization Settings */}
            <div className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-4 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/40 p-2 rounded-xl">
                  <Shuffle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">Randomisasi Soal & Opsi</h4>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Acak urutan untuk menghindari kecurangan.</p>
                </div>
              </div>

              <div className="space-y-3 pt-3 pl-12 border-t border-gray-100 dark:border-gray-800">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={randomizeQuestions}
                    onChange={(e) => setRandomizeQuestions(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 border-gray-300 dark:border-gray-800 bg-white dark:bg-slate-950 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Acak urutan soal ujian
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={randomizeChoices}
                    onChange={(e) => setRandomizeChoices(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500 border-gray-300 dark:border-gray-800 bg-white dark:bg-slate-950 h-4 w-4"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    Acak urutan pilihan jawaban (Pilihan Ganda)
                  </span>
                </label>
              </div>
            </div>

            {/* Start Button */}
            <button
              type="submit"
              className="w-full py-4 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              Mulai Ujian Sekarang
              <Play size={18} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400 dark:text-gray-600">
        Pastikan jawaban Anda terisi sebelum waktu habis.
      </footer>
    </div>
  );
};
