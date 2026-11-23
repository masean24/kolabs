import type { ConsoleEntry, ExecutionResult, SqlTableResult } from '../types/lab';
import { loadExternalScript } from './cdnLoader';

const SQLJS_BASE = 'https://cdn.jsdelivr.net/npm/sql.js@1.17.0/dist/';

interface SqlJsDatabase {
  exec: (sql: string) => { columns: string[]; values: (string | number | null | Uint8Array)[][] }[];
  getRowsModified: () => number;
  close: () => void;
}

interface SqlJsStatic {
  Database: new () => SqlJsDatabase;
}

declare global {
  interface Window {
    initSqlJs?: (config?: { locateFile?: (file: string) => string }) => Promise<SqlJsStatic>;
  }
}

let sqlPromise: Promise<SqlJsStatic> | null = null;

async function getSqlJs(onStatus?: (message: string) => void): Promise<SqlJsStatic> {
  if (sqlPromise) return sqlPromise;

  sqlPromise = (async () => {
    onStatus?.('Mengunduh SQLite WebAssembly (sql.js)...');
    await loadExternalScript('sqljs', [`${SQLJS_BASE}sql-wasm.js`]);

    if (typeof window.initSqlJs !== 'function') {
      throw new Error('initSqlJs tidak ditemukan setelah skrip dimuat.');
    }

    onStatus?.('Menyiapkan database SQLite in-memory...');
    const SQL = await window.initSqlJs({
      locateFile: (file: string) => `${SQLJS_BASE}${file}`,
    });
    onStatus?.('SQLite siap digunakan!');
    return SQL;
  })();

  try {
    return await sqlPromise;
  } catch (err) {
    sqlPromise = null;
    throw err;
  }
}

/**
 * Memecah skrip SQL menjadi statement terpisah sambil menghormati string literal
 * (`'...'`, `"..."`) dan komentar baris/blok SQL.
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const ch = sql[i];
    const next = sql[i + 1] ?? '';

    if (inLineComment) {
      current += ch;
      if (ch === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += ch;
      if (ch === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (ch === '-' && next === '-') {
        inLineComment = true;
        current += ch;
        continue;
      }
      if (ch === '/' && next === '*') {
        inBlockComment = true;
        current += ch;
        continue;
      }
    }

    if (ch === "'" && !inDoubleQuote) {
      if (inSingleQuote && next === "'") {
        current += "''";
        i += 1;
        continue;
      }
      inSingleQuote = !inSingleQuote;
      current += ch;
      continue;
    }

    if (ch === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      current += ch;
      continue;
    }

    if (ch === ';' && !inSingleQuote && !inDoubleQuote) {
      const trimmed = current.trim();
      if (trimmed) statements.push(trimmed);
      current = '';
      continue;
    }

    current += ch;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);

  return statements.filter((stmt) => {
    const withoutComments = stmt
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
    return withoutComments.length > 0;
  });
}

export async function runSqlCode(
  code: string,
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();
  let db: SqlJsDatabase | null = null;

  try {
    const SQL = await getSqlJs(onStatus);
    onStatus?.('Menjalankan query SQL...');
    db = new SQL.Database();

    const statements = splitSqlStatements(code);
    const sqlTables: SqlTableResult[] = [];
    let sqlAffectedRows = 0;
    let sqlStatementsRun = 0;

    for (const stmt of statements) {
      const resSets = db.exec(stmt);
      sqlStatementsRun += 1;
      if (resSets.length > 0) {
        for (const set of resSets) {
          sqlTables.push({
            columns: set.columns,
            values: set.values,
            statement: stmt,
          });
        }
      } else {
        sqlAffectedRows += db.getRowsModified();
      }
    }

    const durationMs = Math.round(performance.now() - start);
    const summaryText = `${sqlStatementsRun} perintah dijalankan · ${sqlTables.length} tabel hasil · ${sqlAffectedRows} baris dimodifikasi.`;
    const consoleLogs: ConsoleEntry[] = [
      { id: `sql-ok-${Date.now()}`, level: 'info', text: summaryText, timestamp: Date.now() },
    ];

    return {
      track: 'sql',
      ok: true,
      stdout: summaryText,
      stderr: '',
      consoleLogs,
      sqlTables,
      sqlAffectedRows,
      sqlStatementsRun,
      exitCode: 0,
      durationMs,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'sql',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `sql-err-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      sqlTables: [],
      sqlAffectedRows: 0,
      sqlStatementsRun: 0,
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  } finally {
    db?.close();
  }
}
