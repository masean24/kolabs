import type { LabFiles } from '../types/lab';

export const WEB_CONSOLE_SOURCE = 'kodie-web-preview';

/**
 * Menyusun dokumen HTML lengkap untuk `<iframe sandbox="allow-scripts allow-modals" srcDoc>`
 * sekaligus menyuntikkan bridge `console` dan `window.onerror` via `window.postMessage`.
 */
export function buildWebSrcDoc(files: LabFiles, runId: string): string {
  const html = files['index.html'] ?? '';
  const css = files['style.css'] ?? '';
  const js = files['script.js'] ?? '';

  const bridgeScript = `<script>
(function () {
  var RUN_ID = ${JSON.stringify(runId)};
  var SOURCE = ${JSON.stringify(WEB_CONSOLE_SOURCE)};

  function safeFormat(value, seen) {
    seen = seen || [];
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
      return String(value);
    }
    if (typeof value === 'function') {
      return '[Function ' + (value.name || 'anonymous') + ']';
    }
    if (value instanceof Error) {
      return (value.name || 'Error') + ': ' + value.message;
    }
    if (typeof value === 'object') {
      if (seen.indexOf(value) !== -1) return '[Circular]';
      seen.push(value);
      try {
        if (Array.isArray(value)) {
          return '[' + value.map(function (item) { return safeFormat(item, seen); }).join(', ') + ']';
        }
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return String(value);
      }
    }
    return String(value);
  }

  function send(level, args) {
    try {
      var text = Array.prototype.slice.call(args).map(function (a) {
        return safeFormat(a);
      }).join(' ');
      window.parent.postMessage({ source: SOURCE, runId: RUN_ID, level: level, text: text }, '*');
    } catch (e) {}
  }

  ['log', 'info', 'warn', 'error'].forEach(function (method) {
    var orig = console[method];
    console[method] = function () {
      send(method, arguments);
      if (typeof orig === 'function') {
        orig.apply(console, arguments);
      }
    };
  });

  window.addEventListener('error', function (event) {
    var msg = event.message || 'Terjadi error JavaScript';
    var lineInfo = event.lineno ? ' (baris ' + event.lineno + ')' : '';
    send('error', [msg + lineInfo]);
  });

  window.addEventListener('unhandledrejection', function (event) {
    var reason = event.reason instanceof Error ? event.reason.message : safeFormat(event.reason);
    send('error', ['Promise ditolak: ' + reason]);
  });
})();
</script>`;

  const styleTag = `<style data-kodie-style="true">\n${css}\n</style>`;
  const safeUserJs = js.replace(/<\/script>/gi, '<\\/script>');
  const userScriptTag = `<script data-kodie-script="true">\ntry {\n${safeUserJs}\n} catch (err) {\n  console.error(err);\n}\n</script>`;

  if (/<html[\s>]/i.test(html) || /<head[\s>]/i.test(html) || /<body[\s>]/i.test(html)) {
    let doc = html;
    if (/<\/head>/i.test(doc)) {
      doc = doc.replace(/<\/head>/i, `${styleTag}\n${bridgeScript}\n</head>`);
    } else if (/<body[\s>]/i.test(doc)) {
      doc = doc.replace(/<body([^>]*)>/i, `<head>${styleTag}\n${bridgeScript}</head>\n<body$1>`);
    } else {
      doc = `${styleTag}\n${bridgeScript}\n${doc}`;
    }

    if (/<\/body>/i.test(doc)) {
      doc = doc.replace(/<\/body>/i, `${userScriptTag}\n</body>`);
    } else {
      doc = `${doc}\n${userScriptTag}`;
    }
    return doc;
  }

  return `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    ${styleTag}
    ${bridgeScript}
  </head>
  <body>
    ${html}
    ${userScriptTag}
  </body>
</html>`;
}
