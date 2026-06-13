# Ocean Portfolio — Design Spec

**Tanggal:** 2026-06-13
**Untuk:** Portfolio lamaran kerja **Calon Guru SD** (lulusan/mahasiswa PGSD)
**Status:** Approved (brainstorming) — siap masuk tahap planning

---

## 1. Ringkasan & Tujuan

Membangun **website portfolio satu halaman (single-page)** bertema laut dalam yang
gemoy/lucu, untuk keperluan **melamar kerja sebagai guru SD**.

Tujuan utama:

- Menampilkan profil, pengalaman mengajar, kompetensi, dan karya secara **profesional & mudah dibaca recruiter**.
- Memberi kesan **hangat, ceria, dan ramah anak** lewat tema ocean + animasi — menyiratkan bahwa pemilik asik & nyaman bekerja dengan anak-anak SD.
- **Mobile-friendly** (recruiter sering membuka lamaran lewat HP).
- Mudah di-deploy dan **mudah diisi/di-maintain sendiri** oleh pemilik (non-programmer-friendly: cukup ganti teks/gambar).

Prinsip kunci: **konten tetap raja**. Animasi & tema adalah bumbu yang menyenangkan,
bukan penghalang. Teks harus selalu jelas terbaca dan situs harus tetap cepat.

---

## 2. Tech Stack

- **HTML + CSS + JavaScript murni (vanilla).** Tanpa framework, tanpa build step.
- Alasan: ringan, cepat, deploy ke Vercel / GitHub Pages langsung jalan tanpa konfigurasi, dan gampang dirawat.
- Tidak ada dependency npm. Font di-load via Google Fonts (atau di-self-host bila perlu offline).
- Animasi makhluk laut & gelembung memakai **HTML5 `<canvas>`** + `requestAnimationFrame`.

---

## 3. Arah Visual

### Mood
Akuarium **laut dalam yang lucu**: latar biru pekat ke gelap dengan sinar matahari
menembus dari atas, gelembung naik perlahan, dan makhluk laut gemoy berenang santai.
Bukan suasana seram/misterius — melainkan ceria, lembut, dan menggemaskan.

### Palette
- **Dasar (latar):** biru laut dalam — gradien `#0a1a2f` (atas, lebih terang) → `#06182b` / `#041220` (bawah, lebih dalam).
- **Aksen cerah (gemoy):**
  - Coral pink `#ff7e9d`
  - Kuning lembut `#ffd56b`
  - Cyan glow / bioluminescence `#5fe0d8`
  - Aksen ungu lembut `#9b8cff` (opsional, untuk ubur-ubur)
- **Teks:** putih/krem lembut `#f4f9ff` untuk teks utama; abu-kebiruan `#a9c2d9` untuk teks sekunder.
- **Kartu konten:** panel "frosted glass" semi-transparan (`rgba(255,255,255,0.06–0.1)` + `backdrop-filter: blur`) dengan border tipis, supaya teks selalu kontras & terbaca di atas latar laut.

> Catatan kontras: pastikan kombinasi teks/latar memenuhi rasio kontras WCAG AA
> (≥ 4.5:1 untuk teks normal). Kartu frosted membantu menjamin ini.

### Tipografi
- **Heading:** font rounded yang ramah — *Fredoka* atau *Quicksand* (kesan ceria & ramah anak, tetap rapi).
- **Body:** font bersih & mudah dibaca — *Nunito* atau *Poppins*.
- Skala tipografi responsif (pakai `clamp()`), heading besar di hero, body 16–18px.

### Layout
- Single-page, scroll vertikal, dengan **navigasi sticky** (anchor ke tiap section) + scroll-spy (section aktif disorot).
- Tiap section punya container max-width (~1100px) dan padding generous; konten di dalam kartu frosted.
- Metafora "menyelam makin dalam" saat scroll: gradien latar makin gelap menuju bagian bawah halaman.

---

## 4. Section (urutan & isi)

