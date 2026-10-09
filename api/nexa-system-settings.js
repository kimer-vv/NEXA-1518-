import {
  SUPABASE_URL,
  json,
  userRole,
  bypassCookie,
} from '../server/_nexa-maintenance-common-new.js';
import giftWorkspaceHandler from '../server/nexa-gift-workspace.js';
import wosUtilitiesHandler from '../server/nexa-wos-utilities.js';

const HERO_IMAGE_HOSTS = new Set([
  'www.whiteoutsurvival-community.com',
  'whiteoutsurvival-community.com',
  'gom-s3-user-avatar.s3.us-west-2.amazonaws.com',
]);

const NEXA_COMMANDS = [
  {
    name: 'nexa',
    description: 'NEXA tools for your connected server',
    options: [
      {type: 1, name: 'help', description: 'Show the NEXA Bot command guide'},
      {
        type: 2,
        name: 'transfer',
        description: 'Transfer tools',
        options: [
          {
            type: 1,
            name: 'list',
            description: 'View the current Transfer applicant list',
            options: [
              {
                type: 3,
                name: 'placement',
                description: 'Which Transfer list do you want?',
                required: true,
                choices: [
                  {name: 'All Transfer Applicants', value: 'all'},
                  {name: 'New Applicants', value: 'inbox'},
                  {name: 'Ordinary', value: 'ordinary'},
                  {name: 'Special', value: 'special'},
                  {name: 'Group Transfer', value: 'group'},
                ],
              },
            ],
          },
          {
            type: 1,
            name: 'view',
            description: 'View one Transfer applicant by Game ID',
            options: [
              {type: 3, name: 'game_id', description: 'Whiteout Survival Game ID', required: true},
            ],
          },
          {
            type: 1,
            name: 'move',
            description: 'Move a Transfer applicant',
            options: [
              {type: 3, name: 'game_id', description: 'Whiteout Survival Game ID', required: true},
              {
                type: 3,
                name: 'placement',
                description: 'Where should this applicant go?',
                required: true,
                choices: [
                  {name: 'Ordinary', value: 'ordinary'},
                  {name: 'Special', value: 'special'},
                  {name: 'Group Transfer', value: 'group'},
                ],
              },
              {type: 3, name: 'alliance', description: 'Recruiting Alliance for Ordinary / Special', required: false, autocomplete: true},
              {type: 3, name: 'group', description: 'Approved Group for Group Transfer', required: false, autocomplete: true},
            ],
          },
          {type: 1, name: 'invite-list', description: 'Post the current Transfer invite list'},
          {
            type: 1,
            name: 'invite-sent',
            description: 'Mark a Transfer invite as sent',
            options: [
              {type: 3, name: 'game_id', description: 'Whiteout Survival Game ID', required: true},
            ],
          },
          {
            type: 1,
            name: 'invite-pending',
            description: 'Mark a Transfer invite as pending',
            options: [
              {type: 3, name: 'game_id', description: 'Whiteout Survival Game ID', required: true},
            ],
          },
        ],
      },
      {
        type: 2,
        name: 'reminder',
        description: 'WOS Reminder tools',
        options: [
          {
            type: 1,
            name: 'set-channel',
            description: 'Use this channel as the default WOS Reminder channel',
          },
        ],
      },
    ],
  },
];

function discordEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is not configured in Vercel.`);
  return value;
}

async function discordRequest(path, {method = 'GET', body} = {}) {
  const token = discordEnv('DISCORD_BOT_TOKEN');
  const r = await fetch(`https://discord.com/api/v10${path}`, {
    method,
    headers: {
      Authorization: `Bot ${token}`,
      'Content-Type': 'application/json',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const raw = await r.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!r.ok) {
    const detail = typeof data === 'string' ? data : JSON.stringify(data);
    throw new Error(`Discord ${r.status}: ${detail}`);
  }
  return data;
}

async function registerGuildCommands(guildId) {
  const guild = String(guildId || '').trim();
  if (!/^\d{10,30}$/.test(guild)) throw new Error('Invalid Discord Server ID.');
  const app = discordEnv('DISCORD_APPLICATION_ID');

  // Guild commands appear immediately and keep each NEXA installation isolated
  // to the Discord server where it was linked.
  await discordRequest(
    `/applications/${encodeURIComponent(app)}/guilds/${encodeURIComponent(guild)}/commands`,
    {method: 'PUT', body: NEXA_COMMANDS},
  );

  return {ok: true, guild_id: guild};
}

