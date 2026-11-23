import type { GradeLevel, KikoMood, TrackId } from '../types/lab';

/**
 * Konfigurasi aset brand Kodie & maskot Kiko.
 *
 * Cara mengganti dengan aset resmi Anda:
 * 1. Letakkan file gambar (PNG/SVG/WebP) di `public/assets/`, misalnya:
 *    - `public/assets/kodie-logo-light.svg`
 *    - `public/assets/kodie-logo-dark.svg`
 *    - `public/assets/kiko-idle.png`
 * 2. Ganti nilai `null` di bawah dengan path seperti `'/assets/kodie-logo-light.svg'`.
 *    Jika bernilai `null` atau gambar gagal dimuat, komponen otomatis menampilkan SVG fallback.
 */
export const BRAND_CONFIG = {
  appName: 'Kodie',
  labLabel: 'LAB',
  logoLightSrc: null as string | null,
  logoDarkSrc: null as string | null,
  kikoName: 'Kiko',
  kikoAvatars: {
    idle: null as string | null,
    happy: null as string | null,
    thinking: null as string | null,
    error: null as string | null,
    celebrate: null as string | null,
  } satisfies Record<KikoMood, string | null>,
};

export interface GradeMeta {
  id: GradeLevel;
  label: string;
  shortLabel: string;
  ageHint: string;
  tagline: string;
}

export const GRADE_META: Record<GradeLevel, GradeMeta> = {
  sd: {
    id: 'sd',
    label: 'SD (Kelas 1–6)',
    shortLabel: 'SD',
    ageHint: 'Visual & Bermain',
    tagline: 'Susun blok warna-warni & gambar bareng Kiko!',
  },
  smp: {
    id: 'smp',
    label: 'SMP (Kelas 7–9)',
    shortLabel: 'SMP',
    ageHint: 'Eksplorasi Web & Python',
    tagline: 'Bangun web interaktif, grafik Turtle, Python & SQL dasar.',
  },
  sma: {
    id: 'sma',
    label: 'SMA (Kelas 10–12)',
    shortLabel: 'SMA',
    ageHint: 'OSN & Jurusan IT',
    tagline: 'OSN C++, Data & Simulasi Jurusan IT (Software, Jaringan, IoT, AI).',
  },
};

export const GRADE_TRACKS: Record<GradeLevel, TrackId[]> = {
  sd: ['blocks', 'turtle', 'web'],
  smp: ['web', 'python', 'turtle', 'sql'],
  sma: ['python', 'cpp', 'sql', 'typescript', 'web'],
};

export const SPECIALIZATION_TRACKS: TrackId[] = [
  'software_api',
  'network',
  'iot',
  'ai_data',
];

export const ALL_TRACK_ORDER: TrackId[] = [
  'blocks',
  'turtle',
  'web',
  'python',
  'cpp',
  'sql',
  'typescript',
  'software_api',
  'network',
  'iot',
  'ai_data',
];

export interface TrackMeta {
  id: TrackId;
  label: string;
  shortLabel: string;
  fileName: string;
  badge: string;
  runtimeLabel: string;
  description: string;
  supportsStdin: boolean;
  supportsAutoRun: boolean;
  accentClass: string;
  isSpecialization?: boolean;
  requiresAuth?: boolean;
  programColorHex?: string;
}

