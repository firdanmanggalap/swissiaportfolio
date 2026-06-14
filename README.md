# 🌊 Ocean Portfolio — Calon Guru SD

Portfolio satu halaman bertema laut dalam yang lucu, untuk lamaran kerja guru SD.
Dibangun dengan HTML/CSS/JS murni — **tanpa build step**, tinggal buka/deploy.

## 🚀 Menjalankan secara lokal

```bash
python3 -m http.server 5500 --directory .
```
Buka `http://localhost:5500`.

**Akses lewat SSH (mis. dari HP/Termux):** forward port-nya dari laptop/HP kamu:
```bash
ssh -L 5500:localhost:5500 user@host-remote
```
Lalu jalanin server di remote dan buka `http://localhost:5500` di browser lokal.

## ✏️ Cara mengganti konten

Semua isi adalah **placeholder** di dalam `index.html`. Cari teks dalam `[kurung siku]`
atau "Nama Lengkap" dan ganti dengan datamu:

| Bagian | Di mana (`index.html`) | Ganti apa |
|--------|------------------------|-----------|
| Nama & judul tab | `<title>` + `.nav__brand` + `.hero__name` | Nama lengkap |
| Filosofi/tagline | `.hero__tag`, `.about__philos` | Kalimat filosofi mengajarmu |
| Tentang | `.about__text` | Bio 2–3 kalimat |
| Foto | `.about__photo` | Ganti `<span>` jadi `<img src="assets/img/foto.jpg" alt="Foto kamu">` |
| Pendidikan & Pengalaman | `.timeline` | Tahun, judul, tempat, deskripsi tiap `.timeline__item` |
| Kompetensi | `.chips li` | Tambah/ganti keahlian |
| Sertifikat & Karya | `.cert`, `.work` | Nama sertifikat, penerbit, tahun, judul karya |
| Galeri | `.gallery__item` | Lihat "Menambahkan foto" di bawah |
| Kontak | `.contact__list` | Email, WhatsApp, LinkedIn, kota |

### 📄 Menambahkan CV
Taruh file CV-mu di `assets/cv/CV.pdf`. Tombol "Download CV" otomatis mengarah ke sana.

### 🖼️ Menambahkan foto galeri
Taruh foto di `assets/img/`, lalu ubah tombol galeri di `index.html`:
```html
<button class="gallery__item" data-caption="Mengajar di kelas 3"
        data-src="assets/img/kegiatan1.jpg">
  <img src="assets/img/kegiatan1.jpg" alt="Mengajar di kelas 3" style="width:100%;height:100%;object-fit:cover;border-radius:14px">
</button>
```
Atribut `data-src` membuat foto tampil besar (lightbox) saat diklik.

## 🎨 Mengubah warna / font
Edit variabel di bagian atas `css/style.css` (`:root { ... }`).

## 🤿 Background "menyelam"
Background bereaksi ke scroll: makin ke bawah = makin dalam (permukaan → tengah → dasar laut).
Kode-nya di `js/ocean/` (ES modules — **harus diakses lewat http**, bukan buka file langsung):
- `depth.js` — warna air per kedalaman (ubah array `STOPS`).
- `surface.js` — scene permukaan (matahari, pulau, kapal, burung).
- `creatures.js` — makhluk per kedalaman (ubah `BANDS`: rentang `min`/`max` & `count`) + dasar laut (dumbo octopus, koral, peti).
- `scene.js` — mesin: gradient air, sinar, glow, interaksi, performa.

Tips debug: tambah `?depth=0.7` di URL buat memaksa tampilan kedalaman tertentu (mis. `localhost:5500/?depth=1` langsung lihat dasar laut).

## ☁️ Deploy

- **Vercel:** import repo → Framework Preset: **Other** → Output Directory: **`./`** (root). Selesai.
- **GitHub Pages:** Settings → Pages → Source: branch (root).

## ♿ Aksesibilitas & performa
- Hormati `prefers-reduced-motion` (animasi mati otomatis untuk yang sensitif).
- Animasi auto-throttle kalau FPS turun, dan pause saat tab tidak aktif.
