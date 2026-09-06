// NEXA Hero Image Proxy v1.0
// Same-origin image delivery for Team Layout/html2canvas exports.
// Read-only proxy; restricted to the current WOS hero image host.

const ALLOWED_HOSTS = new Set([
  'gom-s3-user-avatar.s3.us-west-2.amazonaws.com'
]);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  const raw = typeof req.query?.url === 'string' ? req.query.url : '';
  if (!raw) return res.status(400).send('Missing url');

  let target;
  try {
    target = new URL(raw);
  } catch {
    return res.status(400).send('Invalid url');
  }

  if (target.protocol !== 'https:' || !ALLOWED_HOSTS.has(target.hostname)) {
    return res.status(403).send('Image host not allowed');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const upstream = await fetch(target.toString(), {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': 'NEXA/1.0 image-proxy'
      }
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('Image unavailable');
    }

    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return res.status(415).send('Not an image');
    }

    const body = Buffer.from(await upstream.arrayBuffer());
    if (body.length > 6 * 1024 * 1024) {
      return res.status(413).send('Image too large');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).send(body);
  } catch (err) {
    if (err?.name === 'AbortError') return res.status(504).send('Image timeout');
    return res.status(502).send('Image proxy error');
  } finally {
    clearTimeout(timeout);
  }
}
