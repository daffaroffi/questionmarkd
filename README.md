# Questionmarkd - Markdown Exam Runner

[English](README.md) | [Bahasa Indonesia](README-id.md)

---

A modern, fast, and privacy-centric web application to run interactive exams/quizzes instantly directly from your Markdown (`.md`) files. **No login, no database, running 100% locally in your browser.**

> **Core Principle**: Upload Markdown &rarr; Start Exam

---

## Key Features

- **Zero Configuration**: Simply drag-and-drop a Markdown file to start your exam in seconds.
- **Automatic Question Detection**: Supports three dynamic question types:
  - **Multiple Choice**: Automatically parses checkboxes `- [ ]` and marked correct answer options `- [x]`.
  - **Short Answer**: Detects keys with line markers like `Answer: [key]`. Supports multiple alternative answers separated by a pipe symbol `|`.
  - **Essay**: Open-ended descriptive questions without a pre-defined automated key.
- **Rich Markdown & LaTeX Support**: Render bold/italic styles, lists, code blocks, tables, image links, and LaTeX math formulas (powered by KaTeX) seamlessly.
- **Flawless Autosave**: Instantly stores all active progress (current answers, flagged states, remaining time, current question index) to browser `localStorage`. You can safely resume your exam even if the tab is accidentally closed.
- **Keyboard Shortcuts**: Navigate questions quickly without touching the mouse using arrow keys and number/letter shortcuts.
- **Fullscreen Mode**: Minimize distractions during exams.
- **Instant Result Export**: Once completed, download a comprehensive Markdown report summarizing your scores, duration, and correctness status.
- **Localization Support**: Easily toggle between English (default) and Bahasa Indonesia with a single click.

---

## Markdown Exam Format

The app detects exam metadata from a YAML Frontmatter block at the very top of the file, followed by questions prefixed with Level 2 headings (`## Question`).

Here is a template for a supported `.md` exam file:

```markdown
---
title: "Basic Science Exam"
duration: 30
randomize_questions: true
randomize_choices: true
---

# Basic Science Exam

Please read the questions carefully before answering.

## 1. Who discovered the theory of special relativity?
- [ ] A. Isaac Newton
- [x] B. Albert Einstein
- [ ] C. Nikola Tesla
- [ ] D. Marie Curie

## 2. Calculate the value of the following integral:
$$\int_{0}^{\pi} \sin(x) \, dx$$

- [ ] A. -1
- [ ] B. 0
- [ ] C. 1
- [x] D. 2

## 3. What is the value of the speed of light in a vacuum (in m/s) when rounded?
Answer: 3x10^8 | 300000000 | 3 * 10^8

## 4. Explain the primary differences between Mitosis and Meiosis cell division!
*(This is treated as an Essay question because it does not contain multiple-choice options or an 'Answer:' line)*
```

### Parsing Mechanics:
1. **Frontmatter**:
   - `title`: The title of the exam.
   - `duration`: The duration limit in minutes (leave blank or set to `null` for untimed exams).
   - `randomize_questions`: Set to `true`/`false` to shuffle the question order on exam start.
   - `randomize_choices`: Set to `true`/`false` to shuffle multiple-choice options.
2. **Multiple Choice**: Detected from the list syntax `- [ ]` or `- [x]`. The `[x]` character marks the correct answer option.
3. **Short Answer**: Detected if a question contains a line starting with `Answer:`, `Key:`, `Jawab:`, or `Jawaban:`. You can provide multiple alternative answers separated by `|`.
4. **Essay**: Questions without multiple-choice lists or short-answer prefixes are classified as essays (ungraded).

---

## Tech Stack

The application is built using a modern React SPA stack:
- **Core**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 (native modern CSS configuration, ultra-fast)
- **Icons**: Lucide React
- **Markdown & LaTeX Rendering**:
  - `react-markdown`
  - `remark-gfm` (table & task list support)
  - `remark-math` + `rehype-katex` (LaTeX math support)
- **Interactivity & Animation**:
  - `canvas-confetti` (for score celebrations)

---

## Running Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed.

### Steps
1. **Navigate to project directory**:
   ```bash
   cd "/mnt/HDD2/My Project/questionmarkd"
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to [http://localhost:5173/](http://localhost:5173/).

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## Keyboard Shortcuts during Exam

Use the following shortcuts for a smooth desktop experience:
- **Previous Question**: Left Arrow `<-`
- **Next Question**: Right Arrow `->`
- **Flag/Bookmark Question**: Press `F`
- **Choose Option (Multiple Choice)**: Press keys `1` to `5` OR `A` to `E`
- **Defocus/Escape text cursor**: Press `Esc` when typing in short answers or essay text boxes to return to keyboard navigation.

---

## License & Privacy

This application runs 100% locally in your web browser. No answers, uploaded Markdown files, or exam results are transmitted to external servers. Your data stays entirely in your browser.

---

*[Bahasa Indonesia](README-id.md)*