export const TRACK_META: Record<TrackId, TrackMeta> = {
  blocks: {
    id: 'blocks',
    label: 'Block Coding',
    shortLabel: 'Blok Visual',
    fileName: 'blocks.json',
    badge: 'Blockly',
    runtimeLabel: 'Blockly Engine',
    description: 'Susun blok logika & gambar di kanvas Kiko tanpa takut salah ketik.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  },
  turtle: {
    id: 'turtle',
    label: 'Python Turtle',
    shortLabel: 'Turtle',
    fileName: 'turtle_art.py',
    badge: 'Pyodide Canvas',
    runtimeLabel: 'Pyodide + Canvas',
    description: 'Gambar pola bintang, rumah, dan geometri pakai perintah Python.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  },
  web: {
    id: 'web',
    label: 'Web Stack',
    shortLabel: 'HTML/CSS/JS',
    fileName: 'index.html',
    badge: 'Live Sandbox',
    runtimeLabel: 'Iframe Sandbox',
    description: 'Bangun halaman web interaktif dengan HTML, CSS, dan JavaScript.',
    supportsStdin: false,
    supportsAutoRun: true,
    accentClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
  },
  python: {
    id: 'python',
    label: 'Python',
    shortLabel: 'Python',
    fileName: 'main.py',
    badge: 'Pyodide WASM',
    runtimeLabel: 'Pyodide WebAssembly',
    description: 'Jalankan Python 3 lengkap di browser dengan dukungan input().',
    supportsStdin: true,
    supportsAutoRun: false,
    accentClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
  },
  cpp: {
    id: 'cpp',
    label: 'C++ (OSN)',
    shortLabel: 'C++',
    fileName: 'main.cpp',
    badge: 'JSCPP',
    runtimeLabel: 'JSCPP Interpreter',
    description: 'Latihan algoritma Informatika SMA & OSN dengan cin dan cout.',
    supportsStdin: true,
    supportsAutoRun: false,
    accentClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
  },
  sql: {
    id: 'sql',
    label: 'SQL (SQLite)',
    shortLabel: 'SQL',
    fileName: 'query.sql',
    badge: 'sql.js WASM',
    runtimeLabel: 'SQLite WebAssembly',
    description: 'Kelola tabel dan jalankan query SELECT, WHERE, GROUP BY, hingga JOIN.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30',
  },
  typescript: {
    id: 'typescript',
    label: 'TypeScript',
    shortLabel: 'TypeScript',
    fileName: 'main.ts',
    badge: 'TS Compiler',
    runtimeLabel: 'TypeScript 5.8 Browser',
    description: 'Cek tipe data secara ketat dan jalankan JavaScript hasil kompilasi.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  },
  software_api: {
    id: 'software_api',
    label: 'Software API',
    shortLabel: 'Software API',
    fileName: 'server.ts',
    badge: 'Mini REST API',
    runtimeLabel: 'REST API + Tester',
    description: 'Rancang endpoint REST API & uji request GET/POST seperti Postman.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    isSpecialization: true,
    requiresAuth: true,
    programColorHex: '#60A5FA',
  },
  network: {
    id: 'network',
    label: 'Jaringan Cisco',
    shortLabel: 'Jaringan',
    fileName: 'router_config.ios',
    badge: 'Cisco IOS Sim',
    runtimeLabel: 'Cisco IOS + Topologi',
    description: 'Konfigurasi router Cisco IOS & uji ping di topologi interaktif.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-blue-600/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
    isSpecialization: true,
    requiresAuth: true,
    programColorHex: '#2563EB',
  },
  iot: {
    id: 'iot',
    label: 'IoT Virtual',
    shortLabel: 'IoT',
    fileName: 'sketch.ino',
    badge: 'ESP32 / Arduino',
    runtimeLabel: 'Board ESP32 Virtual',
    description: 'Program LED, Buzzer, LCD & sensor suhu/cahaya secara virtual.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-lime-500/20 text-lime-800 dark:text-lime-300 border-lime-500/40',
    isSpecialization: true,
    requiresAuth: true,
    programColorHex: '#D7FF73',
  },
  ai_data: {
    id: 'ai_data',
    label: 'AI & Data',
    shortLabel: 'AI & Data',
    fileName: 'model_ai.py',
    badge: 'Pyodide ML',
    runtimeLabel: 'Pyodide ML + Grafik',
    description: 'Latih regresi linear & klasifikasi teks dengan grafik prediksi live.',
    supportsStdin: false,
    supportsAutoRun: false,
    accentClass: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-400/40',
    isSpecialization: true,
    requiresAuth: true,
    programColorHex: '#94A3B8',
  },
};
