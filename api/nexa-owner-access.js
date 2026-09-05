import crypto from 'node:crypto';
import {
  json,
  userRole,
  bypassCookie,
} from '../server/_nexa-maintenance-common.js';

function safeEqual(a, b) {
  const A = Buffer.from(String(a || ''));
  const B = Buffer.from(String(b || ''));
  return A.length === B.length && crypto.timingSafeEqual(A, B);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed.' });
  }

  try {
    const recoverySecret = String(req.body?.secret || '');

    if (recoverySecret) {
      const expected = process.env.NEXA_OWNER_RECOVERY_SECRET || '';

      if (!expected) {
        return json(res, 503, {
          error: 'Owner recovery secret is not configured in Vercel.',
        });
      }

      if (!safeEqual(recoverySecret, expected)) {
        return json(res, 403, {
          error: 'Invalid Owner recovery secret.',
        });
      }

      bypassCookie(res);

      return json(res, 200, {
        ok: true,
        method: 'recovery_secret',
      });
    }

    const token = String(req.headers.authorization || '').replace(
      /^Bearer\s+/i,
      ''
    );

    const role = await userRole(token);

    if (role !== 'owner') {
      return json(res, 403, {
        error: 'This Discord account is not linked to the NEXA Owner.',
      });
    }

    bypassCookie(res);

    return json(res, 200, {
      ok: true,
      method: 'owner_session',
    });
  } catch (error) {
    return json(res, error.status || 500, {
      error: error.message || 'Owner access verification failed.',
    });
  }
}
