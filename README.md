# Kodie Lab — Prototipe Playground Coding SD–SMA (100% Client-Side)

Prototipe mandiri (*standalone*) **Kodie Lab** untuk menguji pengalaman belajar dan eksekusi kode multi-bahasa **100% di browser tanpa backend** bagi pelajar jenjang **SD, SMP, hingga SMA**, siap di-handoff dan diintegrasikan ke repositori utama **Kodie**.

---

## 1. Cara Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173` di browser. Untuk memverifikasi build produksi & tipe TypeScript:

```bash
npx tsc --noEmit
npm run build
```

---

## 2. Arsitektur Folder (Modular & Siap Handoff)

```text
src/
├── config/
│   └── brand.ts                # Slot aset logo Kodie & avatar Kiko + pemetaan jenjang/track
├── types/
│   └── lab.ts                  # Kontrak tipe TypeScript (GradeLevel, TrackId, KodieLabProps, AuthGate, dll.)
├── data/
│   ├── quickInsert.ts          # Tombol Sisip Cepat sesuai bahasa & file aktif
│   └── templates.ts            # Kurikulum latihan SD, SMP, SMA (Gratis, Advance, Kanvas Bebas)
├── runners/
│   ├── cdnLoader.ts            # Lazy-loader skrip eksternal (on-demand + fallback)
│   ├── blockRunner.ts          # Blok visual Blockly SD + transpiler "Intip Kode Python"
│   ├── webRunner.ts            # Builder srcdoc iframe sandbox + bridge console via postMessage
│   ├── pythonRunner.ts         # Pyodide WebAssembly (stdout, stderr, input() via stdin)
│   ├── turtleRunner.ts         # Modul virtual `turtle` di Pyodide -> command vektor HTML5 Canvas
│   ├── cppRunner.ts            # JSCPP interpreter untuk C++ SMA & latihan OSN
│   ├── sqlRunner.ts            # sql.js SQLite WebAssembly in-memory
│   ├── tsRunner.ts             # Compiler TypeScript 5.8 browser + strict type diagnostics
│   ├── apiRunner.ts            # Mini REST API server router & runtime tester in-browser
│   ├── networkRunner.ts        # Parser Cisco IOS CLI & evaluator topologi jaringan
│   ├── iotRunner.ts            # Simulator Board ESP32/Arduino + loop/sensor frame generator
│   └── aiRunner.ts             # Pyodide ML helper (`kodie_ai`) regresi, bar chart & metrik
├── utils/
│   ├── errorExplainer.ts       # Penerjemah error teknis menjadi penjelasan ramah siswa dari Kiko
│   ├── missionEvaluator.ts     # Evaluator misi hybrid (statis real-time + verifikasi runtime)
│   └── storage.ts              # Auto-save kode, preferensi, XP, dan Proyek Saya di localStorage
└── components/lab/
    ├── BrandLogo.tsx           # Logo Kodie (otomatis baca gambar kustom atau SVG fallback)
    ├── KikoAvatar.tsx          # Avatar ekspresif Kiko (idle/happy/thinking/error/celebrate)
    ├── LabHeader.tsx           # Navbar terintegrasi + switcher jenjang SD/SMP/SMA + Grid Lab Picker + ID/EN
    ├── KikoMissionBar.tsx      # Bilah misi, 3 checklist real-time, +XP badge, Petunjuk & Solusi
    ├── BlocklyEditorPane.tsx   # Kanvas Blockly SD + drawer "Intip Kode Python"
    ├── CodeEditorPane.tsx      # Editor CodeMirror 6 + Auto-Save + Sisip Cepat + Inline Reset Popover
    ├── TurtleCanvas.tsx        # Renderer HTML5 Canvas HiDPI + pengatur kecepatan & grid
    ├── SqlResultTable.tsx      # Tabel hasil SQL responsif + ringkasan baris terpengaruh
    ├── ApiTesterPane.tsx       # Mini Postman REST API tester & JSON response viewer
    ├── NetworkSimulatorPane.tsx # Topologi jaringan SVG interaktif + replay animasi paket ping
    ├── IotSimulatorPane.tsx    # Visual board ESP32 virtual (LED, Buzzer, LCD 16x2, sensor slider)
    ├── AiDataPane.tsx          # Grafik regresi linear + slider prediksi live & evaluasi klasifikasi
    ├── OutputPane.tsx          # Panel output adaptif per bahasa + Kotak Penjelasan Kiko
    ├── AuthGateModal.tsx       # Modal pembatas Tamu vs Akun Siswa (demo login / hook LMS)
    ├── MyProjectsModal.tsx     # Simpan/buka/hapus banyak proyek di localStorage
    └── KodieLab.tsx            # Komponen root siap pakai untuk halaman `/lab` atau embed LMS
```

---

## 3. Daftar Bahasa & Runtime Client-Side

