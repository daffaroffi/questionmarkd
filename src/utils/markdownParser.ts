export interface QuestionOption {
  id: string; // e.g., 'A', 'B', 'C', 'D' or generated
  text: string;
  isCorrect: boolean;
}

export type QuestionType = 'multiple-choice' | 'short-answer' | 'essay';

export interface Question {
  id: string;
  index: number;
  type: QuestionType;
  title: string; // The heading text (without ## or numbers)
  body: string;  // Additional question text/markdown (excluding answers/choices)
  options?: QuestionOption[];
  correctAnswer?: string; // Can contain alternative answers separated by '|'
}

export interface ExamMetadata {
  title: string;
  duration: number | null; // null means no limit
  randomizeQuestions: boolean;
  randomizeChoices: boolean;
}

export interface Exam {
  metadata: ExamMetadata;
  questions: Question[];
}

export function parseMarkdownExam(mdContent: string): Exam {
  let yamlContent = '';
  let markdownBody = mdContent;

  // 1. Parse frontmatter
  if (mdContent.trim().startsWith('---')) {
    const parts = mdContent.split('---');
    if (parts.length >= 3) {
      yamlContent = parts[1];
      markdownBody = parts.slice(2).join('---');
    }
  }

  // Parse frontmatter keys
  const metadata: ExamMetadata = {
    title: 'Ujian Baru',
    duration: null,
    randomizeQuestions: false,
    randomizeChoices: false,
  };

  if (yamlContent) {
    const lines = yamlContent.split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([a-zA-Z0-9_-]+)\s*:\s*(.+)\s*$/);
      if (match) {
        const key = match[1].trim().toLowerCase();
        const val = match[2].trim();

        if (key === 'title') {
          // Strip quotes if present
          metadata.title = val.replace(/^["']|["']$/g, '');
        } else if (key === 'duration') {
          const durationVal = parseInt(val, 10);
          if (!isNaN(durationVal)) {
            metadata.duration = durationVal;
          }
        } else if (key === 'randomize_questions' || key === 'randomizequestions' || key === 'randomize') {
          metadata.randomizeQuestions = val === 'true';
        } else if (key === 'randomize_choices' || key === 'randomizechoices') {
          metadata.randomizeChoices = val === 'true';
        }
      }
    }
  }

  // 2. Parse main title if title wasn't set in frontmatter
  if (metadata.title === 'Ujian Baru') {
    const mainTitleMatch = markdownBody.match(/^#\s+(.+)$/m);
    if (mainTitleMatch) {
      metadata.title = mainTitleMatch[1].trim();
    }
  }

  // 3. Parse Questions
  // Questions are typically separated by ## or ### headings
  // Let's find all H2 headings (lines starting with '## ')
  const lines = markdownBody.split('\n');
  const questionBlocks: { heading: string; lines: string[] }[] = [];
  let currentBlock: { heading: string; lines: string[] } | null = null;

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentBlock) {
        questionBlocks.push(currentBlock);
      }
      currentBlock = {
        heading: h2Match[1].trim(),
        lines: [],
      };
    } else {
      if (currentBlock) {
        currentBlock.lines.push(line);
      } else {
        // Content before the first question (e.g. main title or intro)
        // We can ignore it or set it as intro, but for now we skip
      }
    }
  }
  if (currentBlock) {
    questionBlocks.push(currentBlock);
  }

  const questions: Question[] = [];

  questionBlocks.forEach((block, idx) => {
    const rawHeading = block.heading;
    // Clean up heading number prefix (e.g. "1. Apa itu..." -> "Apa itu...")
    const cleanHeading = rawHeading.replace(/^\d+[\.\)\s-]+\s*/, '');

    const questionLines = block.lines;
    const bodyLines: string[] = [];
    const options: QuestionOption[] = [];
    let correctAnswer: string | undefined = undefined;
    let type: QuestionType = 'essay';

    // Regex for multiple-choice choices:
    // Matches: - [ ] A. Option, - [x] Option, * [ ] Choice, etc.
    const mcRegex = /^\s*[\-\*]\s+\[([ xX])\]\s+(?:([A-Za-d])[\.\)\s-]+\s*)?(.+)$/;

    // Regex for short-answer keys:
    // Matches: Answer: Value, Key: Value, Jawab: Value, Jawaban: Value
    const saRegex = /^\s*(?:Answer|Key|Jawab|Jawaban)\s*:\s*(.+)$/i;

    // First scan to determine the question type and extract elements
    for (const line of questionLines) {
      const mcMatch = line.match(mcRegex);
      const saMatch = line.match(saRegex);

      if (mcMatch) {
        type = 'multiple-choice';
        const isCorrect = mcMatch[1].toLowerCase() === 'x';
        const optionId = mcMatch[2] || String.fromCharCode(65 + options.length); // A, B, C...
        const optionText = mcMatch[3].trim();
        options.push({
          id: optionId,
          text: optionText,
          isCorrect,
        });
      } else if (saMatch) {
        type = 'short-answer';
        correctAnswer = saMatch[1].trim();
      } else {
        bodyLines.push(line);
      }
    }

    // Reconstruction of question body
    const body = bodyLines.join('\n').trim();

    questions.push({
      id: `q-${idx + 1}-${Math.random().toString(36).substr(2, 9)}`,
      index: idx + 1,
      type,
      title: cleanHeading,
      body,
      options: type === 'multiple-choice' ? options : undefined,
      correctAnswer: type === 'short-answer' ? correctAnswer : undefined,
    });
  });

  return {
    metadata,
    questions,
  };
}

