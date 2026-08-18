const SUPABASE_URL = process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        error: 'NEXA database configuration is missing.',
      });
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/alliances?select=*&order=tag.asc`,
      {
        method: 'GET',
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Alliance load error:', data);

      return res.status(response.status).json({
        error: 'Could not load alliances.',
        details: data,
      });
    }

    const alliances = Array.isArray(data)
      ? data.filter((alliance) => {
          if ('active' in alliance) {
            return alliance.active !== false;
          }

          if ('is_active' in alliance) {
            return alliance.is_active !== false;
          }

          return true;
        })
      : [];

    return res.status(200).json({
      ok: true,
      alliances,
    });
  } catch (error) {
    console.error('NEXA alliance endpoint error:', error);

    return res.status(500).json({
      error: 'Could not load alliances.',
    });
  }
}