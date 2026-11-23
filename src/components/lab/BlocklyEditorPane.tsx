import { useEffect, useMemo, useRef, useState } from 'react';
import type * as BlocklyType from 'blockly';
import {
  BookmarkPlus,
  Check,
  Code2,
  Download,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  KODIE_BLOCKLY_TOOLBOX,
  compileBlocksToPython,
  registerKodieBlocks,
} from '../../runners/blockRunner';
import type { LabUser } from '../../types/lab';

interface BlocklyEditorPaneProps {
  workspaceJson: string;
  theme: 'light' | 'dark';
  saveStatus: 'saving' | 'saved';
  isRunning: boolean;
  user: LabUser | null;
  onChangeBlocks: (nextJson: string) => void;
  onRunBlocks: () => void;
  onDownloadPython: (fileName: string, pythonCode: string) => void;
  onSaveProject: () => void;
  onResetBlocks: () => void;
}

export function BlocklyEditorPane({
  workspaceJson,
  theme,
  saveStatus,
  isRunning,
  user,
  onChangeBlocks,
  onRunBlocks,
  onDownloadPython,
  onSaveProject,
  onResetBlocks,
}: BlocklyEditorPaneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const blocklyRef = useRef<typeof BlocklyType | null>(null);
  const workspaceRef = useRef<BlocklyType.WorkspaceSvg | null>(null);
  const isProgrammaticLoadRef = useRef(false);
  const lastSerializedRef = useRef<string>(workspaceJson);

  const [loadingBlockly, setLoadingBlockly] = useState(true);
  const [showPythonPeek, setShowPythonPeek] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const onChangeRef = useRef(onChangeBlocks);
  onChangeRef.current = onChangeBlocks;

  const pythonPreview = useMemo(
    () => compileBlocksToPython(workspaceJson),
    [workspaceJson]
  );

  // Lazy-load Blockly + mount workspace SVG
  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    (async () => {
      try {
        const Blockly = await import('blockly');
        if (cancelled || !hostRef.current) return;

        blocklyRef.current = Blockly;
        registerKodieBlocks(Blockly);

        const kodieTheme = Blockly.Theme.defineTheme('kodie_theme', {
          name: 'kodie_theme',
          base: Blockly.Themes.Zelos,
          componentStyles: {
            workspaceBackgroundColour: theme === 'dark' ? '#0B1222' : '#F4F7FC',
            toolboxBackgroundColour: theme === 'dark' ? '#0F172A' : '#FFFFFF',
            toolboxForegroundColour: theme === 'dark' ? '#E2E8F0' : '#0F172A',
            flyoutBackgroundColour: theme === 'dark' ? '#131D35' : '#FFFFFF',
            flyoutForegroundColour: theme === 'dark' ? '#F8FAFC' : '#0F172A',
            flyoutOpacity: 1,
            scrollbarColour: '#94A3B8',
          },
        });

        const ws = Blockly.inject(hostRef.current, {
          toolbox: KODIE_BLOCKLY_TOOLBOX,
          renderer: 'zelos',
          theme: kodieTheme,
          trashcan: true,
          grid: {
            spacing: 24,
            length: 3,
            colour: theme === 'dark' ? '#1E293B' : '#E2E8F0',
            snap: true,
          },
          zoom: {
            controls: true,
            wheel: true,
            startScale: 0.92,
            maxScale: 1.4,
            minScale: 0.55,
          },
          move: {
            scrollbars: true,
            drag: true,
            wheel: true,
          },
        });

        workspaceRef.current = ws;

        // Muat state blok awal
        isProgrammaticLoadRef.current = true;
        try {
          const parsed = JSON.parse(lastSerializedRef.current);
          Blockly.serialization.workspaces.load(parsed, ws);
        } catch {
          // Abaikan jika JSON kosong
        } finally {
          isProgrammaticLoadRef.current = false;
        }

        ws.addChangeListener((event) => {
          if (isProgrammaticLoadRef.current || event.isUiEvent) return;
          const serializedObj = Blockly.serialization.workspaces.save(ws);
          const jsonStr = JSON.stringify(serializedObj, null, 2);
          lastSerializedRef.current = jsonStr;
          onChangeRef.current(jsonStr);
        });

        resizeObserver = new ResizeObserver(() => {
          Blockly.svgResize(ws);
        });
        resizeObserver.observe(hostRef.current);

        setLoadingBlockly(false);
      } catch (err) {
        console.error('Gagal memuat Blockly:', err);
        setLoadingBlockly(false);
      }
    })();

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
    };
    // Theme update dihandle effect terpisah bila workspace sudah aktif
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan ketika template diganti / reset / solusi diterapkan
  useEffect(() => {
    const ws = workspaceRef.current;
    const Blockly = blocklyRef.current;
    if (!ws || !Blockly) return;
    if (workspaceJson === lastSerializedRef.current) return;

    lastSerializedRef.current = workspaceJson;
    isProgrammaticLoadRef.current = true;
    try {
      ws.hideChaff();
      ws.getToolbox()?.clearSelection();
      ws.clear();
      if (workspaceJson.trim()) {
        Blockly.serialization.workspaces.load(JSON.parse(workspaceJson), ws);
      }
    } catch {
      // ignore invalid json
    } finally {
      isProgrammaticLoadRef.current = false;
    }
  }, [workspaceJson]);

  // Perbarui tema Blockly saat toggle Light/Dark
  useEffect(() => {
    const ws = workspaceRef.current;
    const Blockly = blocklyRef.current;
    if (!ws || !Blockly) return;

    const updatedTheme = Blockly.Theme.defineTheme(`kodie_${theme}`, {
      name: `kodie_${theme}`,
      base: Blockly.Themes.Zelos,
      componentStyles: {
        workspaceBackgroundColour: theme === 'dark' ? '#0B1222' : '#F4F7FC',
        toolboxBackgroundColour: theme === 'dark' ? '#0F172A' : '#FFFFFF',
        toolboxForegroundColour: theme === 'dark' ? '#E2E8F0' : '#0F172A',
        flyoutBackgroundColour: theme === 'dark' ? '#131D35' : '#FFFFFF',
        flyoutForegroundColour: theme === 'dark' ? '#F8FAFC' : '#0F172A',
        flyoutOpacity: 1,
        scrollbarColour: '#94A3B8',
      },
    });
    ws.setTheme(updatedTheme);
  }, [theme]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-[#0B1222]">
      {/* Toolbar Blockly */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#F4F7FC] px-3 py-2 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#D9F952] px-3 py-1 text-xs font-extrabold text-[#0F172A] ring-1 ring-lime-400">
            🧩 Papan Blok Visual SD
          </span>
          <span className="hidden items-center gap-1 text-[11px] font-semibold text-slate-500 sm:inline-flex dark:text-slate-400">
            {saveStatus === 'saving' ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-[#1D4ED8]" />
                Menyimpan...
              </>
            ) : (
              <>
                <Check className="h-3 w-3 text-emerald-500" />
                Tersimpan
              </>
            )}
          </span>
        </div>

        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPythonPeek((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-bold transition ${
              showPythonPeek
                ? 'border-[#1D4ED8] bg-[#1D4ED8] text-white'
                : 'border-slate-200 bg-white text-[#0F172A] hover:border-blue-300 hover:text-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Intip Kode Python</span>
          </button>

          <button
            type="button"
            onClick={onSaveProject}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <BookmarkPlus className="h-3 w-3 text-[#1D4ED8] dark:text-blue-400" />
            <span className="hidden sm:inline">Simpan</span>
            {!user && <Lock className="h-2.5 w-2.5 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => onDownloadPython('kiko_blok.py', pythonPreview)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            title={user ? 'Unduh versi Python (.py)' : 'Masuk untuk mengunduh'}
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">.py</span>
            {!user && <Lock className="h-2.5 w-2.5 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {confirmResetOpen && (
            <div className="absolute right-0 top-9 z-40 w-60 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                Reset susunan blok?
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Susunan blok akan dikembalikan ke contoh awal misi ini.
              </p>
              <div className="mt-2.5 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmResetOpen(false);
                    onResetBlocks();
                  }}
                  className="rounded-lg bg-rose-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-rose-700"
                >
                  Ya, Reset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Kanvas Blockly + Drawer Intip Kode Python */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {loadingBlockly && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50/90 dark:bg-[#0B1222]/90">
            <Loader2 className="h-6 w-6 animate-spin text-[#1D4ED8]" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Menyiapkan balok visual Kiko...
            </p>
          </div>
        )}
        <div
          ref={hostRef}
          className="kodie-blockly-host h-full w-full"
          aria-label="Kanvas Susun Blok Kiko"
        />

        {showPythonPeek && (
          <div className="absolute inset-y-2 right-2 z-20 flex w-72 max-w-[85%] flex-col rounded-2xl border border-blue-200 bg-[#0F172A] text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
              <div>
                <p className="text-xs font-extrabold text-[#C6F64D]">
                  Intip Kode Python 🐍
                </p>
                <p className="text-[10px] text-slate-400">
                  Beginilah bentuk kode aslinya nanti di SMP!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPythonPeek(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <pre className="min-h-0 flex-1 overflow-auto p-3 font-mono text-[11px] leading-relaxed text-emerald-300">
              {pythonPreview}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Jalankan Blok — Signature Kodie Pill CTA */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200/80 bg-[#F4F7FC] px-3.5 py-2 dark:border-slate-800 dark:bg-[#0F172A]">
        <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          Tarik balok dari kiri, tempel di bawah 🚀 Mulai.
        </p>
        <button
          type="button"
          onClick={onRunBlocks}
          disabled={isRunning}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#D9F952] py-1.5 pl-4 pr-1.5 font-display text-xs font-extrabold text-[#0F172A] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#C8EC3B] active:scale-[0.98] disabled:opacity-60"
        >
          <span>Jalankan Blok!</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-white">
            <Play className="h-3 w-3 fill-current" />
          </span>
        </button>
      </div>
    </div>
  );
}
