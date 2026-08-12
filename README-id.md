# Questionmarkd - Markdown Exam Runner

[English](README.md) | [Bahasa Indonesia](README-id.md)

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
- **Kembali ke Soal Sebelumnya**: Tekan tombol arah kiri `<-`
- **Lanjut ke Soal Berikutnya**: Tekan tombol arah kanan `->`
- **Tandai Ragu-ragu (Flag/Bookmark)**: Tekan tombol `F`
- **Memilih Opsi Jawaban (Pilihan Ganda)**: Tekan tombol angka `1` s.d `5` ATAU huruf `A` s.d `E` untuk memilih opsi secara instan.
- **Lepaskan Fokus Teks**: Tekan tombol `Esc` jika Anda sedang memfokuskan kursor pada kotak input isian singkat/esai untuk kembali mengaktifkan navigasi pintasan keyboard.

---

*[English Documentation](README.md)*
