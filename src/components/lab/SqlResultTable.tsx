import { CheckCircle2, Database, Table2 } from 'lucide-react';
import type { SqlTableResult } from '../../types/lab';

interface SqlResultTableProps {
  tables: SqlTableResult[];
  affectedRows: number;
  statementsRun: number;
  durationMs?: number;
}

export function SqlResultTable({
  tables,
  affectedRows,
  statementsRun,
  durationMs,
}: SqlResultTableProps) {
  return (
    <div className="space-y-4 p-3 sm:p-4">
      {/* Ringkasan Eksekusi Query */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-blue-200/80 bg-[#EFF6FF] px-3.5 py-2 text-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 font-bold text-[#0F172A] dark:text-slate-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>
            {statementsRun} perintah dijalankan · {affectedRows} baris
            terpengaruh
          </span>
        </div>
        {typeof durationMs === 'number' && (
          <span className="rounded-full bg-[#C6F64D] px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-[#0F172A]">
            {durationMs} ms
          </span>
        )}
      </div>

      {tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <Database className="mb-2 h-7 w-7 text-[#1D4ED8] dark:text-blue-400" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
            Perintah DDL/DML berhasil dieksekusi!
          </p>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            Tambahkan query <code className="font-mono">SELECT ... FROM ...;</code> untuk melihat isi tabel.
          </p>
        </div>
      ) : (
        tables.map((tbl, idx) => (
          <div
            key={idx}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0F172A]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/90">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0F172A] dark:text-white">
                <Table2 className="h-3.5 w-3.5 text-[#1D4ED8] dark:text-blue-400" />
                <span>Hasil Query #{idx + 1}</span>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-[#1D4ED8] dark:bg-blue-950 dark:text-blue-300">
                {tbl.values.length} baris
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-800">
                <thead className="bg-slate-50/80 dark:bg-slate-900/50">
                  <tr>
                    {tbl.columns.map((col, cIdx) => (
                      <th
                        key={cIdx}
                        className="whitespace-nowrap px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {tbl.values.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tbl.columns.length}
                        className="px-3 py-4 text-center text-xs italic text-slate-400"
                      >
                        (0 baris ditemukan)
                      </td>
                    </tr>
                  ) : (
                    tbl.values.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="transition hover:bg-blue-50/40 dark:hover:bg-slate-800/40"
                      >
                        {row.map((cell, cellIdx) => (
                          <td
                            key={cellIdx}
                            className="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-800 dark:text-slate-200"
                          >
                            {cell === null ? (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] italic text-slate-400 dark:bg-slate-800">
                                NULL
                              </span>
                            ) : (
                              String(cell)
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