export function exportExamResultToMarkdown(
  exam: Exam,
  userAnswers: Record<string, string>, // question.id -> answer
  score: {
    total: number;
    correct: number;
    wrong: number;
    essayCount: number;
    scorePercent: number;
  },
  timeSpentSeconds: number
): string {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  let md = `# Hasil Ujian: ${exam.metadata.title}\n\n`;
  md += `## Ringkasan Hasil\n`;
  md += `- **Skor Akhir**: ${score.scorePercent.toFixed(1)}%\n`;
  md += `- **Total Soal**: ${exam.questions.length}\n`;
  md += `- **Jawaban Benar (Pilihan Ganda / Isian Singkat)**: ${score.correct} / ${exam.questions.length - score.essayCount}\n`;
  md += `- **Jawaban Salah**: ${score.wrong}\n`;
  if (score.essayCount > 0) {
    md += `- **Soal Esai (Belum Dinilai)**: ${score.essayCount} soal\n`;
  }
  md += `- **Durasi Pengerjaan**: ${formatTime(timeSpentSeconds)}\n`;
  md += `- **Tanggal Pengerjaan**: ${new Date().toLocaleString('id-ID')}\n\n`;

  md += `---\n\n`;
  md += `## Rincian Jawaban\n\n`;

  exam.questions.forEach((q, idx) => {
    md += `### ${idx + 1}. ${q.title}\n`;
    if (q.body) {
      md += `${q.body}\n\n`;
    }

    const userAnswer = userAnswers[q.id] || '';

    if (q.type === 'multiple-choice' && q.options) {
      q.options.forEach(opt => {
        const isUserChoice = userAnswer === opt.id;
        const checkMark = opt.isCorrect ? '✅' : (isUserChoice ? '❌' : ' ');
        const badge = isUserChoice ? ' **(Jawaban Anda)**' : '';
        md += `- [${opt.isCorrect ? 'x' : ' '}] ${opt.id}. ${opt.text} ${checkMark}${badge}\n`;
      });
      md += '\n';
      const correctOpt = q.options.find(o => o.isCorrect);
      if (correctOpt) {
        const isCorrect = userAnswer === correctOpt.id;
        md += `> **Status**: ${isCorrect ? 'BENAR' : `SALAH (Jawaban benar: ${correctOpt.id}. ${correctOpt.text})`}\n\n`;
      }
    } else if (q.type === 'short-answer') {
      md += `- **Jawaban Anda**: \`${userAnswer || '(Kosong)'}\`\n`;
      md += `- **Kunci Jawaban**: \`${q.correctAnswer?.split('|').map(s => s.trim()).join(' / ')}\`\n\n`;

      // Check correctness
      const acceptableAnswers = q.correctAnswer?.split('|').map(s => s.trim().toLowerCase()) || [];
      const isCorrect = acceptableAnswers.includes(userAnswer.trim().toLowerCase());
      md += `> **Status**: ${isCorrect ? 'BENAR' : 'SALAH'}\n\n`;
    } else if (q.type === 'essay') {
      md += `**Jawaban Anda (Esai)**:\n`;
      md += `\`\`\`text\n${userAnswer || '(Tidak ada jawaban)'}\n\`\`\`\n\n`;
      md += `> **Status**: BELUM DINILAI (Memerlukan koreksi manual oleh pembuat ujian)\n\n`;
    }

    md += `---\n\n`;
  });

  return md;
}