Semua konten diisi **placeholder** yang gampang diganti. Disusun agar relevan untuk
lamaran kerja guru SD.

1. **Hero**
   - Foto profil (placeholder bulat), nama, tagline "Calon Guru SD" + 1 kalimat filosofi mengajar.
   - Tombol CTA: **Download CV** (link ke PDF placeholder) & **Kontak**.
   - Maskot lucu muncul (mis. ikan/gurita yang melambai).
   - Hint "scroll buat menyelam 🤿" + indikator scroll.

2. **Tentang Saya**
   - Bio singkat (2–3 paragraf placeholder) + foto.
   - Kotak "Filosofi Mengajar" yang menonjol.

3. **Pendidikan & Pengalaman Mengajar**
   - **Timeline vertikal** bergaya "menyelam" (item berurutan dari atas/dangkal ke bawah/dalam).
   - Entri: riwayat pendidikan (S1 PGSD, sekolah asal) + pengalaman (PPL, magang, mengajar les/bimbel, kegiatan relawan mengajar). Tiap entri: judul, tempat, tahun, deskripsi singkat.

4. **Kompetensi & Keahlian**
   - Disajikan sebagai "gelembung/koral" atau kartu kecil: penguasaan kurikulum (mis. Kurikulum Merdeka), pembuatan RPP/modul ajar, media pembelajaran, manajemen kelas, dan **soft skill** (sabar, komunikatif, kreatif).
   - Boleh ada bar/level indikator sederhana (opsional).

5. **Sertifikat, Karya & Galeri**
   - **Sertifikat & Penghargaan:** daftar kartu (nama sertifikat, penerbit, tahun).
   - **Karya:** contoh RPP / modul ajar / media pembelajaran (kartu dengan thumbnail + link).
   - **Galeri:** grid foto kegiatan mengajar; klik foto → tampil besar (lightbox sederhana).

6. **Kontak**
   - Email, WhatsApp, LinkedIn, lokasi (kota).
   - Tombol **Download CV**.
   - (Opsional) form kontak sederhana yang membuka `mailto:` — tanpa backend.
   - Footer kecil dengan hak cipta & nama.

---

## 5. Sistem Animasi

### Arsitektur
- **Satu `<canvas>` full-screen** sebagai layer latar (di belakang konten, `position: fixed`, `z-index` rendah, `pointer-events` diatur agar tetap menangkap posisi kursor tanpa memblok klik konten).
- Render loop tunggal via `requestAnimationFrame` mengelola semua objek (makhluk + gelembung).
- **Maskot** dibuat terpisah sebagai **SVG/elemen DOM** agar detail & ekspresif (bisa animasi CSS: melambai, mengedip).
- Sinar cahaya dari atas & gradien kedalaman → **CSS** (gradient + elemen blur), bukan canvas, agar hemat.

### Objek makhluk (di canvas)
- Jenis: ikan kecil (beberapa warna), ubur-ubur (berdenyut, glow), gurita kecil, kura-kura, paus mini.
- Tiap objek punya posisi, kecepatan, arah, fase animasi (mis. kibasan sirip/denyut), dan gaya gambar masing-masing.
- Gelembung: muncul dari bawah, naik dengan sedikit goyangan horizontal, lalu hilang/di-recycle.

### Interaktivitas
- **Reaksi kursor:** ikan di dekat kursor sedikit menjauh/berbelok (atau satu jenis "penasaran" mendekat). Lembut, tidak agresif.
- **Klik:** memunculkan letupan gelembung kecil di titik klik.
- **Scroll:** kepadatan/kedalaman bisa sedikit berubah (makin ke bawah, suasana makin "dalam").
- Maskot bisa bereaksi saat di-hover.

