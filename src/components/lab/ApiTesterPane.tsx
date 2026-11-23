import { useEffect, useState } from 'react';
import { Send, ServerCog, Terminal } from 'lucide-react';
import type { ApiSimResult, ApiTestResponse } from '../../types/lab';

interface ApiTesterPaneProps {
  apiResult: ApiSimResult | undefined;
  stdout: string;
  onSendApiTest: (
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    bodyJson: string
  ) => void;
}

export function ApiTesterPane({
  apiResult,
  stdout,
  onSendApiTest,
}: ApiTesterPaneProps) {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [path, setPath] = useState('/api/kursus');
  const [bodyJson, setBodyJson] = useState(
    '{\n  "judul": "Jaringan Cisco Dasar",\n  "level": "SMA"\n}'
  );

  const firstRoute = apiResult?.routes?.[0];
  const firstMethod = firstRoute?.method;
  const firstPath = firstRoute?.path;
  const routeSignature =
    apiResult?.routes.map((r) => `${r.method}:${r.path}`).join('|') ?? '';

  useEffect(() => {
    if (firstMethod && firstPath) {
      setMethod(firstMethod);
      setPath(
        firstPath.includes(':id') ? firstPath.replace(':id', '1') : firstPath
      );
    }
  }, [routeSignature, firstMethod, firstPath]);

  if (!apiResult) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="kodie-card-blue max-w-sm rounded-2xl border border-blue-200/80 p-5 shadow-xs">
          <ServerCog className="mx-auto mb-2 h-8 w-8 text-[#1D4ED8]" />
          <p className="text-xs font-extrabold text-[#0F172A]">
            💻 Mini REST API + Postman Tester Siap!
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-700">
            Tekan <strong>Run Kode</strong> untuk menyalakan server endpoint dan
            menguji request HTTP langsung di browser.
          </p>
        </div>
      </div>
    );
  }

  const lastRes: ApiTestResponse | undefined = apiResult.lastResponse;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Daftar Endpoint & Mini Postman Bar */}
      <div className="space-y-2.5 border-b border-slate-200/80 bg-[#F4F7FC] p-3 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
            Endpoint Aktif ({apiResult.routes.length}):
          </span>
          {apiResult.routes.map((rt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setMethod(rt.method);
                setPath(
                  rt.path.includes(':id') ? rt.path.replace(':id', '1') : rt.path
                );
              }}
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#0F172A] transition hover:border-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <span
                className={
                  rt.method === 'GET'
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : rt.method === 'POST'
                    ? 'text-[#1D4ED8] dark:text-sky-400'
                    : 'text-amber-600'
                }
              >
                {rt.method}
              </span>
              <span>{rt.path}</span>
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendApiTest(method, path, bodyJson);
          }}
          className="flex flex-wrap gap-2"
        >
          <select
            value={method}
            onChange={(e) =>
              setMethod(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')
            }
            aria-label="HTTP Method"
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs font-extrabold text-[#1D4ED8] outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>

          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/api/..."
            aria-label="Endpoint Path"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-mono text-xs font-semibold text-[#0F172A] outline-none focus:border-[#1D4ED8] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#D9F952] px-4 py-1.5 text-xs font-extrabold text-[#0F172A] shadow-xs transition hover:bg-[#C8EC3B]"
          >
            <span>Kirim</span>
            <Send className="h-3 w-3" />
          </button>
        </form>

        {(method === 'POST' || method === 'PUT') && (
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
              JSON Body Request:
            </label>
            <textarea
              rows={3}
              value={bodyJson}
              onChange={(e) => setBodyJson(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-[#0F172A] outline-none focus:border-[#1D4ED8] dark:border-slate-700 dark:bg-[#0B1222] dark:text-slate-100"
            />
          </div>
        )}
      </div>

      {/* Response JSON Viewer */}
      <div className="min-h-0 flex-1 overflow-auto bg-[#0B1736] p-3.5 text-slate-100">
        {lastRes ? (
          <div className="animate-kodie-pop space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono text-[11px] font-extrabold ${
                    lastRes.status >= 200 && lastRes.status < 300
                      ? 'bg-[#D9F952] text-[#0F172A]'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {lastRes.status} {lastRes.statusText}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">
                  {lastRes.method} {lastRes.path}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {lastRes.durationMs} ms
              </span>
            </div>

            <pre className="overflow-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-3 font-mono text-xs leading-relaxed text-emerald-300">
              {JSON.stringify(lastRes.body, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-xs italic text-slate-400">
            Klik salah satu endpoint di atas lalu tekan Kirim untuk melihat respons JSON.
          </p>
        )}

        {stdout && (
          <div className="mt-3 border-t border-slate-800 pt-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
              <Terminal className="h-3 w-3 text-[#D9F952]" />
              Log Server
            </div>
            <pre className="whitespace-pre-wrap font-mono text-[11px] text-slate-300">
              {stdout}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
