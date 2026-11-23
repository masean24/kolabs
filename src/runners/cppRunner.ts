import type { ConsoleEntry, ExecutionResult } from '../types/lab';
import { loadExternalScript } from './cdnLoader';

const JSCPP_URLS = [
  'https://felixhao28.github.io/JSCPP/dist/JSCPP.es5.min.js',
  'https://cdn.jsdelivr.net/gh/felixhao28/JSCPP@gh-pages/dist/JSCPP.es5.min.js',
];

interface JscppConfig {
  stdio?: {
    write?: (s: string) => void;
  };
  unsigned_overflow?: 'error' | 'warn' | 'ignore';
  maxTimeout?: number;
}

interface JscppGlobal {
  run: (code: string, input: string, config?: JscppConfig) => number;
}

declare global {
  interface Window {
    JSCPP?: JscppGlobal;
  }
}

async function getJscpp(onStatus?: (message: string) => void): Promise<JscppGlobal> {
  if (window.JSCPP) return window.JSCPP;
  onStatus?.('Mengunduh interpreter C++ (JSCPP)...');
  await loadExternalScript('jscpp', JSCPP_URLS);
  if (!window.JSCPP) {
    throw new Error('Runtime JSCPP gagal diinisialisasi di browser.');
  }
  onStatus?.('Compiler/Interpreter C++ siap!');
  return window.JSCPP;
}

export async function runCppCode(
  code: string,
  stdin: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    const JSCPP = await getJscpp(onStatus);
    onStatus?.('Menjalankan program C++...');

    let stdout = '';
    const exitCode = JSCPP.run(code, stdin ?? '', {
      stdio: {
        write(chunk: string) {
          stdout += chunk;
        },
      },
      unsigned_overflow: 'warn',
      maxTimeout: 3000,
    });

    const durationMs = Math.round(performance.now() - start);
    const consoleLogs: ConsoleEntry[] = stdout
      ? [{ id: `cpp-out-${Date.now()}`, level: 'log', text: stdout, timestamp: Date.now() }]
      : [];

    return {
      track: 'cpp',
      ok: true,
      stdout,
      stderr: '',
      consoleLogs,
      exitCode: typeof exitCode === 'number' ? exitCode : 0,
      durationMs,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const durationMs = Math.round(performance.now() - start);
    return {
      track: 'cpp',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `cpp-err-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs,
      errorRaw: msg,
    };
  }
}
