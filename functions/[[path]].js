export async function onRequest(context) {
  const url = new URL(context.request.url);
  // Static assets (files with extensions) — let Cloudflare serve them directly
  if (url.pathname.match(/\.\w+$/)) {
    return context.next();
  }
  // Angular routes (no file extension) — serve index.html for SPA routing
  return context.env.ASSETS.fetch(new URL('/index.html', context.request.url).toString());
}
