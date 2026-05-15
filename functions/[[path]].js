export async function onRequest({ request, env }) {
  const response = await env.ASSETS.fetch(request);
  if (response.status === 404) {
    return env.ASSETS.fetch(new URL('/index.html', request.url).toString());
  }
  return response;
}
