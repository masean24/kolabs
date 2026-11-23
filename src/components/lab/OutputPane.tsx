import { useMemo, type RefObject } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Monitor,
  RefreshCw,
  Smartphone,
  Terminal,
  Trash2,
} from 'lucide-react';
import { TRACK_META } from '../../config/brand';
import type {
  ConsoleEntry,
  ExecutionResult,
  GradeLevel,
  IotSensorState,
  TrackId,
} from '../../types/lab';
import { explainErrorWithKiko } from '../../utils/errorExplainer';
import { AiDataPane } from './AiDataPane';
import { ApiTesterPane } from './ApiTesterPane';
import { IotSimulatorPane } from './IotSimulatorPane';
import { KikoAvatar } from './KikoAvatar';
import { NetworkSimulatorPane } from './NetworkSimulatorPane';
import { SqlResultTable } from './SqlResultTable';
import { TurtleCanvas } from './TurtleCanvas';

interface OutputPaneProps {
  track: TrackId;
  grade: GradeLevel;
  theme: 'light' | 'dark';
  isRunning: boolean;
  loadingStatus: string | null;
  stdin: string;
  webSrcDoc: string;
  webPreviewMode: 'desktop' | 'mobile';
  webConsoleLogs: ConsoleEntry[];
  result: ExecutionResult | null;
  turtleRunSignal: number;
  networkRunSignal: number;
  iotRunSignal: number;
  iotSensors: IotSensorState;
  iframeRef: RefObject<HTMLIFrameElement>;
  isDraggingSplit: boolean;
  onChangeStdin: (value: string) => void;
  onChangeWebPreviewMode: (mode: 'desktop' | 'mobile') => void;
  onRefreshWeb: () => void;
  onClearConsole: () => void;
  onChangeIotSensors: (next: IotSensorState) => void;
  onSendApiTest: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    bodyJson: string
  ) => void;
}

