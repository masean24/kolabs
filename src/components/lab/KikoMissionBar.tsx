import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Circle,
  KeyRound,
  Lightbulb,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import type { GradeLevel, KikoMood, LabTemplate, LabUser } from '../../types/lab';
import type { MissionEvaluationSummary } from '../../utils/missionEvaluator';
import { KikoAvatar } from './KikoAvatar';

interface KikoMissionBarProps {
  template: LabTemplate;
  grade: GradeLevel;
  evaluation: MissionEvaluationSummary;
  mood: KikoMood;
  user: LabUser | null;
  onApplySolution: () => void;
  onRequestAuthForXp: () => void;
}

export function KikoMissionBar({
  template,
  grade,
  evaluation,
  mood,
  user,
  onApplySolution,
  onRequestAuthForXp,
}: KikoMissionBarProps) {
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    setShowHints(false);
  }, [template.id]);

  if (template.tier === 'scratchpad') {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-3 pt-2.5 sm:px-5">
        <div className="kodie-card-blue flex items-center justify-between gap-3 rounded-[22px] border border-blue-200/80 px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-3">
            <KikoAvatar mood="happy" size="sm" />
            <div>
              <p className="font-display text-xs font-extrabold text-[#0F172A]">
                Mode Kanvas Bebas — {template.title}
              </p>
              <p className="text-[11px] font-medium text-slate-700">
                {template.missionGoal}
              </p>
            </div>
          </div>
          <span className="hidden rounded-full bg-[#0F172A] px-3 py-1 text-[11px] font-extrabold text-[#D9F952] sm:inline">
            Bebas Eksplorasi
          </span>
        </div>
      </div>
    );
  }

  const isSd = grade === 'sd';
  const progressPct =
    evaluation.totalCount > 0
      ? Math.round((evaluation.passedCount / evaluation.totalCount) * 100)
      : 0;

  // Kartu misi berubah jadi Lime Gradient ceria saat semua syarat terpenuhi!
  const cardSurfaceClass = evaluation.allPassed
    ? 'kodie-card-lime border-[#A3E635] shadow-sm animate-kodie-pop'
    : isSd
    ? 'bg-gradient-to-r from-[#F2FFBD]/65 via-white to-[#EFF6FF] border-lime-300/80 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/30 dark:border-slate-700'
    : grade === 'smp'
    ? 'bg-gradient-to-r from-[#EFF6FF] via-white to-[#F8FAFC] border-blue-200/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 dark:border-slate-800'
    : 'bg-white border-slate-200/90 dark:bg-[#0F172A] dark:border-slate-800';

  return (
    <div className="mx-auto w-full max-w-[1440px] px-3 pt-2.5 sm:px-5">
      <div
        className={`relative rounded-[22px] border px-4 py-3 shadow-xs transition-all ${cardSurfaceClass}`}
      >
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Kiko & Deskripsi Misi */}
          <div className="flex items-start gap-3">
            <div className={evaluation.allPassed ? 'animate-kodie-float' : ''}>
              <KikoAvatar
                mood={evaluation.allPassed ? 'celebrate' : mood}
                size={isSd ? 'lg' : 'md'}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                    evaluation.allPassed
                      ? 'bg-[#0F172A] text-[#D9F952]'
                      : 'bg-[#1E4ED8] text-white'
                  }`}
                >
                  Misi Kiko
                </span>

                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    evaluation.allPassed
                      ? 'bg-white/75 text-[#0F172A]'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {evaluation.passedCount}/{evaluation.totalCount} Syarat
                </span>

                {evaluation.allPassed && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0F172A] px-2.5 py-0.5 text-[11px] font-extrabold text-[#D9F952] shadow-xs">
                    <Sparkles className="h-3 w-3" />+{template.xpReward} XP Selesai!
                  </span>
                )}

                {evaluation.allPassed && !user && (
                  <button
                    type="button"
                    onClick={onRequestAuthForXp}
                    className="rounded-full bg-white/80 px-2.5 py-0.5 text-[11px] font-extrabold text-[#1E4ED8] underline-offset-2 hover:underline"
                  >
                    Masuk untuk simpan XP →
                  </button>
                )}
              </div>

              <h2
                className={`mt-1 font-extrabold leading-snug ${
                  evaluation.allPassed
                    ? 'text-[#0F172A]'
                    : 'text-[#0F172A] dark:text-white'
                } ${isSd ? 'text-sm sm:text-base' : 'text-sm'}`}
              >
                {template.missionTitle}
              </h2>
              <p
                className={`text-xs ${
                  evaluation.allPassed
                    ? 'font-medium text-[#0F172A]/85'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {template.missionGoal}
              </p>

              {/* Slim Progress Bar */}
              <div className="mt-1.5 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    evaluation.allPassed ? 'bg-[#0F172A]' : 'bg-[#1E4ED8]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Checklist 3 Kriteria & Tombol Petunjuk / Solusi */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {evaluation.results.map((item) => (
                <div
                  key={item.id}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all ${
                    item.passed
                      ? evaluation.allPassed
                        ? 'border-[#0F172A]/20 bg-white/85 text-[#0F172A]'
                        : 'border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-white/90 text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
                  }`}
                  title={
                    item.mode === 'runtime'
                      ? 'Terverifikasi saat tombol Run ditekan'
                      : 'Terpantau otomatis saat mengetik/menyusun blok'
                  }
                >
                  {item.passed ? (
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              {template.hints.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowHints((prev) => !prev)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                    showHints
                      ? 'border-amber-400 bg-amber-100 text-[#0F172A]'
                      : 'border-slate-200 bg-white text-[#0F172A] hover:border-amber-300 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  }`}
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                  <span>Petunjuk</span>
                </button>
              )}

              {template.solutionFiles && (
                <button
                  type="button"
                  onClick={onApplySolution}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] transition hover:border-[#1E4ED8] hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  title={
                    user
                      ? 'Lihat & terapkan kode solusi'
                      : 'Masuk untuk membuka Kunci Solusi'
                  }
                >
                  {user ? (
                    <KeyRound className="h-3.5 w-3.5 text-[#1E4ED8] dark:text-blue-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  <span>Solusi</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Panel Petunjuk Kiko */}
        {showHints && template.hints.length > 0 && (
          <div className="animate-kodie-pop mt-2.5 rounded-2xl border border-amber-300/80 bg-[#FEFCE8] p-3 text-xs text-[#0F172A] dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-100">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 font-extrabold">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                Petunjuk dari Kiko:
              </span>
              <button
                type="button"
                onClick={() => setShowHints(false)}
                className="rounded-full p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/50"
                aria-label="Tutup petunjuk"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <ol className="list-decimal space-y-1 pl-4">
              {template.hints.map((hint, idx) => (
                <li key={idx} className="whitespace-pre-wrap leading-relaxed">
                  {hint}
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
