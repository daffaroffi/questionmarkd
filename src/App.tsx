import { useState, useEffect } from 'react';
import type { Exam, Question, QuestionOption } from './utils/markdownParser';
import { LandingScreen } from './components/LandingScreen';

import { SetupScreen } from './components/SetupScreen';
import { ExamScreen } from './components/ExamScreen';
import { ResultScreen } from './components/ResultScreen';

type ScreenType = 'landing' | 'setup' | 'exam' | 'result';

const SESSION_KEY = 'questionmarkd_active_session';

interface SavedSession {
  exam: Exam;
  rawMarkdown: string;
  questions: Question[];
  randomizedChoices: Record<string, QuestionOption[]>;
  answers: Record<string, string>;
  flags: Record<string, boolean>;
  timeSpent: number;
  durationLeft: number | null;
  currentQuestionIndex: number;
  screen: ScreenType;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [screen, setScreen] = useState<ScreenType>('landing');
  const [exam, setExam] = useState<Exam | null>(null);
  const [rawMarkdown, setRawMarkdown] = useState<string>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [randomizedChoices, setRandomizedChoices] = useState<Record<string, QuestionOption[]>>({});
  
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [durationLeft, setDurationLeft] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  const [hasSavedSession, setHasSavedSession] = useState<boolean>(false);

  // 1. Dark Mode State & Effect
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || 
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDark]);

  const toggleDarkMode = () => setIsDark(!isDark);

  // 2. Check for saved session on mount
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedSession;
        if (parsed.exam && parsed.questions.length > 0) {
          setHasSavedSession(true);
        }
      } catch (e) {
        console.error('Gagal memuat sesi yang tersimpan:', e);
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  // 3. Save session on state changes
  useEffect(() => {
    if (screen === 'exam' && exam) {
      const sessionData: SavedSession = {
        exam,
        rawMarkdown,
        questions,
        randomizedChoices,
        answers,
        flags,
        timeSpent,
        durationLeft,
        currentQuestionIndex,
        screen,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    }
  }, [screen, exam, rawMarkdown, questions, randomizedChoices, answers, flags, timeSpent, durationLeft, currentQuestionIndex]);

  // 4. Action Handlers
  const handleExamLoaded = (loadedExam: Exam, rawContent: string) => {
    setExam(loadedExam);
    setRawMarkdown(rawContent);
    setScreen('setup');
  };

  const handleResumeSession = () => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedSession;
        setExam(parsed.exam);
        setRawMarkdown(parsed.rawMarkdown);
        setQuestions(parsed.questions);
        setRandomizedChoices(parsed.randomizedChoices);
        setAnswers(parsed.answers);
        setFlags(parsed.flags);
        setTimeSpent(parsed.timeSpent);
        setDurationLeft(parsed.durationLeft);
        setCurrentQuestionIndex(parsed.currentQuestionIndex);
        setScreen(parsed.screen);
      } catch (e) {
        console.error('Gagal melanjutkan sesi:', e);
        localStorage.removeItem(SESSION_KEY);
        setHasSavedSession(false);
      }
    }
  };

  const handleStartExam = (settings: {
    title: string;
    duration: number | null;
    randomizeQuestions: boolean;
    randomizeChoices: boolean;
  }) => {
    if (!exam) return;

    // Apply overridden settings to metadata
    const updatedExam = {
      ...exam,
      metadata: {
        ...exam.metadata,
        title: settings.title,
        duration: settings.duration,
        randomizeQuestions: settings.randomizeQuestions,
        randomizeChoices: settings.randomizeChoices,
      }
    };
    setExam(updatedExam);

    // Prepare questions list
    let preparedQuestions = [...exam.questions];
    if (settings.randomizeQuestions) {
      preparedQuestions = shuffleArray(preparedQuestions);
    }
    setQuestions(preparedQuestions);

    // Prepare choices list
    const randomizedChoicesMap: Record<string, QuestionOption[]> = {};
    preparedQuestions.forEach(q => {
      if (q.type === 'multiple-choice' && q.options) {
        if (settings.randomizeChoices) {
          randomizedChoicesMap[q.id] = shuffleArray(q.options);
        } else {
          randomizedChoicesMap[q.id] = q.options;
        }
      }
    });
    setRandomizedChoices(randomizedChoicesMap);

    // Reset session states
    setAnswers({});
    setFlags({});
    setTimeSpent(0);
    setDurationLeft(settings.duration ? settings.duration * 60 : null);
    setCurrentQuestionIndex(0);
    setScreen('exam');
  };

  const handleUpdateAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleToggleFlag = (questionId: string) => {
    setFlags(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleSubmitExam = () => {
    // Clear active session in local storage
    localStorage.removeItem(SESSION_KEY);
    setHasSavedSession(false);
    setScreen('result');
  };

  const handleExitWithoutSubmit = () => {
    // Go to landing, keep session in local storage
    setScreen('landing');
    setHasSavedSession(true);
  };

  const handleRestart = () => {
    // Clean states and return to landing
    setExam(null);
    setRawMarkdown('');
    setQuestions([]);
    setRandomizedChoices({});
    setAnswers({});
    setFlags({});
    setTimeSpent(0);
    setDurationLeft(null);
    setCurrentQuestionIndex(0);
    setScreen('landing');

    // Check if there is still a saved session (which we shouldn't have unless they hit exit instead of submit)
    const saved = localStorage.getItem(SESSION_KEY);
    setHasSavedSession(!!saved);
  };

  return (
    <>
      {screen === 'landing' && (
        <LandingScreen
          onExamLoaded={handleExamLoaded}
          hasSavedSession={hasSavedSession}
          onResumeSession={handleResumeSession}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
        />
      )}

      {screen === 'setup' && exam && (
        <SetupScreen
          exam={exam}
          onStartExam={handleStartExam}
          onBack={handleRestart}
        />
      )}

      {screen === 'exam' && exam && (
        <ExamScreen
          exam={exam}
          questions={questions}
          randomizedChoices={randomizedChoices}
          answers={answers}
          flags={flags}
          timeSpent={timeSpent}
          durationLeft={durationLeft}
          currentQuestionIndex={currentQuestionIndex}
          isDark={isDark}
          toggleDarkMode={toggleDarkMode}
          onUpdateAnswer={handleUpdateAnswer}
          onToggleFlag={handleToggleFlag}
          onUpdateIndex={setCurrentQuestionIndex}
          onUpdateTimeSpent={setTimeSpent}
          onUpdateDurationLeft={setDurationLeft}
          onSubmitExam={handleSubmitExam}
          onExitWithoutSubmit={handleExitWithoutSubmit}
        />
      )}

      {screen === 'result' && exam && (
        <ResultScreen
          exam={exam}
          questions={questions}
          answers={answers}
          timeSpent={timeSpent}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}

export default App;
