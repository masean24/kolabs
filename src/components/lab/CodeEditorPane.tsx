import { useEffect, useRef, useState } from 'react';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import {
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  HighlightStyle,
  bracketMatching,
  defaultHighlightStyle,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';
import { tags } from '@lezer/highlight';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { sql } from '@codemirror/lang-sql';
import {
  BookmarkPlus,
  Check,
  Copy,
  Download,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { TRACK_META } from '../../config/brand';
import { getQuickInserts } from '../../data/quickInsert';
import type { LabFiles, LabUser, TrackId, WebFileKey } from '../../types/lab';

interface CodeEditorPaneProps {
  track: Exclude<TrackId, 'blocks'>;
  files: LabFiles;
  activeWebFile: WebFileKey;
  fontSize: number;
  theme: 'light' | 'dark';
  saveStatus: 'saving' | 'saved';
  autoRunWeb: boolean;
  isRunning: boolean;
  user: LabUser | null;
  onSelectWebFile: (file: WebFileKey) => void;
  onChangeCode: (fileName: string, nextValue: string) => void;
  onToggleAutoRunWeb: () => void;
  onRun: () => void;
  onCopyCode: (text: string) => void;
  onDownloadFile: (fileName: string, content: string) => void;
  onSaveProject: () => void;
  onResetCode: () => void;
}

const WEB_FILES: WebFileKey[] = ['index.html', 'style.css', 'script.js'];

const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: '#93C5FD', fontWeight: '600' },
  { tag: [tags.name, tags.deleted, tags.character, tags.propertyName, tags.macroName], color: '#E2E8F0' },
  { tag: [tags.function(tags.variableName), tags.labelName], color: '#C6F64D' },
  { tag: [tags.color, tags.constant(tags.name), tags.standard(tags.name)], color: '#FDBA74' },
  { tag: [tags.definition(tags.name), tags.separator], color: '#CBD5E1' },
  { tag: [tags.typeName, tags.className, tags.number, tags.changed, tags.annotation, tags.modifier, tags.self, tags.namespace], color: '#67E8F9' },
  { tag: [tags.operator, tags.operatorKeyword, tags.url, tags.escape, tags.regexp, tags.link], color: '#7DD3FC' },
  { tag: [tags.meta, tags.comment], color: '#64748B', fontStyle: 'italic' },
  { tag: tags.string, color: '#86EFAC' },
  { tag: tags.tagName, color: '#60A5FA' },
  { tag: tags.attributeName, color: '#C6F64D' },
]);

function getLanguageExtension(track: Exclude<TrackId, 'blocks'>, fileName: string) {
  if (track === 'web') {
    if (fileName === 'index.html') return html({ autoCloseTags: true });
    if (fileName === 'style.css') return css();
    return javascript();
  }
  if (track === 'python' || track === 'turtle' || track === 'ai_data') return python();
  if (track === 'cpp' || track === 'iot') return cpp();
  if (track === 'sql') return sql();
  if (track === 'network') return [];
  return javascript({ typescript: true });
}

function buildEditorTheme(theme: 'light' | 'dark', fontSize: number) {
  const isDark = theme === 'dark';
  return [
    EditorView.theme(
      {
        '&': {
          fontSize: `${fontSize}px`,
          backgroundColor: isDark ? '#0B1222' : '#FFFFFF',
          color: isDark ? '#E2E8F0' : '#0F172A',
          height: '100%',
        },
        '.cm-content': {
          padding: '12px 0',
          caretColor: isDark ? '#C6F64D' : '#1D4ED8',
        },
        '.cm-gutters': {
          backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
          color: isDark ? '#64748B' : '#94A3B8',
          borderRight: isDark ? '1px solid #1E293B' : '1px solid #E2E8F0',
          minWidth: '42px',
        },
        '.cm-activeLine': {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : 'rgba(29, 78, 216, 0.05)',
        },
        '.cm-activeLineGutter': {
          backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(29, 78, 216, 0.1)',
          color: isDark ? '#C6F64D' : '#1D4ED8',
          fontWeight: '700',
        },
        '.cm-selectionBackground, ::selection': {
          backgroundColor: isDark ? 'rgba(198, 246, 77, 0.24)' : 'rgba(29, 78, 216, 0.16)',
        },
      },
      { dark: isDark }
    ),
    syntaxHighlighting(isDark ? darkHighlightStyle : defaultHighlightStyle),
  ];
}

