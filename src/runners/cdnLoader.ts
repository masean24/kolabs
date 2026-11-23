const scriptCache = new Map<string, Promise<void>>();

/**
 * Memuat skrip eksternal dari CDN tepat sekali (lazy-load on-demand)
 * dengan dukungan URL cadangan jika CDN utama gagal.
 */
export function loadExternalScript(id: string, urls: string[]): Promise<void> {
  const cached = scriptCache.get(id);
  if (cached) return cached;

  const promise = (async () => {
    let lastError: Error | null = null;
    for (const url of urls) {
      try {
        await injectScriptTag(url);
        return;
      } catch (err) {
        lastError =
          err instanceof Error ? err : new Error(`Gagal memuat skrip: ${url}`);
      }
    }
    scriptCache.delete(id);
    throw (
      lastError ??
      new Error(
        `Tidak dapat memuat runtime (${id}). Periksa koneksi internet kamu lalu coba lagi.`
      )
    );
  })();

  scriptCache.set(id, promise);
  return promise;
}

function injectScriptTag(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-kodie-src="${url}"]`
    );
    if (existing && existing.dataset.loaded === 'true') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.kodieSrc = url;

    script.onload = () => {
      script.dataset.loaded = 'true';
      resolve();
    };
    script.onerror = () => {
      script.remove();
      reject(new Error(`Gagal mengunduh runtime dari ${url}`));
    };

    document.head.appendChild(script);
  });
}
