import { CheckCircle2, Lock, Sparkles, UserCheck, X } from 'lucide-react';
import type { AuthGateReason } from '../../types/lab';
import { KikoAvatar } from './KikoAvatar';

interface AuthGateModalProps {
  reason: AuthGateReason | null;
  onClose: () => void;
  onLoginDemo: () => void;
}

const REASON_COPY: Record<
  AuthGateReason,
  { heading: string; description: string }
> = {
  advance_mission: {
    heading: 'Buka Misi Lanjutan & Latihan OSN',
    description:
      'Misi lanjutan dirancang khusus untuk siswa Kodie yang sudah masuk agar progres dan XP-nya tercatat rapi.',
  },
  my_projects: {
    heading: 'Simpan Banyak Proyek di Akunmu',
    description:
      'Masuk terlebih dahulu untuk menyimpan, mengelola, dan membuka kembali proyek-proyek coding buatanmu kapan saja.',
  },
  download_file: {
    heading: 'Unduh File Kode & Proyek',
    description:
      'Fitur mengunduh hasil kode (.py, .cpp, .sql, .ts, atau web) tersedia gratis untuk akun siswa yang sudah masuk.',
  },
  view_solution: {
    heading: 'Buka Kunci Solusi dari Kiko',
    description:
      'Kiko menyimpan kunci solusi pembahasan langkah demi langkah khusus untuk siswa yang sudah login.',
  },
  save_xp: {
    heading: 'Simpan XP & Lencana Misi Kamu!',
    description:
      'Misi sudah berhasil kamu selesaikan! Masuk sekarang agar XP tidak hilang dan tercatat di papan progresmu.',
  },
  specialization_lab: {
    heading: 'Buka Lab Simulasi Jurusan IT',
    description:
      'Masuk sebagai siswa Kodie untuk mencoba simulator interaktif Software REST API, Jaringan Cisco IOS, IoT ESP32 Virtual, dan AI & Data!',
  },
};

export function AuthGateModal({
  reason,
  onClose,
  onLoginDemo,
}: AuthGateModalProps) {
  if (!reason) return null;

  const copy = REASON_COPY[reason];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-gate-title"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#0F172A]">
        {/* Header Biru Kodie */}
        <div className="kodie-banner-gradient relative px-6 py-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-1.5 text-white/80 hover:bg-white/20 hover:text-white"
            aria-label="Tutup modal"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <KikoAvatar mood="happy" size="md" />
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#C6F64D] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0F172A]">
                <Lock className="h-3 w-3" />
                FITUR AKUN SISWA
              </span>
              <h3
                id="auth-gate-title"
                className="mt-1.5 text-base font-extrabold leading-snug"
              >
                {copy.heading}
              </h3>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {copy.description}
          </p>

          <ul className="space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs dark:bg-slate-900">
            {[
              'Akses seluruh Misi Lanjutan & persiapan OSN SD–SMA',
              'Simpan banyak proyek di panel "Proyek Saya"',
              'Kumpulkan XP & buka Kunci Solusi step-by-step',
              'Unduh file kode untuk tugas sekolah atau portofolio',
            ].map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2 font-medium text-slate-700 dark:text-slate-200"
              >
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={onLoginDemo}
              className="inline-flex w-full items-center justify-between rounded-full bg-[#D9F952] py-2 pl-5 pr-2 font-display text-xs font-extrabold text-[#0F172A] shadow-sm transition hover:bg-[#C8EC3B]"
            >
              <span className="inline-flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Masuk sebagai Siswa Demo (Gratis)</span>
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F172A] text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full py-2 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Lanjut Pakai Mode Tamu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
