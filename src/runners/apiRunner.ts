import type {
  ApiRouteInfo,
  ApiSimResult,
  ApiTestResponse,
  ConsoleEntry,
  ExecutionResult,
} from '../types/lab';
import { transpileTsSnippet } from './tsRunner';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RouteReq {
  params: Record<string, string>;
  query: Record<string, string>;
  body: unknown;
}

interface RouteRes {
  status?: number;
  body: unknown;
}

type RouteHandler = (req: RouteReq) => RouteRes | unknown;

interface RegisteredRoute extends ApiRouteInfo {
  handler: RouteHandler;
}

let activeRoutes: RegisteredRoute[] = [];

const STATUS_TEXTS: Record<number, string> = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  404: 'Not Found',
  500: 'Internal Server Error',
};

function matchRoute(
  patternPath: string,
  actualPath: string
): Record<string, string> | null {
  const cleanPattern = patternPath.split('?')[0].replace(/\/+$/, '') || '/';
  const cleanActual = actualPath.split('?')[0].replace(/\/+$/, '') || '/';
  const pSegs = cleanPattern.split('/');
  const aSegs = cleanActual.split('/');
  if (pSegs.length !== aSegs.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < pSegs.length; i += 1) {
    if (pSegs[i].startsWith(':')) {
      params[pSegs[i].slice(1)] = decodeURIComponent(aSegs[i]);
    } else if (pSegs[i] !== aSegs[i]) {
      return null;
    }
  }
  return params;
}

function parseQuery(actualPath: string): Record<string, string> {
  const idx = actualPath.indexOf('?');
  if (idx === -1) return {};
  const sp = new URLSearchParams(actualPath.slice(idx + 1));
  const out: Record<string, string> = {};
  sp.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

/**
 * Mengirim request HTTP virtual ke endpoint `activeRoutes` dari Mini Postman UI.
 */
export function sendApiRequest(
  method: HttpMethod,
  path: string,
  rawBodyJson = ''
): ApiTestResponse {
  const start = performance.now();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  let parsedBody: unknown = undefined;

  if (method === 'POST' || method === 'PUT') {
    const trimmed = rawBodyJson.trim();
    if (trimmed) {
      try {
        parsedBody = JSON.parse(trimmed);
      } catch {
        return {
          method,
          path: normalizedPath,
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'JSON body tidak valid. Cek tanda kutip dan koma!' },
          durationMs: Math.max(1, Math.round(performance.now() - start)),
          logs: ['Gagal parsing JSON body request.'],
        };
      }
    } else {
      parsedBody = {};
    }
  }

  const query = parseQuery(normalizedPath);

  for (const route of activeRoutes) {
    if (route.method !== method) continue;
    const params = matchRoute(route.path, normalizedPath);
    if (!params) continue;

    try {
      const result = route.handler({ params, query, body: parsedBody });
      const durationMs = Math.max(1, Math.round(performance.now() - start));

      if (
        result &&
        typeof result === 'object' &&
        'body' in (result as Record<string, unknown>)
      ) {
        const resObj = result as RouteRes;
        const status = typeof resObj.status === 'number' ? resObj.status : 200;
        return {
          method,
          path: normalizedPath,
          status,
          statusText: STATUS_TEXTS[status] ?? 'OK',
          body: resObj.body,
          durationMs,
          logs: [`${method} ${normalizedPath} -> ${status}`],
        };
      }

      return {
        method,
        path: normalizedPath,
        status: 200,
        statusText: 'OK',
        body: result ?? null,
        durationMs,
        logs: [`${method} ${normalizedPath} -> 200`],
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        method,
        path: normalizedPath,
        status: 500,
        statusText: 'Internal Server Error',
        body: { error: msg },
        durationMs: Math.max(1, Math.round(performance.now() - start)),
        logs: [`Server Error di ${method} ${normalizedPath}: ${msg}`],
      };
    }
  }

  return {
    method,
    path: normalizedPath,
    status: 404,
    statusText: 'Not Found',
    body: {
      error: `Endpoint ${method} ${normalizedPath} tidak ditemukan di server.ts`,
    },
    durationMs: Math.max(1, Math.round(performance.now() - start)),
    logs: [`404: ${method} ${normalizedPath} belum terdaftar`],
  };
}

export interface SmokeTestSpec {
  method: HttpMethod;
  path: string;
  body?: unknown;
}

/**
 * Mengompilasi & mendaftarkan route server REST API TypeScript/JS di browser,
 * lalu menjalankan smoke test otomatis atau route GET pertama untuk pratinjau.
 */
export async function runApiServerCode(
  code: string,
  smokeSpecs: SmokeTestSpec[] = [],
  onStatus?: (message: string) => void
): Promise<ExecutionResult> {
  const start = performance.now();

  try {
    onStatus?.('Menyiapkan Mini REST API Server...');
    const jsCode = await transpileTsSnippet(code, onStatus);

    const routes: RegisteredRoute[] = [];
    const serverLogs: string[] = [];

    const app = {
      get: (path: string, handler: RouteHandler) =>
        routes.push({ method: 'GET', path, handler }),
      post: (path: string, handler: RouteHandler) =>
        routes.push({ method: 'POST', path, handler }),
      put: (path: string, handler: RouteHandler) =>
        routes.push({ method: 'PUT', path, handler }),
      delete: (path: string, handler: RouteHandler) =>
        routes.push({ method: 'DELETE', path, handler }),
    };

    const sandboxConsole = {
      log: (...args: unknown[]) =>
        serverLogs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')),
      info: (...args: unknown[]) =>
        serverLogs.push(args.map((a) => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')),
      warn: (...args: unknown[]) =>
        serverLogs.push('[WARN] ' + args.map(String).join(' ')),
      error: (...args: unknown[]) =>
        serverLogs.push('[ERR] ' + args.map(String).join(' ')),
    };

    const fn = new Function('app', 'console', jsCode);
    fn(app, sandboxConsole);

    activeRoutes = routes;

    const smokeTests: ApiTestResponse[] = smokeSpecs.map((spec) =>
      sendApiRequest(
        spec.method,
        spec.path,
        spec.body !== undefined ? JSON.stringify(spec.body) : ''
      )
    );

    let lastResponse: ApiTestResponse | undefined = smokeTests[0];
    if (!lastResponse && routes.length > 0) {
      const firstGet = routes.find((r) => r.method === 'GET' && !r.path.includes(':'));
      if (firstGet) {
        lastResponse = sendApiRequest('GET', firstGet.path);
      }
    }

    const apiResult: ApiSimResult = {
      routes: routes.map(({ method, path }) => ({ method, path })),
      lastResponse,
      smokeTests,
    };

    const stdout = [
      `Server aktif dengan ${routes.length} endpoint:`,
      ...routes.map((r) => `  • ${r.method} ${r.path}`),
      ...serverLogs,
    ].join('\n');

    const consoleLogs: ConsoleEntry[] = [
      {
        id: `api-ok-${Date.now()}`,
        level: 'info',
        text: stdout,
        timestamp: Date.now(),
      },
    ];

    return {
      track: 'software_api',
      ok: true,
      stdout,
      stderr: '',
      consoleLogs,
      apiResult,
      exitCode: 0,
      durationMs: Math.max(1, Math.round(performance.now() - start)),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      track: 'software_api',
      ok: false,
      stdout: '',
      stderr: msg,
      consoleLogs: [
        { id: `api-err-${Date.now()}`, level: 'error', text: msg, timestamp: Date.now() },
      ],
      exitCode: 1,
      durationMs: Math.round(performance.now() - start),
      errorRaw: msg,
    };
  }
}
