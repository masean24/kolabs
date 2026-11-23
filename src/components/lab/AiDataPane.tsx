import { useEffect, useState } from 'react';
import { BarChart3, BrainCircuit, CheckCircle2, XCircle } from 'lucide-react';
import type { AiDataResult, AiRegressionChart } from '../../types/lab';

interface AiDataPaneProps {
  aiResult: AiDataResult | undefined;
  stdout: string;
}

function RegressionSvgChart({ chart }: { chart: AiRegressionChart }) {
  const minDataX = Math.min(...chart.points.map((p) => p.x));
  const maxDataX = Math.max(...chart.points.map((p) => p.x));
  const [customX, setCustomX] = useState<number>(
    chart.testX ?? Number(((minDataX + maxDataX) / 2).toFixed(1))
  );

  useEffect(() => {
    setCustomX(
      chart.testX ?? Number(((minDataX + maxDataX) / 2).toFixed(1))
    );
  }, [chart.testX, minDataX, maxDataX]);

  const sliderMin = Math.floor(Math.min(0, minDataX));
  const sliderMax = Math.ceil(Math.max(maxDataX + 3, customX + 1));

  const allX = [...chart.points.map((p) => p.x), customX];
  const xMin = Math.min(...allX) - 0.5;
  const xMax = Math.max(...allX) + 0.5;

  const predCustomY = chart.slope * customX + chart.intercept;
  const allY = [
    ...chart.points.map((p) => p.y),
    predCustomY,
    chart.slope * xMin + chart.intercept,
    chart.slope * xMax + chart.intercept,
  ];
  const yMin = Math.min(...allY) - 5;
  const yMax = Math.max(...allY) + 5;

  const W = 440;
  const H = 210;
  const padL = 42;
  const padR = 18;
  const padT = 18;
  const padB = 32;

  const toPx = (x: number) =>
    padL + ((x - xMin) / Math.max(0.001, xMax - xMin)) * (W - padL - padR);
  const toPy = (y: number) =>
    H - padB - ((y - yMin) / Math.max(0.001, yMax - yMin)) * (H - padT - padB);

  const lineY1 = chart.slope * xMin + chart.intercept;
  const lineY2 = chart.slope * xMax + chart.intercept;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#0B1222]">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-extrabold text-[#0F172A] dark:text-white">
          {chart.title}
        </span>
        <span className="rounded-full bg-[#EFF6FF] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#1D4ED8] dark:bg-blue-950 dark:text-blue-300">
          R² = {chart.r2.toFixed(2)} · y = {chart.slope.toFixed(2)}x +{' '}
          {chart.intercept.toFixed(1)}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((frac) => {
          const gy = padT + frac * (H - padT - padB);
          return (
            <line
              key={frac}
              x1={padL}
              y1={gy}
              x2={W - padR}
              y2={gy}
              stroke="rgba(148,163,184,0.22)"
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={H - padB}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />
        <line
          x1={padL}
          y1={H - padB}
          x2={W - padR}
          y2={H - padB}
          stroke="#94A3B8"
          strokeWidth="1.5"
        />

        {/* Garis Regresi */}
        <line
          x1={toPx(xMin)}
          y1={toPy(lineY1)}
          x2={toPx(xMax)}
          y2={toPy(lineY2)}
          stroke="#3B82F6"
          strokeWidth="2.8"
          strokeLinecap="round"
        />

        {/* Titik Data Training */}
        {chart.points.map((pt, idx) => (
          <circle
            key={idx}
            cx={toPx(pt.x)}
            cy={toPy(pt.y)}
            r="5"
            fill="#1D4ED8"
            stroke="#FFFFFF"
            strokeWidth="1.5"
          />
        ))}

        {/* Titik Uji Prediksi Live (Lime) */}
        <circle
          cx={toPx(customX)}
          cy={toPy(predCustomY)}
          r="9"
          fill="#D9F952"
          opacity="0.35"
        />
        <circle
          cx={toPx(customX)}
          cy={toPy(predCustomY)}
          r="5.5"
          fill="#D9F952"
          stroke="#0F172A"
          strokeWidth="2"
        />

        {/* Label Sumbu */}
        <text
          x={(padL + W - padR) / 2}
          y={H - 6}
          textAnchor="middle"
          className="fill-slate-500 text-[10px] font-bold"
        >
          {chart.xLabel}
        </text>
        <text
          x={14}
          y={(padT + H - padB) / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${(padT + H - padB) / 2})`}
          className="fill-slate-500 text-[10px] font-bold"
        >
          {chart.yLabel}
        </text>
      </svg>

      {/* Slider Uji Prediksi Interaktif */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F4F7FC] px-3 py-2 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2">
          <span className="shrink-0 text-[11px] font-bold text-[#0F172A] dark:text-slate-200">
            🧪 Uji {chart.xLabel} = {customX}:
          </span>
          <input
            type="range"
            min={sliderMin}
            max={sliderMax}
            step={0.5}
            value={customX}
            onChange={(e) => setCustomX(Number(e.target.value))}
            aria-label="Uji Prediksi AI"
            className="w-full max-w-[180px] accent-[#1D4ED8]"
          />
        </div>
        <span className="rounded-full bg-[#D9F952] px-3 py-0.5 text-xs font-extrabold text-[#0F172A]">
          Prediksi {chart.yLabel}: {predCustomY.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

export function AiDataPane({ aiResult, stdout }: AiDataPaneProps) {
  if (!aiResult) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="kodie-card-blue max-w-sm rounded-2xl border border-blue-200/80 p-5 shadow-xs">
          <BrainCircuit className="mx-auto mb-2 h-8 w-8 text-[#1D4ED8]" />
          <p className="text-xs font-extrabold text-[#0F172A]">
            🤖 Lab AI &amp; Data Science Siap!
          </p>
          <p className="mt-1 text-[11px] font-medium text-slate-700">
            Tekan <strong>Run Kode</strong> untuk melatih model Python dan melihat
            grafik prediksi interaktif di sini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 space-y-3 overflow-auto bg-[#F4F7FC] p-3 dark:bg-slate-950/60">
        {aiResult.charts.map((chart, idx) =>
          chart.kind === 'regression' ? (
            <RegressionSvgChart key={idx} chart={chart} />
          ) : (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#0B1222]"
            >
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold text-[#0F172A] dark:text-white">
                <BarChart3 className="h-4 w-4 text-[#1D4ED8]" />
                <span>{chart.title}</span>
              </div>
              <div className="space-y-2">
                {(() => {
                  const maxVal = Math.max(1, ...chart.items.map((i) => i.value));
                  return chart.items.map((item, bIdx) => (
                    <div key={bIdx} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span>{item.label}</span>
                        <span className="font-mono">{item.value}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (item.value / maxVal) * 100)}%`,
                            backgroundColor: item.color ?? '#1D4ED8',
                          }}
                        />
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )
        )}

        {/* Ringkasan Akurasi & Tabel Prediksi */}
        {aiResult.metrics && (
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#0B1222]">
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs font-extrabold text-[#0F172A] dark:text-white">
                  {aiResult.metrics.modelName}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Evaluasi pada {aiResult.metrics.totalSamples} data uji
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-extrabold ${
                  aiResult.metrics.accuracyPct >= 80
                    ? 'bg-[#D9F952] text-[#0F172A]'
                    : 'bg-amber-100 text-amber-900'
                }`}
              >
                Akurasi: {aiResult.metrics.accuracyPct}%
              </span>
            </div>

            {aiResult.metrics.predictions.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs dark:divide-slate-800">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-900">
                    <tr>
                      <th className="px-2.5 py-1.5">Input</th>
                      <th className="px-2.5 py-1.5">Asli</th>
                      <th className="px-2.5 py-1.5">Prediksi AI</th>
                      <th className="px-2.5 py-1.5">Hasil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {aiResult.metrics.predictions.map((p, pIdx) => (
                      <tr key={pIdx}>
                        <td className="px-2.5 py-1.5 text-slate-700 dark:text-slate-200">
                          {p.input}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-[11px]">
                          {p.actual}
                        </td>
                        <td className="px-2.5 py-1.5 font-mono text-[11px] font-bold">
                          {p.predicted}
                        </td>
                        <td className="px-2.5 py-1.5">
                          {p.correct ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Console Output */}
      <div className="max-h-32 shrink-0 overflow-auto border-t border-slate-200 bg-[#0B1736] p-3 font-mono text-xs text-emerald-300 dark:border-slate-800">
        {stdout ? (
          <pre className="whitespace-pre-wrap">{stdout}</pre>
        ) : (
          <span className="text-slate-500">Log print() tampil di sini...</span>
        )}
      </div>
    </div>
  );
}
