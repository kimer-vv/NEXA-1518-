import crypto from 'node:crypto';

const COOKIE = 'nexa_human_session';
const HOSTNAME = 'nexa-1518.vercel.app';
const ACTION = 'nexa_site_access';

function sign(value, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(value)
    .digest('base64url');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      error: 'Method not allowed.'
    });
  }

  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return res.status(500).json({
      error: 'Verification service is not configured.'
    });
  }

  const token = req.body?.token;

  if (!token || typeof token !== 'string' || token.length > 2048) {
    return res.status(400).json({
      error: 'Please complete the human verification.'
    });
  }

  try {
    const body = new URLSearchParams({
      secret,
      response: token
    });

    const forwarded = req.headers['x-forwarded-for'];

    const ip = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded?.split(',')[0]?.trim();

    if (ip) {
      body.set('remoteip', ip);
    }

    const cf = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      }
    );

    const result = await cf.json();

    if (
      !result.success ||
      result.hostname !== HOSTNAME ||
      result.action !== ACTION
    ) {
      return res.status(403).json({
        error: 'Human verification failed. Please try again.'
      });
    }

    const issued = Date.now().toString();
    const value = `${issued}.${sign(issued, secret)}`;

    res.setHeader(
      'Set-Cookie',
      `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax`
    );

    return res.status(200).json({
      ok: true
    });

  } catch (err) {
    console.error('Turnstile verification error', err);

    return res.status(500).json({
      error: 'Could not verify right now. Please try again.'
    });
  }
}
