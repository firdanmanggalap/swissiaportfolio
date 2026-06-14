# Dive-Journey Background — Design Spec

**Tanggal:** 2026-06-14
**Project:** ocean-portfolio (portfolio calon guru SD, lihat spec 2026-06-13)
**Status:** Approved (brainstorming) — siap planning

---

## 1. Ringkasan

Mengganti background statis saat ini dengan **background scroll-driven "menyelam"**: satu nilai
`depth` (0 = permukaan, 1 = dasar laut) dihitung dari posisi scroll dan menggerakkan seluruh
adegan secara kontinu. Pengunjung seolah menyelam dari permukaan (langit, matahari, pulau,
kapal, burung) ke laut dalam (makhluk bercahaya) hingga dasar laut (dumbo octopus, koral, peti).

Tujuan: bikin portfolio jadi sebuah **pengalaman** yang berkesan, tetap **ringan** (terutama HP)
dan **tidak mengganggu keterbacaan konten**.

## 2. Tidak berubah (tetap dari versi sekarang)

Semua section/konten, nav + scroll-spy, lightbox galeri, kartu konten, interaksi
(ikan menjauh dari kursor, klik = letupan gelembung), favicon, README, deploy. Maskot ikan
tetap di Hero.

## 3. Mekanik inti: `depth`

- `depth = clamp(scrollY / (scrollHeight - innerHeight), 0, 1)`, dibaca tiap frame (mulus).
- Semua visual adalah fungsi dari `depth`:
  - **Warna air**: gradien atas/bawah di-interpolasi antar "depth stops" (lihat §6).
  - **Scene permukaan**: alpha penuh di `depth≈0`, memudar + parallax naik sampai hilang ~`depth 0.15`.
  - **Light rays** (sinar dari atas): intensitas turun seiring `depth`.
  - **Glow bioluminescence**: intensitas naik seiring `depth` (mulai ~0.5).
  - **Makhluk**: tiap jenis punya pita kedalaman (band) `[minD, maxD]`; hanya aktif saat
    `depth` berada dekat band-nya (culling, lihat §5).

## 4. Peta zona (depth → section)

| depth | Section | Isi |
|------:|---------|-----|
| 0.00–0.12 | Hero | langit + matahari + awan + pulau + kapal + burung + garis air |
| 0.12–0.30 | Tentang | tepat di bawah permukaan: sinar kuat, gelembung, ikan kecil |
| 0.30–0.50 | Pendidikan | tengah: kawanan ikan, ubur-ubur, kura-kura |
| 0.50–0.68 | Kompetensi | makin gelap, plankton mulai bercahaya |
| 0.68–0.86 | Karya | laut dalam: gelap, anglerfish, glow kuat |
| 0.86–1.00 | Kontak | dasar laut: pasir, koral, rumput laut, peti, **dumbo octopus** |

(Band makhluk pakai margin ±0.12 supaya muncul/hilang mulus melewati batas.)

## 5. Arsitektur kode

Pecah `js/ocean.js` jadi **ES modules** (jalan via http; deploy & preview pakai http):

```
js/
├── ocean.js              # entry tipis: import scene, init saat DOMContentLoaded
└── ocean/
    ├── depth.js          # getDepth(), lerp(), lerpColor(), color-stop lookup
    ├── surface.js        # gambar scene permukaan (sun, sky, awan, pulau, kapal, burung, garis air)
    ├── creatures.js      # definisi makhluk per band + spawn/cull/update/draw
    └── scene.js          # orchestrator: canvas setup, RAF loop, gradient air, light rays,
                          #   bubbles, interaksi pointer/klik, FPS throttle, visibility pause, reduced-motion
```

Tiap modul satu tanggung jawab, antarmuka jelas (mis. `surface.draw(ctx, depth, t, w, h)`,
`creatures.tick(ctx, depth, dt, pointer, w, h)`). `index.html` memuat `<script type="module" src="js/ocean.js">`.

## 6. Detail visual

### Warna air (depth color stops)
Interpolasi linear antar stop `{topColor, bottomColor}`:
- 0.00 `#aee9ff` → `#4fc4d4` (permukaan cerah)
- 0.15 `#2ea7be` → `#0f6f93`
- 0.35 `#0a4f73` → `#06314f`
- 0.55 `#06243c` → `#04182b`
- 0.80 `#03101f` → `#020a14` (abyss)
- 1.00 `#05131f` → `#0a2435` (semburat dasar berpasir)

### Scene permukaan (`surface.js`)
Matahari (lingkaran + halo lembut), gradien langit (bagian atas canvas), 2–3 awan elips
melayang, pulau (bukit + 1 pohon palem sederhana) dekat horizon, kapal kecil di garis air,
4–6 burung (bentuk "m" yang mengepak), garis permukaan air bergelombang halus. Semua
di-translate ke atas (parallax) dan alpha→0 saat menyelam.

### Makhluk per band (`creatures.js`)
| Jenis | Band | Catatan |
|------|------|---------|
| Ikan (school) | 0.10–0.50 | warna-warni, sirip mengibas |
| Ubur-ubur | 0.20–0.55 | berdenyut + glow lembut |
| Kura-kura | 0.15–0.45 | sirip mengepak |
| Plankton glow | 0.50–0.90 | titik kecil berkedip, alpha naik dgn depth |
| Anglerfish | 0.65–0.90 | umpan bercahaya di kepala (gemoy, tidak seram) |
| Dumbo octopus | 0.88–1.00 | "tuan rumah" dasar, telinga/sirip mengepak |
| Koral/rumput/peti/bintang laut | 0.90–1.00 | elemen statis dasar (menempel di bawah) |

Reuse gambar fish/jelly/octopus/turtle yang sudah ada; tambah anglerfish, dumbo octopus,
plankton, dan elemen dasar.

## 7. Keterbacaan konten (penting)

Karena background kini bisa terang (permukaan), **kartu konten dibuat gelap-frosted** (mis.
`rgba(6,22,38,0.55)` + blur) menggantikan putih-transparan, supaya teks terang selalu kontras
di semua kedalaman. Cek kontras WCAG AA di permukaan (paling kritis) dan abyss.

## 8. Performa

- **Culling per-band**: hanya update/draw makhluk yang band-nya dekat `depth` (±0.12) → jumlah
  objek aktif tetap kecil seperti versi sekarang.
- Pertahankan: cap DPR ≤2, FPS auto-throttle (kurangi jumlah objek bila <30fps), pause saat tab
  nonaktif, resize handling.
- Target: mulus di desktop & HP mid-range; tidak nge-freeze saat scroll cepat.

## 9. Aksesibilitas

`prefers-reduced-motion: reduce` → tanpa animasi/parallax. Tampilkan **satu frame statis** sesuai
`depth` saat itu (gradien air + sedikit makhluk diam + scene permukaan bila di atas). Scroll tetap
mengubah `depth` (boleh re-render on scroll, tanpa loop RAF terus-menerus).

## 10. Verifikasi

Karena statis & tanpa test framework: verifikasi via Chromium headless (executable bundled
Playwright) + screenshot di beberapa posisi scroll (0%, 25%, 50%, 75%, 100%) untuk desktop &
mobile, cek tidak ada error console, cek keterbacaan teks tiap zona, cek interaksi (lightbox,
scroll-spy) masih jalan.

## 11. Di luar lingkup

3D/WebGL, suara, perubahan konten/section, multi-bahasa. (Tetap canvas 2D ringan.)
