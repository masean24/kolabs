import type { ConsoleEntry, ExecutionResult } from '../types/lab';
import { loadExternalScript } from './cdnLoader';

const PYODIDE_VERSION = 'v0.27.5';
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/${PYODIDE_VERSION}/full/`;

interface PyodideInstance {
  runPythonAsync: (code: string) => Promise<unknown>;
  globals: {
    set: (key: string, value: unknown) => void;
    get: (key: string) => unknown;
    delete: (key: string) => void;
  };
}

declare global {
  interface Window {
    loadPyodide?: (opts?: { indexURL?: string }) => Promise<PyodideInstance>;
  }
}

let pyodidePromise: Promise<PyodideInstance> | null = null;

/**
 * Memuat runtime Pyodide (WebAssembly) secara lazy-load dan men-cache instansinya
 * untuk dipakai bersama oleh runner Python dan Python Turtle.
 */
export async function getPyodide(
  onStatus?: (message: string) => void
): Promise<PyodideInstance> {
  if (pyodidePromise) return pyodidePromise;

  pyodidePromise = (async () => {
    onStatus?.('Mengunduh mesin Python WebAssembly (Pyodide)...');
    await loadExternalScript('pyodide', [`${PYODIDE_BASE}pyodide.js`]);

    if (typeof window.loadPyodide !== 'function') {
      throw new Error('Fungsi loadPyodide tidak ditemukan setelah skrip dimuat.');
    }

    onStatus?.('Menyiapkan lingkungan Python 3 di browser...');
    const instance = await window.loadPyodide({ indexURL: PYODIDE_BASE });
    onStatus?.('Python siap digunakan!');
    return instance;
  })();

  try {
    return await pyodidePromise;
  } catch (err) {
    pyodidePromise = null;
    throw err;
  }
}

export async function runPythonCode(
  code: string,
  stdin: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    const pyodide = await getPyodide(onStatus);
    onStatus?.('Menjalankan kode Python...');

    pyodide.globals.set('__kodie_user_code__', code);
    pyodide.globals.set('__kodie_stdin_raw__', stdin ?? '');

    const harness = `
import sys, io, builtins, traceback

_kodie_stdout = io.StringIO()
_kodie_stderr = io.StringIO()
_kodie_orig_stdout = sys.stdout
_kodie_orig_stderr = sys.stderr
_kodie_orig_input = builtins.input

_kodie_lines = __kodie_stdin_raw__.splitlines()
_kodie_idx = [0]

def _kodie_input(prompt=""):
    if prompt:
        _kodie_stdout.write(str(prompt))
    if _kodie_idx[0] >= len(_kodie_lines):
        raise EOFError("Input Program (stdin) kosong atau baris input sudah habis.")
    val = _kodie_lines[_kodie_idx[0]]
    _kodie_idx[0] += 1
    _kodie_stdout.write(val + "\\n")
    return val

sys.stdout = _kodie_stdout
sys.stderr = _kodie_stderr
builtins.input = _kodie_input

_kodie_error = ""
_kodie_exit = 0
_kodie_ns = {"__name__": "__main__"}

try:
    exec(compile(__kodie_user_code__, "main.py", "exec"), _kodie_ns)
except Exception:
    _kodie_exit = 1
    _kodie_error = traceback.format_exc()
finally:
    sys.stdout = _kodie_orig_stdout
    sys.stderr = _kodie_orig_stderr
    builtins.input = _kodie_orig_input

_kodie_result = (_kodie_stdout.getvalue(), _kodie_stderr.getvalue(), _kodie_error, _kodie_exit)
`;

    await pyodide.runPythonAsync(harness);
    const resultProxy = pyodide.globals.get('_kodie_result') as {
      toJs: () => [string, string, string, number];
      destroy?: () => void;
    };
    const [stdout, stderr, pyErr, exitCode] = resultProxy.toJs();
    resultProxy.destroy?.();

    const durationMs = Math.round(performance.now() - start);
    const combinedErr = [stderr, pyErr].filter(Boolean).join('\n').trim();
    const ok = exitCode === 0 && !combinedErr;

    const consoleLogs: ConsoleEntry[] = [];
    if (stdout) {
      consoleLogs.push({
        id: `py-out-${Date.now()}`,
        level: 'log',
        text: stdout,
        timestamp: Date.now(),
      });
    }
    if (combinedErr) {
      consoleLogs.push({
        id: `py-err-${Date.now()}`,
        level: 'error',
        text: combinedErr,
        timestamp: Date.now(),
      });
    }

    return {
      track: 'python',
      ok,
      stdout,
      stderr: combinedErr,
      consoleLogs,
      exitCode,
      durationMs,
      errorRaw: combinedErr || undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'python',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `py-sys-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
