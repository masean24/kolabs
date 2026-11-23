import { useEffect, useRef, useState } from 'react';
import {
  Blocks,
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Code2,
  Cpu,
  Database,
  FileCode2,
  FolderKanban,
  Globe,
  GraduationCap,
  Layers,
  Lock,
  LogOut,
  Moon,
  Network,
  ServerCog,
  Sparkles,
  Sun,
  Terminal,
  UserCheck,
  X,
} from 'lucide-react';
import {
  ALL_TRACK_ORDER,
  GRADE_META,
  GRADE_TRACKS,
  SPECIALIZATION_TRACKS,
  TRACK_META,
} from '../../config/brand';
import type {
  GradeLevel,
  LabTemplate,
  LabUser,
  TrackId,
} from '../../types/lab';
import { BrandLogo } from './BrandLogo';

interface LabHeaderProps {
  grade: GradeLevel;
  track: TrackId;
  templateId: string;
  templates: LabTemplate[];
  showAllTracks: boolean;
  showSmpSpecialization: boolean;
  fontSize: number;
  theme: 'light' | 'dark';
  uiLang: 'id' | 'en';
  user: LabUser | null;
  totalXp: number;
  savedProjectsCount: number;
  embedded?: boolean;
  onSelectGrade: (grade: GradeLevel) => void;
  onSelectTrack: (track: TrackId) => void;
  onToggleShowAllTracks: () => void;
  onToggleSmpSpecialization: () => void;
  onSelectTemplate: (template: LabTemplate) => void;
  onFontSizeChange: (delta: number) => void;
  onToggleTheme: () => void;
  onChangeUiLang: (lang: 'id' | 'en') => void;
  onOpenMyProjects: () => void;
  onAuthAction: () => void;
  onRegisterAction: () => void;
  onNavPlaceholderClick?: (label: string) => void;
}

const TRACK_ICONS: Record<TrackId, typeof Code2> = {
  blocks: Blocks,
  turtle: Sparkles,
  web: Globe,
  python: Terminal,
  cpp: Code2,
  sql: Database,
  typescript: FileCode2,
  software_api: ServerCog,
  network: Network,
  iot: Cpu,
  ai_data: BrainCircuit,
};

const HEADER_COPY: Record<
  'id' | 'en',
  {
    navProgram: string;
    navClasses: string;
    navInterest: string;
    activeBadge: string;
    login: string;
    register: string;
    switchLab: string;
    pickerHeading: string;
    allLangs: string;
    byGrade: string;
    sectionCore: string;
    sectionSpec: string;
    smpTrackBtn: string;
    smpTrackOn: string;
    smpTrackOff: string;
    myProjects: string;
    loginTag: string;
  }
> = {
  id: {
    navProgram: 'Program',
    navClasses: 'Kelas',
    navInterest: 'Tes minat',
    activeBadge: 'Aktif',
    login: 'Masuk',
    register: 'Daftar',
    switchLab: 'Ganti Lab',
    pickerHeading: 'Pilih Lab & Compiler',
    allLangs: '+ Semua Bahasa',
    byGrade: 'Sesuai Jenjang',
    sectionCore: 'Bahasa & Lab Pemrograman',
    sectionSpec: 'Simulasi Jurusan IT (SMA & Peminatan SMP)',
    smpTrackBtn: 'Minat Jurusan IT',
    smpTrackOn: '✓ Minat IT Aktif',
    smpTrackOff: '+ Aktifkan Minat IT',
    myProjects: 'Proyek Saya',
    loginTag: 'Login',
  },
  en: {
    navProgram: 'Programs',
    navClasses: 'Classes',
    navInterest: 'Interest Test',
    activeBadge: 'Active',
    login: 'Log in',
    register: 'Sign up',
    switchLab: 'Switch Lab',
    pickerHeading: 'Choose Lab & Compiler',
    allLangs: '+ All Languages',
    byGrade: 'By Grade',
    sectionCore: 'Programming Languages & Labs',
    sectionSpec: 'IT Major Simulations (High School & Middle Track)',
    smpTrackBtn: 'IT Major Track',
    smpTrackOn: '✓ IT Track Active',
    smpTrackOff: '+ Enable IT Track',
    myProjects: 'My Projects',
    loginTag: 'Sign in',
  },
};

