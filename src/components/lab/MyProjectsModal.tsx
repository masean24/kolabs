import { useEffect, useState } from 'react';
import {
  BookmarkPlus,
  FolderOpen,
  Trash2,
  X,
} from 'lucide-react';
import { GRADE_META, TRACK_META } from '../../config/brand';
import type { SavedProject } from '../../types/lab';

interface MyProjectsModalProps {
  open: boolean;
  projects: SavedProject[];
  defaultProjectName: string;
  onClose: () => void;
  onSaveCurrent: (name: string) => void;
  onLoadProject: (project: SavedProject) => void;
  onDeleteProject: (projectId: string) => void;
}

export function MyProjectsModal({
  open,
  projects,
  defaultProjectName,
  onClose,
  onSaveCurrent,
  onLoadProject,
  onDeleteProject,
}: MyProjectsModalProps) {
  const [nameInput, setNameInput] = useState(defaultProjectName);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNameInput(defaultProjectName);
    }
  }, [open, defaultProjectName]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim() || defaultProjectName;
    onSaveCurrent(trimmed);
    setNameInput('');
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-projects-title"
    >
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#0F172A]">
        <div className="kodie-banner-gradient flex items-center justify-between px-5 py-4 text-white">
          <div>
            <h3
              id="my-projects-title"
              className="text-base font-extrabold text-white"
            >
              Proyek Saya
            </h3>
            <p className="text-xs text-blue-100/90">
              Simpan hasil karyamu dan lanjutkan kapan pun di browser ini.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/15 p-1.5 text-white/90 hover:bg-white/25 hover:text-white"
            aria-label="Tutup Proyek Saya"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Simpan Proyek Aktif */}
        <form
          onSubmit={handleSubmit}
          className="border-b border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <label
            htmlFor="kodie-project-name"
            className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            Simpan kode aktif sekarang sebagai proyek baru:
          </label>
          <div className="flex gap-2">
            <input
              id="kodie-project-name"
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder={defaultProjectName}
              className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-[#1D4ED8] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
            >
              <BookmarkPlus className="h-3.5 w-3.5" />
              <span>Simpan</span>
            </button>
          </div>
        </form>

        {/* Daftar Proyek Tersimpan */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-10 text-center dark:border-slate-800">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Belum ada proyek tersimpan.
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Ketik nama di atas lalu klik Simpan untuk menyimpan karyamu!
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {projects.map((proj) => {
                const trackMeta = TRACK_META[proj.track];
                const gradeMeta = GRADE_META[proj.grade];
                const isConfirming = confirmDeleteId === proj.id;

                return (
                  <div
                    key={proj.id}
                    className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-3 transition hover:border-blue-300 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900/70"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-[#0F172A] dark:text-white">
                        {proj.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {gradeMeta.shortLabel}
                        </span>
                        <span
                          className={`rounded-md border px-1.5 py-0.5 font-bold ${trackMeta.accentClass}`}
                        >
                          {trackMeta.label}
                        </span>
                        <span className="text-slate-400">
                          {new Date(proj.updatedAt).toLocaleString('id-ID', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      {isConfirming ? (
                        <>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            Batal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDeleteId(null);
                              onDeleteProject(proj.id);
                            }}
                            className="rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-rose-700"
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onLoadProject(proj)}
                            className="inline-flex items-center gap-1 rounded-xl bg-[#D9F952] px-3 py-1.5 text-[11px] font-extrabold text-[#0F172A] hover:bg-[#C8EC3B]"
                          >
                            <FolderOpen className="h-3.5 w-3.5" />
                            <span>Buka</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(proj.id)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700"
                            title="Hapus proyek"
                            aria-label={`Hapus proyek ${proj.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
