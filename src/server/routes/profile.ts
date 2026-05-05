import { Router } from "express";
import { dbClient } from "../../lib/supabase/supabaseServer";

const router = Router();

router.patch("/", async (req, res) => {
  const { home_jobsite_id } = req.body;
  const user_id = req.user!.user_id;

  const { error } = await dbClient
    .from("profiles")
    .update({ home_jobsite_id })
    .eq("user_id", user_id);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: "success" });
});

export default router;