| Track | Jenjang Kurasi | Runtime / Engine | Strategi Muat |
| :--- | :--- | :--- | :--- |
| **Block Coding** (`blocks`) | SD | `blockly` v13 (`zelos`) + engine instan | Dynamic chunk saat track dipilih |
| **Python Turtle** (`turtle`) | SD, SMP | Pyodide `v0.27.5` + HTML5 `<canvas>` | Lazy-load CDN on-demand |
| **Web Stack** (`web`) | SD, SMP, SMA | `<iframe sandbox="allow-scripts allow-modals">` | Native browser |
| **Python 3** (`python`) | SMP, SMA | Pyodide `v0.27.5` WebAssembly | Lazy-load CDN on-demand |
| **C++ (OSN)** (`cpp`) | SMA | `JSCPP` `2.0.9` (GitHub Pages + fallback jsDelivr GH) | Lazy-load CDN on-demand |
| **SQL** (`sql`) | SMP, SMA | `sql.js` `1.17.0` SQLite WebAssembly | Lazy-load CDN on-demand |
| **TypeScript** (`typescript`) | SMA | `typescript` `5.8.3` Compiler API | Lazy-load CDN on-demand |
| **Software API** (`software_api`) | SMA & SMP Peminatan (🔒) | Mini REST API + Postman Tester | Lazy-load TS Compiler |
| **Jaringan Cisco** (`network`) | SMA & SMP Peminatan (🔒) | Cisco IOS CLI + Topologi Interaktif | Instan client-side |
| **IoT Virtual** (`iot`) | SMA & SMP Peminatan (🔒) | Simulator Board ESP32/Arduino + Sensor | Instan client-side |
| **AI & Data** (`ai_data`) | SMA & SMP Peminatan (🔒) | Pyodide ML (`kodie_ai`) + Grafik | Lazy-load Pyodide WASM |

---

## 4. Cara Mengganti Logo Kodie & Maskot Kiko

1. Letakkan aset PNG/SVG resmi Anda di folder `public/assets/` (misal `public/assets/kodie-logo-light.svg`, `public/assets/kiko-idle.png`, dst.).
2. Buka [src/config/brand.ts](src/config/brand.ts) dan isi URL path di `BRAND_CONFIG`:

```ts
export const BRAND_CONFIG = {
  appName: 'Kodie',
  labLabel: 'LAB',
  logoLightSrc: '/assets/kodie-logo-light.svg',
  logoDarkSrc: '/assets/kodie-logo-dark.svg',
  kikoName: 'Kiko',
  kikoAvatars: {
    idle: '/assets/kiko-idle.png',
    happy: '/assets/kiko-happy.png',
    thinking: '/assets/kiko-thinking.png',
    error: '/assets/kiko-error.png',
    celebrate: '/assets/kiko-celebrate.png',
  },
};
```

Jika salah satu bernilai `null`, komponen otomatis menampilkan SVG fallback bawaan Kodie.

---

## 5. Panduan Integrasi ke Repositori Utama Kodie

### A. Penggunaan sebagai Halaman `/lab` atau Embedded Component

Komponen utama `<KodieLab />` menerima props berikut (`src/types/lab.ts`):

```tsx
<KodieLab
  initialGrade="smp"
  initialTrack="python"
  initialTemplateId="smp-py-grade"
  user={currentUser} // null jika tamu, atau objek LabUser jika sudah login
  onRequireLogin={(reason) => navigate(`/login?reason=${reason}`)}
  onMissionComplete={({ templateId, xpEarned }) => saveXpToApi(templateId, xpEarned)}
  onCodeChange={({ track, files }) => syncDraftIfNeeded(track, files)}
  embedded={false}
/>
```

### B. Deep-Linking via URL Query Parameters

Saat digunakan langsung sebagai halaman standalone (`domain.com/lab`), Kodie Lab membaca query parameter berikut:
- `?level=sd|smp|sma`
- `?track=blocks|turtle|web|python|cpp|sql|typescript|software_api|network|iot|ai_data`
- `?template=<template-id>` (contoh: `?level=sma&track=cpp&template=sma-cpp-array`)

### C. Kontrak `AuthGate` (Tamu vs Siswa Login)
- Jika prop `user` tidak diberikan (`undefined`), prototipe mengaktifkan toggle **Mode Tamu / Siswa Demo** bawaan untuk pengujian lokal.
- Saat diintegrasikan dengan auth produksi Kodie, cukup teruskan `user={sessionUser ?? null}` dan tangani `onRequireLogin(reason)` (bernilai `'advance_mission' | 'my_projects' | 'download_file' | 'view_solution' | 'save_xp' | 'specialization_lab'`) untuk mengarahkan pengguna ke halaman login/register Anda.

---

## 6. Hosting Sementara di Vercel

Proyek ini **100% static client-side SPA** (semua runtime seperti Pyodide, sql.js, JSCPP, Blockly, dan TypeScript Compiler berjalan di browser siswa tanpa server/database tambahan), sehingga bisa langsung di-deploy gratis ke Vercel:

1. Masuk ke [vercel.com](https://vercel.com) → **Add New Project** → pilih repositori GitHub `masean24/kolabs`.
2. Konfigurasi build otomatis terbaca dari `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**: tidak perlu diisi (kosong).
3. Klik **Deploy**. Setelah live, deep-link (misal `?level=sma&track=ai_data`) bekerja otomatis. Selama belum disambungkan ke auth & API backend utama, data **Siswa Demo**, **XP**, dan **Proyek Saya** tersimpan di `localStorage` browser masing-masing pengguna.
