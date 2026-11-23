import type { ConsoleEntry, ExecutionResult, TsDiagnostic } from '../types/lab';
import { loadExternalScript } from './cdnLoader';

const TS_CDN_URL = 'https://cdn.jsdelivr.net/npm/typescript@5.8.3/lib/typescript.js';

interface TsGlobal {
  ScriptTarget: { ES2020: number };
  ModuleKind: { None: number };
  DiagnosticCategory: { Error: number; Warning: number };
  createSourceFile: (fileName: string, text: string, target: number) => unknown;
  createProgram: (opts: {
    rootNames: string[];
    options: Record<string, unknown>;
    host: Record<string, unknown>;
  }) => {
    getSourceFile: (name: string) => unknown;
  };
  getPreEmitDiagnostics: (program: unknown) => Array<{
    file?: {
      fileName: string;
      getLineAndCharacterOfPosition: (pos: number) => { line: number; character: number };
    };
    start?: number;
    code: number;
    category: number;
    messageText: string | { messageText: string };
  }>;
  flattenDiagnosticMessageText: (
    msg: string | { messageText: string },
    newLine: string
  ) => string;
  transpileModule: (
    input: string,
    opts: { compilerOptions: Record<string, unknown> }
  ) => { outputText: string };
}

declare global {
  interface Window {
    ts?: TsGlobal;
  }
}

/**
 * Deklarasi tipe standar ringkas untuk compiler TypeScript in-memory di browser
 * sehingga type-checking (`strict: true`) berjalan instan tanpa mengunduh puluhan file `.d.ts`.
 */
