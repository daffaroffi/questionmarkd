# Questionmarkd - Markdown Exam Runner

[English Documentation](#english-documentation) | [Dokumentasi Bahasa Indonesia](#dokumentasi-bahasa-indonesia)

---

# English Documentation

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
- **Previous Question**: Left Arrow `←`
- **Next Question**: Right Arrow `→`
- **Flag/Bookmark Question**: Press `F`
- **Choose Option (Multiple Choice)**: Press keys `1` to `5` OR `A` to `E`
- **Defocus/Escape text cursor**: Press `Esc` when typing in short answers or essay text boxes to return to keyboard navigation.

---

## License & Privacy

This application runs 100% locally in your web browser. No answers, uploaded Markdown files, or exam results are transmitted to external servers. Your data stays entirely in your browser.

---

# Dokumentasi Bahasa Indonesia

Aplikasi web modern, cepat, dan privasi-sentris untuk menjalankan ujian/kuis interaktif secara instan langsung dari file Markdown (`.md`) Anda. **Tanpa login, tanpa database, dan berjalan 100% lokal di browser Anda.**

> **Prinsip Utama**: Upload Markdown &rarr; Start Ujian

---

## Fitur Utama

- **Zero Configuration**: Cukup drag-and-drop file Markdown untuk memulai ujian dalam hitungan detik.
- **Deteksi Tipe Soal Otomatis**: Mendukung tiga jenis tipe soal secara dinamis:
  - **Pilihan Ganda (Multiple Choice)**: Otomatis mendeteksi checkbox `- [ ]` dan opsi kunci jawaban `- [x]`.
  - **Isian Singkat (Short Answer)**: Mendeteksi kunci jawaban dengan baris penanda `Answer: [kunci]`. Mendukung beberapa alternatif jawaban dipisahkan dengan tanda `|`.
  - **Esai (Essay)**: Pertanyaan deskriptif terbuka tanpa kunci jawaban bawaan.
- **Dukungan Markdown & LaTeX Kaya**: Rendering teks tebal/miring, list, blok kode, tabel, tautan gambar, serta rumus matematika LaTeX (menggunakan KaTeX) secara instan.
- **Autosave Sempurna**: Menyimpan seluruh progres pengerjaan (jawaban, bendera ragu-ragu, sisa waktu, indeks soal aktif) ke `localStorage` browser. Sesi ujian dapat dilanjutkan kapan pun jika tab browser tidak sengaja tertutup.
- **Pintasan Keyboard (Keyboard Shortcuts)**: Navigasi cepat tanpa mouse menggunakan tombol arah dan pintasan pilihan jawaban.
- **Mode Layar Penuh (Fullscreen)**: Meminimalkan gangguan selama proses pengerjaan.
- **Ekspor Hasil Instan**: Selesai ujian, Anda dapat mengunduh laporan ringkasan hasil ujian berupa dokumen Markdown yang rapi beserta status kebenaran jawaban Anda.
- **Dukungan Bahasa (Multilingual)**: Mendukung penggantian bahasa (Inggris & Indonesia) secara langsung dalam aplikasi.

---

## Format Penulisan Markdown Ujian

Aplikasi mendeteksi metadata ujian menggunakan block YAML Frontmatter di bagian paling atas file, dilanjutkan dengan konten soal menggunakan heading tingkat 2 (`## Soal`).

Berikut adalah contoh format file `.md` ujian yang didukung:

```markdown
---
title: "Ujian Sains Dasar"
duration: 30
randomize_questions: true
randomize_choices: true
---

# Ujian Sains Dasar

Silakan kerjakan soal-soal di bawah ini dengan teliti.

## 1. Siapa penemu teori relativitas khusus?
- [ ] A. Isaac Newton
- [x] B. Albert Einstein
- [ ] C. Nikola Tesla
- [ ] D. Marie Curie

## 2. Hitunglah hasil dari integral berikut:
$$\int_{0}^{\pi} \sin(x) \, dx$$

- [ ] A. -1
- [ ] B. 0
- [ ] C. 1
- [x] D. 2

## 3. Berapakah nilai kecepatan cahaya dalam vakum (dalam m/s) jika dibulatkan?
Answer: 3x10^8 | 300000000 | 3 * 10^8

## 4. Jelaskan perbedaan mendasar antara pembelahan sel secara Mitosis dan Meiosis!
*(Ini adalah tipe soal Esai karena tidak memiliki pilihan ganda atau baris 'Answer:')*
```

### Penjelasan Deteksi:
1. **Frontmatter**:
   - `title`: Judul ujian yang akan ditampilkan.
   - `duration`: Batas waktu dalam menit (kosongkan atau isi `null` jika tidak ingin ada batas waktu).
   - `randomize_questions`: Diisi `true`/`false` untuk mengacak urutan soal saat ujian dimulai.
   - `randomize_choices`: Diisi `true`/`false` untuk mengacak urutan pilihan ganda di setiap soal.
2. **Pilihan Ganda**: Dideteksi dari adanya opsi list bertanda `- [ ]` atau `- [x]`. Karakter `[x]` menentukan kunci jawaban yang benar.
3. **Isian Singkat**: Dideteksi apabila ada baris yang diawali dengan kata kunci `Answer:`, `Key:`, `Jawab:`, atau `Jawaban:`. Anda dapat menuliskan beberapa opsi jawaban alternatif dengan pembatas pipa `|`.
4. **Esai**: Soal yang tidak memiliki list pilihan ganda maupun baris jawaban singkat otomatis dikategorikan sebagai esai (belum dinilai otomatis).

---

## Pintasan Keyboard Saat Ujian

Untuk pengalaman pengerjaan yang cepat, gunakan pintasan berikut:
- **Kembali ke Soal Sebelumnya**: Tekan tombol arah kiri `←`
- **Lanjut ke Soal Berikutnya**: Tekan tombol arah kanan `→`
- **Tandai Ragu-ragu (Flag/Bookmark)**: Tekan tombol `F`
- **Memilih Opsi Jawaban (Pilihan Ganda)**: Tekan tombol angka `1` s.d `5` ATAU huruf `A` s.d `E` untuk memilih opsi secara instan.
- **Lepaskan Fokus Teks**: Tekan tombol `Esc` jika Anda sedang memfokuskan kursor pada kotak input isian singkat/esai untuk kembali mengaktifkan navigasi pintasan keyboard.
