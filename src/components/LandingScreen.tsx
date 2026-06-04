import React, { useState, useRef } from 'react';
import { Upload, FileText, Play, History, FileDown, Sun, Moon } from 'lucide-react';
import { parseMarkdownExam } from '../utils/markdownParser';
import type { Exam } from '../utils/markdownParser';
import { translations } from '../utils/translations';
import type { LangType } from '../utils/translations';

interface LandingScreenProps {
  onExamLoaded: (exam: Exam, rawContent: string) => void;
  hasSavedSession: boolean;
  onResumeSession: () => void;
  isDark: boolean;
  toggleDarkMode: () => void;
  lang: LangType;
  toggleLanguage: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onExamLoaded,
  hasSavedSession,
  onResumeSession,
  isDark,
  toggleDarkMode,
  lang,
  toggleLanguage,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[lang];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.md') && !file.name.endsWith('.markdown')) {
      setError(t.errorFormat);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      try {
        const parsed = parseMarkdownExam(text);
        if (parsed.questions.length === 0) {
          setError(t.errorEmpty);
        } else {
          onExamLoaded(parsed, text);
        }
      } catch (err) {
        setError(t.errorRead);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const loadExampleExam = async () => {
    try {
      const response = await fetch('/example-exam.md');
      if (!response.ok) throw new Error();
      const text = await response.text();
      const parsed = parseMarkdownExam(text);
      onExamLoaded(parsed, text);
    } catch (err) {
      setError(t.errorDemo);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 max-w-6xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold bg-gradient-to-r from-gray-900 via-violet-950 to-violet-800 dark:from-white dark:via-violet-200 dark:to-violet-400 bg-clip-text text-transparent">
            {t.appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm font-bold text-xs cursor-pointer"
            title={lang === 'en' ? 'Switch to Bahasa Indonesia' : 'Ganti ke Bahasa Inggris'}
          >
            {lang.toUpperCase()}
          </button>
          
          {/* Theme Switcher */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all shadow-sm cursor-pointer"
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 max-w-4xl w-full mx-auto py-12">
        <div className="text-center mb-10 max-w-2xl">
          <span className="px-3 py-1 text-xs font-semibold bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 rounded-full border border-violet-200/50 dark:border-violet-900/30">
            {t.appTagline}
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-4 mb-3 leading-tight">
            {t.landingTitle}
          </h1>
          <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {t.landingSubtitle}
          </p>
        </div>

        {/* Action Center */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`md:col-span-2 relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
              isDragActive
                ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/20 scale-[1.01]'
                : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-700'
            } shadow-sm`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".md,.markdown"
              onChange={handleChange}
            />
            
            <div className="bg-violet-50 dark:bg-violet-950/40 p-4 rounded-full text-violet-600 dark:text-violet-400 mb-4 transition-transform group-hover:scale-110">
              <Upload size={32} />
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {t.dragDropTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
              {t.dragDropSubtitle}
            </p>

            <button
              onClick={onButtonClick}
              className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-600 text-white font-medium rounded-xl shadow-md shadow-violet-500/10 hover:shadow-violet-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              {t.selectFile}
            </button>

            {error && (
              <div className="absolute bottom-4 left-4 right-4 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 px-4 py-2 rounded-xl text-xs font-medium border border-rose-100 dark:border-rose-950/50">
                {error}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="flex flex-col gap-4">
            {hasSavedSession && (
              <button
                onClick={onResumeSession}
                className="w-full flex-1 flex flex-col justify-center items-start text-left p-6 rounded-3xl border border-violet-200 dark:border-violet-900/50 bg-violet-50/50 dark:bg-violet-950/15 hover:bg-violet-50 dark:hover:bg-violet-950/25 transition-all group shadow-sm cursor-pointer"
              >
                <div className="bg-violet-600 text-white p-2.5 rounded-2xl mb-3 shadow-md shadow-violet-500/20">
                  <History size={20} />
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {t.resumeExam}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t.resumeExamSubtitle}
                </p>
              </button>
            )}

            <button
              onClick={loadExampleExam}
              className="w-full flex-1 flex flex-col justify-center items-start text-left p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-sm cursor-pointer"
            >
              <div className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 p-2.5 rounded-2xl mb-3">
                <Play size={20} />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                {t.tryDemo}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.tryDemoSubtitle}
              </p>
            </button>

            <a
              href="/example-exam.md"
              download="template-exam.md"
              className="w-full flex-1 flex flex-col justify-center items-start text-left p-6 rounded-3xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-gray-700 transition-all group shadow-sm cursor-pointer"
            >
              <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-2xl mb-3">
                <FileDown size={20} />
              </div>
              <h4 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {t.downloadTemplate}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.downloadTemplateSubtitle}
              </p>
            </a>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-gray-200 dark:border-gray-800 pt-10">
          <div className="flex gap-4">
            <div className="flex-shrink-0 text-violet-600 dark:text-violet-400 mt-0.5">
              <FileText size={18} />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm">{t.feature1Title}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {t.feature1Desc}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 text-violet-600 dark:text-violet-400 mt-0.5">
              <History size={18} />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm">{t.feature2Title}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {t.feature2Desc}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 text-violet-600 dark:text-violet-400 mt-0.5">
              <FileDown size={18} />
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm">{t.feature3Title}</h5>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                {t.feature3Desc}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-100 dark:border-gray-900 text-center text-xs text-gray-400 dark:text-gray-600">
        {t.footer}
      </footer>
    </div>
  );
};