export function LabHeader({
  grade,
  track,
  templateId,
  templates,
  showAllTracks,
  showSmpSpecialization,
  fontSize,
  theme,
  uiLang,
  user,
  totalXp,
  savedProjectsCount,
  embedded = false,
  onSelectGrade,
  onSelectTrack,
  onToggleShowAllTracks,
  onToggleSmpSpecialization,
  onSelectTemplate,
  onFontSizeChange,
  onToggleTheme,
  onChangeUiLang,
  onOpenMyProjects,
  onAuthAction,
  onRegisterAction,
  onNavPlaceholderClick,
}: LabHeaderProps) {
  const [labPickerOpen, setLabPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement | null>(null);

  const coreTracks = showAllTracks
    ? ALL_TRACK_ORDER.filter((t) => !TRACK_META[t].isSpecialization)
    : GRADE_TRACKS[grade];
  const showSpecSection =
    grade === 'sma' || (grade === 'smp' && showSmpSpecialization);
  const gradeOptions: GradeLevel[] = ['sd', 'smp', 'sma'];

  const activeMeta = TRACK_META[track];
  const ActiveIcon = TRACK_ICONS[track];
  const copy = HEADER_COPY[uiLang];

  // Tutup popover Lab Picker saat klik di luar atau menekan Escape
  useEffect(() => {
    if (!labPickerOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setLabPickerOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLabPickerOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [labPickerOpen]);

  return (
    <header className="sticky top-0 z-40">
      {/* =====================================================================
          1. MAIN WEBSITE NAVBAR (SELARAS DENGAN LANDING PAGE KODIE)
         ===================================================================== */}
      {!embedded && (
        <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-5">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavPlaceholderClick?.('Beranda Kodie (/)');
              }}
              className="shrink-0 focus:outline-none"
            >
              <BrandLogo theme={theme} />
            </a>

            {/* Menu Navigasi Web Utama */}
            <nav
              className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex dark:text-slate-300"
              aria-label="Navigasi Utama Kodie"
            >
              {[
                { label: copy.navProgram, href: '/#program' },
                { label: copy.navClasses, href: '/#kelas' },
                { label: copy.navInterest, href: '/tes-minat' },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavPlaceholderClick?.(item.href);
                  }}
                  className="py-1.5 transition hover:text-[#1E4ED8] dark:hover:text-blue-400"
                >
                  {item.label}
                </a>
              ))}

              <a
                href="/labs"
                onClick={(e) => e.preventDefault()}
                className="relative inline-flex items-center gap-1.5 py-1.5 font-bold text-[#1E4ED8] dark:text-blue-400"
              >
                <span>Kodie Lab</span>
                <span className="rounded-full bg-[#D9F952] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A]">
                  {copy.activeBadge}
                </span>
                <span className="absolute inset-x-0 -bottom-[17px] h-[3px] rounded-full bg-[#1E4ED8] dark:bg-blue-400" />
              </a>
            </nav>

            {/* Aksi Kanan Navbar Utama */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* Toggle Bahasa ID / EN */}
              <div className="hidden items-center rounded-full border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-extrabold sm:inline-flex dark:border-slate-700 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => onChangeUiLang('id')}
                  className={`rounded-full px-2.5 py-1 transition ${
                    uiLang === 'id'
                      ? 'bg-[#1E4ED8] text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  ID
                </button>
                <button
                  type="button"
                  onClick={() => onChangeUiLang('en')}
                  className={`rounded-full px-2.5 py-1 transition ${
                    uiLang === 'en'
                      ? 'bg-[#1E4ED8] text-white'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                >
                  EN
                </button>
              </div>

              {/* Toggle Tema Light / Dark */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-[#1E4ED8] hover:text-[#1E4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300"
                title={
                  theme === 'light'
                    ? 'Aktifkan Dark Mode'
                    : 'Aktifkan Light Mode'
                }
                aria-label="Toggle Light/Dark Mode"
              >
                {theme === 'light' ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
              </button>

              {/* Auth Navbar: Masuk / Daftar vs Siswa Demo */}
              {user ? (
                <button
                  type="button"
                  onClick={onAuthAction}
                  className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-[#EFF6FF] px-3.5 py-1.5 text-xs font-bold text-[#0F2557] transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                  title="Sedang login sebagai Siswa Demo (klik untuk keluar ke Mode Tamu)"
                >
                  <UserCheck className="h-3.5 w-3.5 text-[#1E4ED8] dark:text-blue-400" />
                  <span className="hidden sm:inline">{user.name}</span>
                  <span className="rounded-full bg-[#D9F952] px-2 py-0.5 text-[10px] font-extrabold text-[#0F172A]">
                    {totalXp} XP
                  </span>
                  <LogOut className="h-3 w-3 opacity-65" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onAuthAction}
                    className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    {copy.login}
                  </button>
                  <button
                    type="button"
                    onClick={onRegisterAction}
                    className="rounded-full bg-[#1E4ED8] px-4 py-1.5 text-xs font-semibold text-white shadow-sm shadow-blue-700/25 transition hover:-translate-y-0.5 hover:bg-[#1D4ED8]"
                  >
                    {copy.register}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          2. LAB CONTROL SUB-HEADER (JENJANG + GRID LAB PICKER + MISI)
         ===================================================================== */}
      <div className="border-b border-slate-200 bg-white px-3 py-2 sm:px-5 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-2.5">
          {/* Kiri: Jenjang Switcher + Lab & Compiler Picker Popover */}
          <div className="flex flex-wrap items-center gap-2">
            <div
              className="inline-flex rounded-full bg-[#0F2557] p-0.5"
              role="group"
              aria-label="Pilih Jenjang Sekolah"
            >
              {gradeOptions.map((g) => {
                const active = grade === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onSelectGrade(g)}
                    className={`rounded-full px-3 py-1 font-display text-xs font-bold transition ${
                      active
                        ? 'bg-[#D9F952] font-extrabold text-[#0F2557]'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {GRADE_META[g].shortLabel}
                  </button>
                );
              })}
            </div>

            {/* Lab & Compiler Picker Popover (Rapi, tidak menumpuk 1 garis!) */}
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                aria-expanded={labPickerOpen}
                aria-haspopup="dialog"
                onClick={() => setLabPickerOpen((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  labPickerOpen
                    ? 'border-[#1E4ED8] bg-[#EFF6FF] text-[#1E4ED8] ring-2 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'border-slate-200 bg-slate-100 text-[#0F172A] hover:border-[#1E4ED8] hover:bg-[#EFF6FF]/60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
                }`}
              >
                <span
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1E4ED8] text-[#D9F952]"
                  style={
                    activeMeta.programColorHex
                      ? { backgroundColor: '#0F2557' }
                      : undefined
                  }
                >
                  <ActiveIcon className="h-3 w-3" />
                </span>
                <span>{activeMeta.label}</span>
                <span className="hidden rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#1E4ED8] ring-1 ring-slate-200 sm:inline dark:bg-slate-900 dark:text-blue-300 dark:ring-slate-700">
                  {activeMeta.badge}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <span className="hidden md:inline">{copy.switchLab}</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      labPickerOpen ? 'rotate-180' : ''
                    }`}
                  />
                </span>
              </button>

              {/* Floating Card Grid Popover */}
              {labPickerOpen && (
                <div
                  role="dialog"
                  aria-label="Pilih Lab dan Compiler"
                  className="animate-kodie-pop fixed left-3 right-3 top-[122px] z-50 max-h-[75vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:absolute sm:left-0 sm:right-auto sm:top-11 sm:w-[640px] dark:border-slate-700 dark:bg-[#0F172A]"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <div>
                      <h3 className="font-display text-sm font-extrabold text-[#0F172A] dark:text-white">
                        {copy.pickerHeading} ({GRADE_META[grade].shortLabel})
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {GRADE_META[grade].tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={onToggleShowAllTracks}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
                          showAllTracks
                            ? 'border-[#1E4ED8] bg-[#EFF6FF] text-[#1E4ED8] dark:bg-blue-950/60 dark:text-blue-300'
                            : 'border-dashed border-slate-300 text-slate-600 hover:border-[#1E4ED8] dark:border-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {showAllTracks ? copy.byGrade : copy.allLangs}
                      </button>
                      <button
                        type="button"
                        onClick={() => setLabPickerOpen(false)}
                        className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        aria-label="Tutup pemilih lab"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bagian 1: Bahasa & Lab Pemrograman */}
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <Layers className="h-3.5 w-3.5 text-[#1E4ED8]" />
                      {copy.sectionCore}
                    </p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {coreTracks.map((tId) => {
                        const meta = TRACK_META[tId];
                        const Icon = TRACK_ICONS[tId];
                        const isSelected = track === tId;
                        return (
                          <button
                            key={tId}
                            type="button"
                            onClick={() => {
                              onSelectTrack(tId);
                              setLabPickerOpen(false);
                            }}
                            className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-[#1E4ED8] bg-[#EFF6FF] ring-2 ring-[#1E4ED8]/20 dark:border-blue-500 dark:bg-blue-950/40'
                                : 'border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-blue-700'
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? 'bg-[#1E4ED8] text-[#D9F952]'
                                  : 'bg-white text-[#1E4ED8] ring-1 ring-slate-200 dark:bg-slate-800 dark:text-blue-400 dark:ring-slate-700'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                                  {meta.label}
                                </span>
                                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                                  {meta.badge}
                                </span>
                              </div>
                              <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                                {meta.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bagian 2: Simulasi Jurusan IT (SMA otomatis; SMP jika toggle aktif) */}
                  {grade !== 'sd' && (
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1E4ED8] dark:text-blue-400">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {copy.sectionSpec}
                        </p>
                        {grade === 'smp' && (
                          <button
                            type="button"
                            onClick={onToggleSmpSpecialization}
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold transition ${
                              showSmpSpecialization
                                ? 'border-[#0F172A] bg-[#D9F952] text-[#0F172A]'
                                : 'border-blue-300 bg-[#EFF6FF] text-[#1E4ED8]'
                            }`}
                          >
                            {showSmpSpecialization
                              ? copy.smpTrackOn
                              : copy.smpTrackOff}
                          </button>
                        )}
                      </div>

                      {showSpecSection ? (
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {SPECIALIZATION_TRACKS.map((tId) => {
                            const meta = TRACK_META[tId];
                            const Icon = TRACK_ICONS[tId];
                            const isSelected = track === tId;
                            return (
                              <button
                                key={tId}
                                type="button"
                                onClick={() => {
                                  onSelectTrack(tId);
                                  setLabPickerOpen(false);
                                }}
                                className={`flex items-start gap-2.5 rounded-xl border p-2.5 text-left transition ${
                                  isSelected
                                    ? 'border-[#0F2557] bg-[#F2FFBD]/60 ring-2 ring-[#D9F952] dark:border-[#D9F952] dark:bg-slate-800'
                                    : 'border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60'
                                }`}
                              >
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0F2557] text-[#D9F952]">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] dark:text-white">
                                      <span
                                        className="h-2 w-2 rounded-full"
                                        style={{
                                          backgroundColor:
                                            meta.programColorHex ?? '#1E4ED8',
                                        }}
                                      />
                                      {meta.label}
                                    </span>
                                    {!user ? (
                                      <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800">
                                        <Lock className="h-2.5 w-2.5" />
                                        {copy.loginTag}
                                      </span>
                                    ) : (
                                      <span className="rounded-full bg-[#D9F952] px-1.5 py-0.5 text-[9px] font-extrabold text-[#0F172A]">
                                        {meta.badge}
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                                    {meta.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-center text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
                          Klik <strong>+ Aktifkan Minat IT</strong> untuk menjajal
                          Software API, Jaringan Cisco, IoT ESP32, &amp; AI di jenjang SMP.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tombol Ringkas "Minat Jurusan IT" di SMP supaya langsung terlihat di subbar */}
            {grade === 'smp' && (
              <button
                type="button"
                onClick={() => {
                  onToggleSmpSpecialization();
                  if (!showSmpSpecialization) setLabPickerOpen(true);
                }}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                  showSmpSpecialization
                    ? 'border-[#0F172A] bg-[#D9F952] text-[#0F172A]'
                    : 'border-blue-200 bg-[#EFF6FF] text-[#1E4ED8] hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span>{copy.smpTrackBtn}</span>
              </button>
            )}
          </div>

          {/* Kanan: Pemilih Misi, Proyek Saya, Ukuran Huruf */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-slate-700 dark:bg-slate-800">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1E4ED8] dark:text-blue-400" />
              <label htmlFor="kodie-template-select" className="sr-only">
                Pilih Misi Latihan
              </label>
              <select
                id="kodie-template-select"
                value={templateId}
                onChange={(e) => {
                  const found = templates.find((t) => t.id === e.target.value);
                  if (found) onSelectTemplate(found);
                }}
                className="max-w-[230px] cursor-pointer bg-transparent text-xs font-semibold text-[#0F172A] outline-none sm:max-w-[260px] dark:text-slate-100 [&>option]:bg-white [&>option]:text-[#0F172A] dark:[&>option]:bg-slate-900 dark:[&>option]:text-slate-100"
              >
                {templates.map((tpl) => {
                  const tierTag =
                    tpl.tier === 'scratchpad'
                      ? '🎨 Kanvas Bebas'
                      : tpl.tier === 'advance'
                      ? user
                        ? '✨ Lanjutan'
                        : '🔒 Lanjutan (Login)'
                      : '🟢 Pemula (Gratis)';
                  return (
                    <option key={tpl.id} value={tpl.id}>
                      {tierTag} — {tpl.title}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              type="button"
              onClick={onOpenMyProjects}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#1E4ED8] hover:text-[#1E4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              title={
                user
                  ? 'Kelola Proyek Tersimpan'
                  : 'Masuk untuk menyimpan banyak proyek'
              }
            >
              <FolderKanban className="h-3.5 w-3.5 text-[#1E4ED8] dark:text-blue-400" />
              <span className="hidden sm:inline">{copy.myProjects}</span>
              {user ? (
                <span className="rounded-full bg-[#D9F952] px-1.5 py-0.5 text-[10px] font-extrabold text-[#0F172A]">
                  {savedProjectsCount}
                </span>
              ) : (
                <Lock className="h-3 w-3 text-amber-500" />
              )}
            </button>

            <div className="hidden items-center rounded-full border border-slate-200 bg-white p-0.5 sm:inline-flex dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => onFontSizeChange(-1)}
                disabled={fontSize <= 12}
                className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Perkecil huruf editor"
              >
                A-
              </button>
              <span className="px-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                {fontSize}
              </span>
              <button
                type="button"
                onClick={() => onFontSizeChange(1)}
                disabled={fontSize >= 24}
                className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
                title="Perbesar huruf editor"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