### Performa & Aksesibilitas (WAJIB)
- Hormati `prefers-reduced-motion: reduce` → matikan/minimalkan animasi, tampilkan latar statis yang tetap cantik.
- **Auto-throttle:** pantau FPS; bila turun (mis. < 30), kurangi jumlah objek otomatis.
- Batasi jumlah objek default agar ringan di HP (mis. ~15–25 makhluk + ~30 gelembung, di-scale sesuai lebar layar / device).
- `canvas` di-resize mengikuti viewport (dengan devicePixelRatio handling) dan di-pause saat tab tidak aktif (`visibilitychange`).
- Jangan jalankan animasi berat saat section tidak terlihat bila memungkinkan.

---

## 6. Struktur Proyek (file)

```
ocean-portfolio/
├── index.html              # struktur semua section
├── css/
│   └── style.css           # styling, palette, layout, animasi CSS (sinar, frosted, transisi)
├── js/
│   ├── ocean.js            # engine canvas: makhluk, gelembung, interaksi, performa
│   ├── mascot.js           # logika maskot (opsional, bisa digabung)
│   └── main.js             # navigasi, scroll-spy, lightbox galeri, reduced-motion
├── assets/
│   ├── img/                # foto profil, galeri, thumbnail karya (placeholder)
│   ├── cv/                 # CV.pdf (placeholder)
│   └── favicon.svg         # favicon ocean lucu
├── docs/superpowers/specs/ # spec ini
└── README.md               # cara isi konten & cara deploy
```

> Catatan: pemecahan JS menjadi beberapa file menjaga tiap file fokus & mudah dipahami.
> Bila salah satu file membengkak saat implementasi, pecah lagi sesuai tanggung jawabnya.

---

## 7. Model Konten (Placeholder)

- Semua teks, nama, tahun, dan tautan diisi placeholder yang jelas ditandai (mis. `Nama Lengkap`, `[email kamu]`, `2021 — Sekarang`).
- Gambar memakai placeholder (warna solid / ilustrasi sederhana / `placehold`-style) berukuran tepat agar layout tidak bergeser saat diganti.
- README menjelaskan **di mana & bagaimana** mengganti tiap konten (foto, CV, teks, link sosial) tanpa perlu paham koding.

---

## 8. Responsiveness

- Mobile-first; uji di lebar 360px, 768px, 1024px, 1440px.
- Navigasi: menu hamburger di layar kecil.
- Timeline & grid menyesuaikan jadi satu kolom di mobile.
- Jumlah objek animasi & efek blur diturunkan di perangkat kecil demi performa & baterai.

---

## 9. Deployment

- Karena statis, bisa langsung:
  - **Vercel** (drag/drop folder atau hubungkan repo) — output directory = root.
  - atau **GitHub Pages**.
- Preview lokal saat development: `python3 -m http.server <port>` di mesin remote, lalu **SSH port forwarding** (`ssh -L <port>:localhost:<port> ...`) agar bisa dibuka di browser laptop. (Atau Playwright untuk screenshot.)

---

## 10. Verifikasi / Testing

Karena tanpa framework test, verifikasi dilakukan manual + tooling ringan:

- Render & layout dicek via Playwright (screenshot desktop + mobile viewport).
- Cek tidak ada error di console.
- Cek interaksi: scroll-spy aktif, lightbox galeri buka/tutup, tombol CV/kontak mengarah benar, reaksi kursor/klik canvas jalan.
- Cek `prefers-reduced-motion` (animasi mati saat diaktifkan).
- Cek kontras teks & keterbacaan di atas latar.
- Cek responsif di beberapa lebar.

---

## 11. Di Luar Lingkup (Out of Scope) / Ide Masa Depan

- Backend / form kontak dengan database (cukup `mailto:` untuk sekarang).
- CMS / admin panel.
- Multi-bahasa (default Bahasa Indonesia).
- Blog / artikel.
- Animasi 3D WebGL berat (kita pakai canvas 2D yang ringan).

Ide masa depan (bila diminta): mode terang/gelap, multi-bahasa (ID/EN), integrasi
form kontak via layanan pihak ketiga (mis. Formspree), efek suara ambient laut (toggle).