export function CodeEditorPane({
  track,
  files,
  activeWebFile,
  fontSize,
  theme,
  saveStatus,
  autoRunWeb,
  isRunning,
  user,
  onSelectWebFile,
  onChangeCode,
  onToggleAutoRunWeb,
  onRun,
  onCopyCode,
  onDownloadFile,
  onSaveProject,
  onResetCode,
}: CodeEditorPaneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const langCompartmentRef = useRef(new Compartment());
  const themeCompartmentRef = useRef(new Compartment());

  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const currentFileName =
    track === 'web' ? activeWebFile : TRACK_META[track].fileName;
  const currentCode = files[currentFileName] ?? '';

  const onRunRef = useRef(onRun);
  onRunRef.current = onRun;
  const onChangeRef = useRef(onChangeCode);
  onChangeRef.current = onChangeCode;
  const activeFileRef = useRef(currentFileName);
  activeFileRef.current = currentFileName;

  // Inisialisasi CodeMirror 6 sekali saat mount
  useEffect(() => {
    const container = hostRef.current;
    if (!container) return;

    const runKeymap = Prec.highest(
      keymap.of([
        {
          key: 'Mod-Enter',
          run: () => {
            onRunRef.current();
            return true;
          },
        },
      ])
    );

    const state = EditorState.create({
      doc: currentCode,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        history(),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        runKeymap,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          indentWithTab,
        ]),
        langCompartmentRef.current.of(getLanguageExtension(track, currentFileName)),
        themeCompartmentRef.current.of(buildEditorTheme(theme, fontSize)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(activeFileRef.current, update.state.doc.toString());
          }
        }),
      ],
    });

    const view = new EditorView({ state, parent: container });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount sekali untuk CodeMirror; update bahasa/tema/isi via Compartment & dispatch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconfigure bahasa & sinkronkan dokumen saat track/file/template berubah
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const docText = view.state.doc.toString();
    const effects = [
      langCompartmentRef.current.reconfigure(
        getLanguageExtension(track, currentFileName)
      ),
    ];

    if (docText !== currentCode) {
      view.dispatch({
        changes: { from: 0, to: docText.length, insert: currentCode },
        effects,
      });
    } else {
      view.dispatch({ effects });
    }
  }, [track, currentFileName, currentCode]);

  // Reconfigure theme & ukuran huruf tanpa mengganggu undo history
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    view.dispatch({
      effects: themeCompartmentRef.current.reconfigure(
        buildEditorTheme(theme, fontSize)
      ),
    });
  }, [theme, fontSize]);

  const handleQuickInsert = (snippet: string) => {
    const view = viewRef.current;
    if (!view) return;
    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: snippet },
      selection: { anchor: from + snippet.length },
    });
    view.focus();
  };

  const quickInserts = getQuickInserts(track, activeWebFile);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-[#0B1222]">
      {/* Tab File & Toolbar Utilitas Editor */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#F4F7FC] px-3 py-2 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center gap-1.5">
          {track === 'web' ? (
            WEB_FILES.map((fileKey) => {
              const active = activeWebFile === fileKey;
              return (
                <button
                  key={fileKey}
                  type="button"
                  onClick={() => onSelectWebFile(fileKey)}
                  className={`rounded-full px-3 py-1 font-mono text-xs font-bold transition ${
                    active
                      ? 'bg-[#1D4ED8] text-white shadow-xs'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-[#0F172A] dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700'
                  }`}
                >
                  {fileKey}
                </button>
              );
            })
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-xs font-bold text-[#1D4ED8] ring-1 ring-slate-200 dark:bg-slate-800 dark:text-blue-300 dark:ring-slate-700">
              {currentFileName}
            </span>
          )}

          {/* Indikator Auto-Save */}
          <span className="ml-1 hidden items-center gap-1 text-[11px] font-semibold text-slate-500 sm:inline-flex dark:text-slate-400">
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

        {/* Utilitas Editor: Salin, Simpan Proyek, Unduh, Reset (Inline Popover) */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => onCopyCode(currentCode)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] transition hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title="Salin kode ke clipboard"
          >
            <Copy className="h-3 w-3" />
            <span className="hidden md:inline">Salin</span>
          </button>

          <button
            type="button"
            onClick={onSaveProject}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] transition hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={
              user
                ? 'Simpan ke Proyek Saya'
                : 'Masuk untuk menyimpan proyek'
            }
          >
            <BookmarkPlus className="h-3 w-3 text-[#1D4ED8] dark:text-blue-400" />
            <span className="hidden md:inline">Simpan</span>
            {!user && <Lock className="h-2.5 w-2.5 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => onDownloadFile(currentFileName, currentCode)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-[#0F172A] transition hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            title={
              user ? `Unduh ${currentFileName}` : 'Masuk untuk mengunduh file'
            }
          >
            <Download className="h-3 w-3" />
            <span className="hidden md:inline">Unduh</span>
            {!user && <Lock className="h-2.5 w-2.5 text-amber-500" />}
          </button>

          <button
            type="button"
            onClick={() => setConfirmResetOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:text-rose-400"
            title="Kembalikan kode ke template awal"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Inline Confirmation Popover (pengganti window.confirm) */}
          {confirmResetOpen && (
            <div className="absolute right-0 top-9 z-40 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <p className="text-xs font-bold text-[#0F172A] dark:text-white">
                Kembalikan kode ke awal?
              </p>
              <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Perubahanmu di latihan ini akan diganti dengan kode template awal.
              </p>
              <div className="mt-2.5 flex justify-end gap-1.5">
                <button
                  type="button"
                  onClick={() => setConfirmResetOpen(false)}
                  className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConfirmResetOpen(false);
                    onResetCode();
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

      {/* Bilah Sisip Cepat (Quick Insert Bar) untuk Chromebook / HP / Layar Sentuh */}
      {quickInserts.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-100 bg-white px-3 py-1.5 dark:border-slate-800/70 dark:bg-slate-900/50">
          <span className="shrink-0 text-[10px] font-extrabold uppercase tracking-wider text-[#1D4ED8] dark:text-blue-400">
            Sisip Cepat:
          </span>
          {quickInserts.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleQuickInsert(item.snippet)}
              className="shrink-0 rounded-full border border-slate-200 bg-[#F4F7FC] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-[#0F172A] transition hover:border-[#1D4ED8] hover:bg-[#EFF6FF] hover:text-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-blue-400 dark:hover:text-blue-300"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Host CodeMirror 6 */}
      <div
        ref={hostRef}
        className="kodie-cm-host min-h-0 flex-1 overflow-hidden"
        aria-label="Editor Kode Kodie"
      />

      {/* Footer Aksi Run Kode — Signature Kodie Pill CTA */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200/80 bg-[#F4F7FC] px-3.5 py-2 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center gap-2">
          {track === 'web' ? (
            <button
              type="button"
              onClick={onToggleAutoRunWeb}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold transition ${
                autoRunWeb
                  ? 'border-blue-300 bg-[#EFF6FF] text-[#1D4ED8] dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Auto-Run: {autoRunWeb ? 'ON' : 'OFF'}</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Shortcut:{' '}
              <kbd className="rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0F172A] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                Ctrl/⌘ + Enter
              </kbd>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onRun}
          disabled={isRunning}
          className="inline-flex items-center gap-2.5 rounded-full bg-[#D9F952] py-1.5 pl-4 pr-1.5 font-display text-xs font-extrabold text-[#0F172A] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#C8EC3B] active:scale-[0.98] disabled:opacity-60"
        >
          <span>{isRunning ? 'Menjalankan...' : 'Run Kode'}</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0F172A] text-white">
            {isRunning ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3 w-3 fill-current" />
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
