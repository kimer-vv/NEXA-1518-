import {
  json,
  userRole,
  bypassCookie,
} from '../server/_nexa-maintenance-common.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed.' });
  }

  try {
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
    });
  } catch (error) {
    return json(res, error.status || 500, {
      error: error.message || 'Owner verification failed.',
    });
  }
}