const KODIE_MINI_LIB_DTS = `
interface PropertyKey {}
interface Object {
  toString(): string;
  hasOwnProperty(v: string | number | symbol): boolean;
}
interface Function {
  apply(thisArg: any, argArray?: any): any;
  call(thisArg: any, ...argArray: any[]): any;
  bind(thisArg: any, ...argArray: any[]): any;
}
interface CallableFunction extends Function {}
interface NewableFunction extends Function {}
interface Boolean {}
interface IArguments {}
interface Number {
  toFixed(fractionDigits?: number): string;
  toString(radix?: number): string;
}
interface String {
  readonly length: number;
  trim(): string;
  toUpperCase(): string;
  toLowerCase(): string;
  includes(searchString: string, position?: number): boolean;
  startsWith(searchString: string): boolean;
  endsWith(searchString: string): boolean;
  split(separator: string | RegExp, limit?: number): string[];
  slice(start?: number, end?: number): string;
  replace(searchValue: string | RegExp, replaceValue: string): string;
  padStart(maxLength: number, fillString?: string): string;
}
interface RegExp {}
interface Array<T> {
  readonly length: number;
  push(...items: T[]): number;
  pop(): T | undefined;
  shift(): T | undefined;
  slice(start?: number, end?: number): T[];
  concat(...items: (T | ReadonlyArray<T>)[]): T[];
  join(separator?: string): string;
  includes(searchElement: T, fromIndex?: number): boolean;
  indexOf(searchElement: T, fromIndex?: number): number;
  forEach(callbackfn: (value: T, index: number, array: T[]) => void): void;
  map<U>(callbackfn: (value: T, index: number, array: T[]) => U): U[];
  filter(predicate: (value: T, index: number, array: T[]) => unknown): T[];
  find(predicate: (value: T, index: number, array: T[]) => unknown): T | undefined;
  some(predicate: (value: T, index: number, array: T[]) => unknown): boolean;
  every(predicate: (value: T, index: number, array: T[]) => unknown): boolean;
  reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T): T;
  reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): U;
  sort(compareFn?: (a: T, b: T) => number): this;
}
interface ReadonlyArray<T> {
  readonly length: number;
  map<U>(callbackfn: (value: T, index: number, array: readonly T[]) => U): U[];
  filter(predicate: (value: T, index: number, array: readonly T[]) => unknown): T[];
  join(separator?: string): string;
  includes(searchElement: T): boolean;
  forEach(callbackfn: (value: T, index: number, array: readonly T[]) => void): void;
}
type Record<K extends string | number | symbol, T> = { [P in K]: T };
type Partial<T> = { [P in keyof T]?: T[P] };
type Required<T> = { [P in keyof T]-?: T[P] };
type Readonly<T> = { readonly [P in keyof T]: T[P] };
type Pick<T, K extends keyof T> = { [P in K]: T[P] };
type Omit<T, K extends string | number | symbol> = Pick<T, Exclude<keyof T, K>>;
type Exclude<T, U> = T extends U ? never : T;

interface TemplateStringsArray extends ReadonlyArray<string> {
  readonly raw: readonly string[];
}
interface Error {
  name: string;
  message: string;
}
interface ErrorConstructor {
  new (message?: string): Error;
}
declare var Error: ErrorConstructor;

interface Map<K, V> {
  clear(): void;
  delete(key: K): boolean;
  get(key: K): V | undefined;
  has(key: K): boolean;
  set(key: K, value: V): this;
  readonly size: number;
}
interface MapConstructor {
  new <K = any, V = any>(entries?: readonly (readonly [K, V])[] | null): Map<K, V>;
}
declare var Map: MapConstructor;

interface Set<T> {
  add(value: T): this;
  clear(): void;
  delete(value: T): boolean;
  has(value: T): boolean;
  readonly size: number;
}
interface SetConstructor {
  new <T = any>(values?: readonly T[] | null): Set<T>;
}
declare var Set: SetConstructor;

interface Math {
  readonly PI: number;
  abs(x: number): number;
  ceil(x: number): number;
  floor(x: number): number;
  round(x: number): number;
  max(...values: number[]): number;
  min(...values: number[]): number;
  pow(x: number, y: number): number;
  sqrt(x: number): number;
  random(): number;
}
declare var Math: Math;

interface JSON {
  parse(text: string): any;
  stringify(value: any, replacer?: any, space?: string | number): string;
}
declare var JSON: JSON;

interface Console {
  log(...data: any[]): void;
  info(...data: any[]): void;
  warn(...data: any[]): void;
  error(...data: any[]): void;
}
declare var console: Console;

declare function parseInt(string: string, radix?: number): number;
declare function parseFloat(string: string): number;
declare function isNaN(number: number): boolean;
`;

export async function getTypeScript(onStatus?: (message: string) => void): Promise<TsGlobal> {
  if (window.ts) return window.ts;
  onStatus?.('Mengunduh compiler TypeScript 5.8...');
  await loadExternalScript('typescript', [TS_CDN_URL]);
  if (!window.ts) {
    throw new Error('Compiler TypeScript tidak ditemukan setelah dimuat.');
  }
  onStatus?.('Compiler TypeScript siap!');
  return window.ts;
}

export async function transpileTsSnippet(
  code: string,
  onStatus?: (message: string) => void
): Promise<string> {
  const ts = await getTypeScript(onStatus);
  const emitted = ts.transpileModule(code, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
    },
  });
  return emitted.outputText;
}

