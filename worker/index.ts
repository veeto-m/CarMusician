// Cloudflare Worker entry point.
// Rotte:
//   GET /api/tts -> proxy Google Translate TTS (voce localizzata)
//   *            -> asset statici via env.ASSETS (cartella ./dist)
//
// Il "maestro" non richiede più una chiamata LLM: il client pesca le linee
// dal pool pre-generato in src/data/maestro-pool.<locale>.json (vedi
// docs/maestro-explanations-prompt.md). Il proxy Anthropic è stato
// rimosso insieme al segreto ANTHROPIC_API_KEY.

interface Env {
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

// ---------- TTS proxy: Google Translate voice (qualità Wavenet) ----------
// Il client chiama /api/tts?text=...&lang=it (o &lang=en) e riceve un MP3
// streamato. Google Translate TTS non accetta richieste da browser (CORS) →
// proxyamo qui. Limite 200 caratteri per chunk: il client è responsabile
// del chunking.
async function handleTTS(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const text = (url.searchParams.get('text') ?? '').slice(0, 200);
  const lang = (url.searchParams.get('lang') ?? 'en').slice(0, 8);
  if (!text) return new Response('missing text', { status: 400 });

  const target =
    `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(lang)}` +
    `&client=tw-ob&total=1&idx=0&q=${encodeURIComponent(text)}`;
  try {
    const r = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        Referer: 'https://translate.google.com/',
        Accept: '*/*',
      },
    });
    if (!r.ok) return new Response('tts upstream error ' + r.status, { status: 502 });
    return new Response(r.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=604800, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    return new Response('tts fetch error: ' + msg, { status: 502 });
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/tts') return handleTTS(request);
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }
    return new Response('Not found', { status: 404 });
  },
};
