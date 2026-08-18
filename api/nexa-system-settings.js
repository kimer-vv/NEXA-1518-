const {
  json,
  requireOwner,
  getSupabaseAdmin,
} = require("./_nexa-maintenance-common");

module.exports = async function handler(req, res) {
  try {
    const owner = await requireOwner(req, res);
    if (!owner) return;

    const supabase = getSupabaseAdmin();

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("nexa_system_settings")
        .select("*")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        return json(res, 500, {
          ok: false,
          error: error.message,
        });
      }

      return json(res, 200, {
        ok: true,
        maintenance_mode: Boolean(data?.maintenance_mode),
      });
    }

    if (req.method === "POST") {
      const maintenanceMode = Boolean(req.body?.maintenance_mode);

      const { data, error } = await supabase
        .from("nexa_system_settings")
        .upsert(
          {
            id: 1,
            maintenance_mode: maintenanceMode,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select()
        .single();

      if (error) {
        return json(res, 500, {
          ok: false,
          error: error.message,
        });
      }

      return json(res, 200, {
        ok: true,
        maintenance_mode: Boolean(data.maintenance_mode),
      });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, {
      ok: false,
      error: "Method not allowed",
    });
  } catch (error) {
    console.error("nexa-system-settings:", error);

    return json(res, 500, {
      ok: false,
      error: "System Operations request failed.",
    });
  }
};