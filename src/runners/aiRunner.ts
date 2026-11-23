import type { AiDataResult, ConsoleEntry, ExecutionResult } from '../types/lab';
import { getPyodide } from './pythonRunner';

/**
 * Menjalankan skrip Python AI & Data menggunakan Pyodide WebAssembly +
 * modul virtual `kodie_ai` untuk merender grafik regresi, bar chart, & metrik prediksi.
 */
export async function runAiDataCode(
  code: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    const pyodide = await getPyodide(onStatus);
    onStatus?.('Menjalankan model AI & visualisasi data...');

    pyodide.globals.set('__kodie_ai_code__', code);

    const harness = `
import sys, io, types, json, traceback

_kodie_charts = []
_kodie_metrics = None

def _plot_regression(x_list, y_list, slope, intercept, title="Regresi Linear", x_label="X", y_label="Y", test_x=None):
    xs = [float(v) for v in x_list]
    ys = [float(v) for v in y_list]
    if len(xs) != len(ys) or len(xs) < 2:
        raise ValueError("Data X dan Y harus sama panjang dan minimal 2 titik.")
    s = float(slope)
    b = float(intercept)
    mean_y = sum(ys) / len(ys)
    ss_tot = sum((yi - mean_y) ** 2 for yi in ys)
    ss_res = sum((yi - (s * xi + b)) ** 2 for xi, yi in zip(xs, ys))
    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 1.0
    chart = {
        "kind": "regression",
        "title": str(title),
        "xLabel": str(x_label),
        "yLabel": str(y_label),
        "points": [{"x": xi, "y": yi} for xi, yi in zip(xs, ys)],
        "slope": s,
        "intercept": b,
        "r2": round(max(0.0, min(1.0, r2)), 4),
    }
    if test_x is not None:
        tx = float(test_x)
        chart["testX"] = tx
        chart["testPredY"] = round(s * tx + b, 2)
    _kodie_charts.append(chart)

def _plot_bar(labels, values, title="Grafik Data"):
    lbs = [str(l) for l in labels]
    vals = [float(v) for v in values]
    palette = ["#1D4ED8", "#C6F64D", "#3B82F6", "#10B981", "#F59E0B"]
    items = []
    for idx, (lbl, val) in enumerate(zip(lbs, vals)):
        items.append({"label": lbl, "value": val, "color": palette[idx % len(palette)]})
    _kodie_charts.append({"kind": "bar", "title": str(title), "items": items})

def _show_metrics(accuracy_pct, total_samples, model_name="Model AI Kodie", predictions=None):
    global _kodie_metrics
    preds = []
    if predictions:
        for p in predictions:
            preds.append({
                "input": str(p.get("input", "")),
                "actual": str(p.get("actual", "")),
                "predicted": str(p.get("predicted", "")),
                "correct": bool(p.get("correct", False)),
            })
    _kodie_metrics = {
        "modelName": str(model_name),
        "accuracyPct": round(float(accuracy_pct), 1),
        "totalSamples": int(total_samples),
        "predictions": preds,
    }

_ai_mod = types.ModuleType("kodie_ai")
_ai_mod.plot_regression = _plot_regression
_ai_mod.plot_bar = _plot_bar
_ai_mod.show_metrics = _show_metrics

_prev_ai = sys.modules.get("kodie_ai")
sys.modules["kodie_ai"] = _ai_mod

_kodie_stdout = io.StringIO()
_kodie_stderr = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr
sys.stdout = _kodie_stdout
sys.stderr = _kodie_stderr

_ai_err = ""
_ai_exit = 0
_ns = {"__name__": "__main__"}
try:
    exec(compile(__kodie_ai_code__, "model_ai.py", "exec"), _ns)
except Exception:
    _ai_exit = 1
    _ai_err = traceback.format_exc()
finally:
    sys.stdout = _orig_stdout
    sys.stderr = _orig_stderr
    if _prev_ai is not None:
        sys.modules["kodie_ai"] = _prev_ai

_kodie_ai_result = (
    json.dumps({"charts": _kodie_charts, "metrics": _kodie_metrics}),
    _kodie_stdout.getvalue(),
    _kodie_stderr.getvalue(),
    _ai_err,
    _ai_exit,
)
`;

    await pyodide.runPythonAsync(harness);
    const proxy = pyodide.globals.get('_kodie_ai_result') as {
      toJs: () => [string, string, string, string, number];
      destroy?: () => void;
    };
    const [aiJson, stdout, stderr, pyErr, exitCode] = proxy.toJs();
    proxy.destroy?.();

    const parsedAi = JSON.parse(aiJson) as {
      charts: AiDataResult['charts'];
      metrics?: AiDataResult['metrics'] | null;
    };

    const aiResult: AiDataResult = {
      charts: parsedAi.charts ?? [],
      metrics: parsedAi.metrics ?? undefined,
    };

    const combinedErr = [stderr, pyErr].filter(Boolean).join('\n').trim();
    const ok = exitCode === 0 && !combinedErr;

    const consoleLogs: ConsoleEntry[] = [];
    if (stdout) {
      consoleLogs.push({
        id: `ai-out-${Date.now()}`,
        level: 'log',
        text: stdout,
        timestamp: Date.now(),
      });
    }
    if (combinedErr) {
      consoleLogs.push({
        id: `ai-err-${Date.now()}`,
        level: 'error',
        text: combinedErr,
        timestamp: Date.now(),
      });
    }

    return {
      track: 'ai_data',
      ok,
      stdout,
      stderr: combinedErr,
      consoleLogs,
      aiResult,
      exitCode,
      durationMs: Math.round(performance.now() - start),
      errorRaw: combinedErr || undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'ai_data',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `ai-sys-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