export function OutputPane({
  track,
  grade,
  theme,
  isRunning,
  loadingStatus,
  stdin,
  webSrcDoc,
  webPreviewMode,
  webConsoleLogs,
  result,
  turtleRunSignal,
  networkRunSignal,
  iotRunSignal,
  iotSensors,
  iframeRef,
  isDraggingSplit,
  onChangeStdin,
  onChangeWebPreviewMode,
  onRefreshWeb,
  onClearConsole,
  onChangeIotSensors,
  onSendApiTest,
}: OutputPaneProps) {
  const trackMeta = TRACK_META[track];

  const activeLogs =
    track === 'web' ? webConsoleLogs : result?.consoleLogs ?? [];

  const activeErrorRaw = useMemo(() => {
    if (track === 'web') {
      const errLog = webConsoleLogs.find((l) => l.level === 'error');
      return errLog?.text ?? null;
    }
    return result?.errorRaw ?? null;
  }, [track, webConsoleLogs, result]);

  const kikoExplanation = useMemo(() => {
    if (!activeErrorRaw) return null;
    return explainErrorWithKiko(track, activeErrorRaw, grade);
  }, [track, activeErrorRaw, grade]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-white dark:bg-[#0F172A]">
      {/* Header Panel Output */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-[#F4F7FC] px-3 py-2 dark:border-slate-800 dark:bg-[#0F172A]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
            {track === 'web'
              ? 'Pratinjau Web & Konsol'
              : track === 'blocks' || track === 'turtle'
              ? 'Kanvas Gambar Kiko'
              : track === 'sql'
              ? 'Hasil Tabel SQLite'
              : track === 'typescript'
              ? 'Type Checker & Output'
              : track === 'network'
              ? 'Topologi & Cisco IOS CLI'
              : track === 'iot'
              ? 'Simulator Board ESP32'
              : track === 'ai_data'
              ? 'Grafik Prediksi & AI'
              : track === 'software_api'
              ? 'Mini Postman & Server API'
              : 'Terminal Output'}
          </span>
          <span
            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${trackMeta.accentClass}`}
          >
            {trackMeta.runtimeLabel}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {result && result.track === track && (
            <div className="flex items-center gap-1.5">
              {typeof result.exitCode === 'number' &&
                (track === 'cpp' || track === 'python') && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-extrabold ${
                      result.exitCode === 0
                        ? 'bg-[#EEFFC2] text-[#0F172A] ring-1 ring-lime-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    exit: {result.exitCode}
                  </span>
                )}
              <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                <Clock className="h-3 w-3 text-[#1D4ED8] dark:text-blue-400" />
                {result.durationMs} ms
              </span>
            </div>
          )}

          {track === 'web' && (
            <>
              <div className="inline-flex rounded-full bg-white p-0.5 ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700">
                <button
                  type="button"
                  onClick={() => onChangeWebPreviewMode('desktop')}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                    webPreviewMode === 'desktop'
                      ? 'bg-[#1D4ED8] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Monitor className="h-3 w-3" />
                  <span>Desktop</span>
                </button>
                <button
                  type="button"
                  onClick={() => onChangeWebPreviewMode('mobile')}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                    webPreviewMode === 'mobile'
                      ? 'bg-[#1D4ED8] text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Smartphone className="h-3 w-3" />
                  <span>HP 375px</span>
                </button>
              </div>
              <button
                type="button"
                onClick={onRefreshWeb}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:bg-blue-50/70 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                title="Muat ulang pratinjau"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Indikator Status Lazy-Load Runtime CDN */}
      {(isRunning || loadingStatus) && (
        <div className="flex items-center gap-2 border-b border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>{loadingStatus || 'Menjalankan program...'}</span>
        </div>
      )}

      {/* Konten Utama Output */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* 1. WEB STACK */}
        {track === 'web' && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-2 dark:bg-slate-950">
              {isDraggingSplit && (
                <div className="absolute inset-0 z-20 cursor-col-resize bg-transparent" />
              )}
              <div
                className={`h-full overflow-hidden bg-white shadow-sm transition-all ${
                  webPreviewMode === 'mobile'
                    ? 'w-[375px] max-w-full rounded-[24px] border-[6px] border-[#0F172A] shadow-xl'
                    : 'w-full rounded-xl border border-slate-200 dark:border-slate-800'
                }`}
              >
                <iframe
                  ref={iframeRef}
                  title="Pratinjau Web Kodie"
                  sandbox="allow-scripts allow-modals"
                  srcDoc={webSrcDoc}
                  className="h-full w-full border-0 bg-white"
                />
              </div>
            </div>

            {/* Konsol Web */}
            <div className="flex h-36 shrink-0 flex-col border-t border-slate-200 bg-[#0B1736] text-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 px-3 py-1">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                  <Terminal className="h-3 w-3 text-[#D9F952]" />
                  Konsol ({activeLogs.length})
                </span>
                <button
                  type="button"
                  onClick={onClearConsole}
                  className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <Trash2 className="h-3 w-3" />
                  Bersihkan
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-2.5 font-mono text-xs">
                {activeLogs.length === 0 ? (
                  <p className="text-[11px] italic text-slate-500">
                    Log dari console.log() akan muncul di sini...
                  </p>
                ) : (
                  <div className="space-y-1">
                    {activeLogs.map((entry) => (
                      <div
                        key={entry.id}
                        className={`whitespace-pre-wrap break-words rounded px-1.5 py-0.5 ${
                          entry.level === 'error'
                            ? 'bg-rose-950/60 text-rose-300'
                            : entry.level === 'warn'
                            ? 'bg-amber-950/50 text-amber-300'
                            : 'text-emerald-300'
                        }`}
                      >
                        {entry.text}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. BLOCK CODING & PYTHON TURTLE */}
        {(track === 'blocks' || track === 'turtle') && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1">
              <TurtleCanvas
                commands={
                  result?.track === track ? result.turtleCommands ?? [] : []
                }
                runSignal={turtleRunSignal}
                theme={theme}
              />
            </div>

            {(activeLogs.length > 0 || result?.track === track) && (
              <div className="max-h-28 shrink-0 overflow-auto border-t border-slate-200 bg-[#0B1736] px-3 py-2 font-mono text-xs text-slate-200 dark:border-slate-800">
                {activeLogs.length === 0 ? (
                  <span className="text-[11px] text-slate-400">
                    Siap menggambar! Output print() atau pesan Kiko tampil di sini.
                  </span>
                ) : (
                  activeLogs.map((entry) => (
                    <div
                      key={entry.id}
                      className={`whitespace-pre-wrap ${
                        entry.level === 'error'
                          ? 'text-rose-300'
                          : 'text-[#D9F952]'
                      }`}
                    >
                      {entry.text}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* 3. PYTHON & C++ (STDIN + TERMINAL) */}
        {(track === 'python' || track === 'cpp') && (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Kotak Input Program (stdin) */}
            <div className="border-b border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor="kodie-stdin-input"
                  className="text-xs font-bold text-[#0F172A] dark:text-slate-200"
                >
                  Input Program (stdin)
                </label>
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                  {track === 'python'
                    ? 'Dipakai oleh input() — 1 baris per input'
                    : 'Dipakai oleh cin >> — pisahkan spasi atau baris baru'}
                </span>
              </div>
              <textarea
                id="kodie-stdin-input"
                rows={3}
                value={stdin}
                onChange={(e) => onChangeStdin(e.target.value)}
                placeholder={
                  track === 'python'
                    ? 'Contoh:\nRaka\n88'
                    : 'Contoh:\n5\n10 20 30 40 50'
                }
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#1D4ED8] dark:border-slate-700 dark:bg-[#0B1222] dark:text-slate-100"
              />
            </div>

            {/* Terminal Output */}
            <div className="min-h-0 flex-1 overflow-auto bg-[#0B1736] p-3.5 font-mono text-xs text-slate-100">
              {!result || result.track !== track ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-300">
                  <p className="font-sans text-xs font-bold text-white">
                    🚀 Siap menjalankan {track === 'python' ? 'Python 3' : 'C++ (OSN)'}!
                  </p>
                  <p className="mt-1 font-sans text-[11px] text-slate-400">
                    Pastikan kotak <strong className="text-slate-200">Input Program (stdin)</strong> di atas sudah sesuai, lalu tekan tombol <strong className="text-[#D9F952]">Run Kode</strong>.
                  </p>
                </div>
              ) : (
                <div className="animate-kodie-pop space-y-2">
                  {result.stdout && (
                    <pre className="whitespace-pre-wrap break-words text-emerald-300">
                      {result.stdout}
                    </pre>
                  )}
                  {result.stderr && (
                    <pre className="whitespace-pre-wrap break-words rounded-xl bg-rose-950/60 p-2.5 text-rose-300">
                      {result.stderr}
                    </pre>
                  )}
                  {!result.stdout && !result.stderr && result.ok && (
                    <p className="italic text-slate-400">
                      Program selesai tanpa mencetak output.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. SQL (SQLITE WASM) */}
        {track === 'sql' && (
          <div className="min-h-0 flex-1 overflow-auto bg-white dark:bg-[#0B1222]">
            {!result || result.track !== 'sql' ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <div className="kodie-card-blue max-w-xs rounded-2xl border border-blue-200/80 p-4 shadow-xs">
                  <p className="text-xs font-extrabold text-[#0F172A]">
                    🗄️ Database SQLite Siap Dijalankan!
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-700">
                    Tekan <strong>Run Kode</strong> untuk mengeksekusi query dan menampilkan tabel hasil.
                  </p>
                </div>
              </div>
            ) : result.ok ? (
              <div className="animate-kodie-pop">
                <SqlResultTable
                  tables={result.sqlTables ?? []}
                  affectedRows={result.sqlAffectedRows ?? 0}
                  statementsRun={result.sqlStatementsRun ?? 0}
                  durationMs={result.durationMs}
                />
              </div>
            ) : (
              <div className="animate-kodie-pop p-4">
                <pre className="whitespace-pre-wrap rounded-2xl bg-rose-950 p-3 font-mono text-xs text-rose-200">
                  {result.stderr}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* 5. TYPESCRIPT */}
        {track === 'typescript' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-auto bg-[#0B1736] p-3.5 text-slate-100">
            {!result || result.track !== 'typescript' ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-slate-300">
                <p className="text-xs font-bold text-white">
                  📘 Compiler TypeScript 5.8 Siap!
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Tekan <strong className="text-[#D9F952]">Run Kode</strong> untuk memeriksa tipe TypeScript (strict mode) dan menjalankan hasilnya.
                </p>
              </div>
            ) : result.tsDiagnostics && result.tsDiagnostics.length > 0 ? (
              <div className="animate-kodie-pop space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-bold text-rose-300">
                  <AlertTriangle className="h-4 w-4" />
                  Ditemukan {result.tsDiagnostics.length} Type Diagnostic
                </div>
                {result.tsDiagnostics.map((d, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-rose-500/30 bg-rose-950/50 p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-300">
                      <span>
                        Baris {d.line}, Kolom {d.column}
                      </span>
                      <span className="rounded-full bg-rose-900/70 px-2 py-0.5">
                        TS{d.code}
                      </span>
                    </div>
                    <p className="mt-1 text-rose-100">{d.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="animate-kodie-pop space-y-3">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D9F952] px-3 py-1 text-xs font-extrabold text-[#0F172A]">
                  <CheckCircle2 className="h-4 w-4" />
                  0 Type Error — Tipe Valid!
                </div>
                {result.stdout ? (
                  <pre className="whitespace-pre-wrap rounded-2xl bg-slate-900/90 p-3 font-mono text-xs text-emerald-300">
                    {result.stdout}
                  </pre>
                ) : (
                  <p className="font-mono text-xs italic text-slate-400">
                    {result.stderr || 'Kode valid tanpa output console.log().'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. JARINGAN CISCO */}
        {track === 'network' && (
          <NetworkSimulatorPane
            networkResult={
              result?.track === 'network' ? result.networkResult : undefined
            }
            runSignal={networkRunSignal}
          />
        )}

        {/* 7. IOT VIRTUAL ESP32 */}
        {track === 'iot' && (
          <IotSimulatorPane
            iotResult={result?.track === 'iot' ? result.iotResult : undefined}
            sensors={iotSensors}
            runSignal={iotRunSignal}
            onChangeSensors={onChangeIotSensors}
          />
        )}

        {/* 8. AI & DATA SCIENCE */}
        {track === 'ai_data' && (
          <AiDataPane
            aiResult={result?.track === 'ai_data' ? result.aiResult : undefined}
            stdout={result?.track === 'ai_data' ? result.stdout : ''}
          />
        )}

        {/* 9. SOFTWARE REST API */}
        {track === 'software_api' && (
          <ApiTesterPane
            apiResult={
              result?.track === 'software_api' ? result.apiResult : undefined
            }
            stdout={result?.track === 'software_api' ? result.stdout : ''}
            onSendApiTest={onSendApiTest}
          />
        )}
      </div>

      {/* Kotak Penjelasan Ramah Siswa dari Kiko saat Error */}
      {kikoExplanation && (
        <div className="animate-kodie-pop shrink-0 border-t border-rose-200/80 bg-gradient-to-r from-[#EFF6FF] via-white to-[#EEFFC2]/60 p-3 dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/40">
          <div className="flex items-start gap-3">
            <KikoAvatar mood="error" size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                Penjelasan Kiko: {kikoExplanation.title}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {kikoExplanation.explanation}
              </p>
              <p className="mt-1.5 inline-block rounded-full bg-[#D7FF73] px-2.5 py-0.5 text-[11px] font-extrabold text-[#0F172A]">
                💡 Tips: {kikoExplanation.tip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
