import { Router } from "express";
import { dbClient } from "../../lib/supabaseServer";

const router = Router();

/**
 * Authenticated route, will return all requests with all items attached to request and the quantity.
 */

router.get("/", async (req, res) => {
  try {
    const { data, error } = await dbClient
      .from("requests")
      .select(`*, request_item(*, material_item(*))`);
    if (error) {
      throw error;
    }
    return res.json({
      data: data,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Authenticated route, will update a request with a given status that is passed in the params
 */

router.patch("/:id", async (req, res) => {
  const { newStatus } = req.body;
  const requestId = req.params.id;
  const { data, error } = await dbClient
    .from("requests")
    .update({ status: newStatus }) // status is the column name, newStatus is the new value to give it
    .eq("request_id", requestId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ data });
});

export default router;