async function runWosHandler(req, res) {
  const action = String(req.body?.action || req.query?.action || '').trim();

  if (action !== 'link_discord_server') {
    return await wosUtilitiesHandler(req, res);
  }

  const guildId = String(req.body?.guild_id || '').trim();
  const originalStatus = res.status.bind(res);
  const originalJson = res.json.bind(res);
  let statusCode = 200;

  res.status = (code) => {
    statusCode = Number(code) || 200;
    originalStatus(code);
    return res;
  };

  res.json = async (payload) => {
    if (statusCode < 400 && payload?.ok !== false) {
      try {
        await registerGuildCommands(guildId);
        payload = {
          ...payload,
          slash_commands_registered: true,
          slash_command: '/nexa',
        };
      } catch (error) {
        // The guild link was valid and already saved. Return a clear error so
        // linking the same server again retries command registration.
        return originalStatus(502).json({
          ok: false,
          linked: true,
          server: payload?.server || null,
          error: `Discord server linked, but /nexa could not be registered: ${error.message || error}`,
        });
      }
    }
    return originalJson(payload);
  };

  return await wosUtilitiesHandler(req, res);
}

function heroImageUrl(raw) {
  try {
    const u = new URL(String(raw || ''));
    if (u.protocol !== 'https:') return null;
    if (!HERO_IMAGE_HOSTS.has(u.hostname)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

async function serveHeroImage(req, res) {
  const raw = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url;
  const url = heroImageUrl(raw);
  if (!url) return json(res, 400, { error: 'Invalid hero image URL.' });
  try {
    const upstream = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 NEXA/1.0',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });
    if (!upstream.ok) return json(res, upstream.status, { error: 'Hero image could not be loaded.' });
    const contentType = upstream.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('image/')) {
      return json(res, 415, { error: 'Requested resource is not an image.' });
    }
    const body = Buffer.from(await upstream.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    return res.status(200).send(body);
  } catch (error) {
    console.error('[NEXA hero image]', error);
    return json(res, 502, { error: 'Hero image proxy failed.' });
  }
}

async function getSetting(service) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/nexa_system_settings?key=eq.maintenance_mode&select=value&limit=1`, {
    headers: { apikey: service, Authorization: `Bearer ${service}` }, cache: 'no-store',
  });
  if (!r.ok) throw new Error('Could not read Maintenance Mode.');
  const rows = await r.json();
  const value = rows?.[0]?.value;
  return value === true || value?.enabled === true;
}

async function setSetting(service, enabled) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/nexa_system_settings?on_conflict=key`, {
    method: 'POST',
    headers: {
      apikey: service, Authorization: `Bearer ${service}`,
      'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify({key: 'maintenance_mode', value: {enabled: !!enabled}, updated_at: new Date().toISOString()}),
  });
  if (!r.ok) throw new Error('Could not update Maintenance Mode.');
}

export default async function handler(req, res) {
  try {
    // Gift Code discovery, queue processing, retries and auto-redemption now
    // live in Supabase. Vercel no longer runs gift cron/auto-worker modes.
    if (req.query?.mode === 'gift') return await giftWorkspaceHandler(req, res);
    if (req.query?.mode === 'wos') return await runWosHandler(req, res);
    if (req.method === 'GET' && req.query?.mode === 'hero-image') return await serveHeroImage(req, res);

    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    const role = await userRole(token);
    if (role !== 'owner') return json(res, 403, {error: 'System Operations is Owner-only.'});

    const service = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!service) return json(res, 503, {error: 'SUPABASE_SERVICE_ROLE_KEY is not configured in Vercel.'});

    if (req.method === 'GET') {
      return json(res, 200, {maintenance_mode: await getSetting(service)});
    }

    if (req.method === 'POST') {
      const enabled = !!req.body?.maintenance_mode;
      if (enabled) bypassCookie(res);
      await setSetting(service, enabled);
      return json(res, 200, {maintenance_mode: enabled});
    }

    return json(res, 405, {error: 'Method not allowed.'});
  } catch (error) {
    return json(res, error.status || 500, {error: error.message || 'System Operations failed.'});
  }
}
