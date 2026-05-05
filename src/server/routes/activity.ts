import { Router } from "express";
import { dbClient } from "../../lib/supabase/supabaseServer";

const router = Router();

router.get("/", async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;

  try {
    const { data, error } = await dbClient
      .from("activity_log")
      .select(
        "log_id, actor_id, event_type, description, po_id, created_at, actor:profiles(name)",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) {
      throw error;
    }
    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;