function formatLogArg(val: unknown): string {
  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (val instanceof Error) return `${val.name}: ${val.message}`;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

export async function runTypeScriptCode(
  code: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    const ts = await getTypeScript(onStatus);
    onStatus?.('Memeriksa tipe & mengompilasi TypeScript...');

    const mainFile = 'main.ts';
    const libFile = 'lib.kodie.d.ts';
    const filesMap = new Map<string, string>([
      [mainFile, code],
      [libFile, KODIE_MINI_LIB_DTS],
    ]);

    const compilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.None,
      strict: true,
      noImplicitAny: true,
      strictNullChecks: true,
      lib: [libFile],
    };

    const host: Record<string, unknown> = {
      getSourceFile: (fileName: string, languageVersion: number) => {
        const content = filesMap.get(fileName);
        if (content === undefined) return undefined;
        return ts.createSourceFile(fileName, content, languageVersion);
      },
      getDefaultLibFileName: () => libFile,
      writeFile: () => {},
      getCurrentDirectory: () => '',
      getDirectories: () => [],
      fileExists: (fileName: string) => filesMap.has(fileName),
      readFile: (fileName: string) => filesMap.get(fileName),
      getCanonicalFileName: (fileName: string) => fileName,
      useCaseSensitiveFileNames: () => true,
      getNewLine: () => '\n',
    };

    const program = ts.createProgram({
      rootNames: [mainFile],
      options: compilerOptions,
      host,
    });

    const rawDiagnostics = ts.getPreEmitDiagnostics(program);
    const tsDiagnostics: TsDiagnostic[] = rawDiagnostics
      .filter((d) => !d.file || d.file.fileName === mainFile)
      .map((d) => {
        const pos =
          d.file && typeof d.start === 'number'
            ? d.file.getLineAndCharacterOfPosition(d.start)
            : { line: 0, character: 0 };
        return {
          line: pos.line + 1,
          column: pos.character + 1,
          code: d.code,
          message: ts.flattenDiagnosticMessageText(d.messageText, '\n'),
          category:
            d.category === ts.DiagnosticCategory.Warning ? 'warning' : 'error',
        };
      });

    const errors = tsDiagnostics.filter((d) => d.category === 'error');
    if (errors.length > 0) {
      const errorText = errors
        .map((e) => `Baris ${e.line}, Kolom ${e.column} [TS${e.code}]: ${e.message}`)
        .join('\n');
      return {
        track: 'typescript',
        ok: false,
        stdout: '',
        stderr: errorText,
        consoleLogs: errors.map((e, idx) => ({
          id: `ts-diag-${idx}-${Date.now()}`,
          level: 'error',
          text: `Baris ${e.line}:${e.column} [TS${e.code}] — ${e.message}`,
          timestamp: Date.now(),
        })),
        tsDiagnostics,
        exitCode: 1,
        durationMs: Math.round(performance.now() - start),
        errorRaw: errorText,
      };
    }

    const emitted = ts.transpileModule(code, {
      compilerOptions: {
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.None,
      },
    });

    const consoleLogs: ConsoleEntry[] = [];
    const stdoutLines: string[] = [];

    const pushLog = (level: ConsoleEntry['level'], args: unknown[]) => {
      const text = args.map(formatLogArg).join(' ');
      stdoutLines.push(text);
      consoleLogs.push({
        id: `ts-log-${consoleLogs.length}-${Date.now()}`,
        level,
        text,
        timestamp: Date.now(),
      });
    };

    const sandboxConsole = {
      log: (...args: unknown[]) => pushLog('log', args),
      info: (...args: unknown[]) => pushLog('info', args),
      warn: (...args: unknown[]) => pushLog('warn', args),
      error: (...args: unknown[]) => pushLog('error', args),
    };

    try {
      const fn = new Function('console', emitted.outputText);
      fn(sandboxConsole);
    } catch (runtimeErr) {
      const msg = runtimeErr instanceof Error ? runtimeErr.message : String(runtimeErr);
      consoleLogs.push({
        id: `ts-rt-${Date.now()}`,
        level: 'error',
        text: msg,
        timestamp: Date.now(),
      });
      return {
        track: 'typescript',
        ok: false,
        stdout: stdoutLines.join('\n'),
        stderr: msg,
        consoleLogs,
        tsDiagnostics,
        exitCode: 1,
        durationMs: Math.round(performance.now() - start),
        errorRaw: msg,
      };
    }

    return {
      track: 'typescript',
      ok: true,
      stdout: stdoutLines.join('\n'),
      stderr: '',
      consoleLogs,
      tsDiagnostics,
      exitCode: 0,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'typescript',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `ts-sys-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      tsDiagnostics: [],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
