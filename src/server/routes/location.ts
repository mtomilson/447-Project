import { Router } from "express";
import { dbClient } from "../../lib/supabaseServer";

const router = Router();

/**
 * Authenticated Route, will return all locations and the items and quantities associated to each location
 */

router.get("/", async (req, res) => {
  const { data, error } = await dbClient
    .from("location")
    .select(`*, location_item(*, material_item(*))`);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ data });
});

/**
 * Authenticated Route, provided an object with both location name and address, this route will insert
 * a row into the location table with the corresponding data.
 * 
 * This route checks if the authenticated user is a project manager or a system administrator, if not, returns status
 */

router.post("/create", async (req, res) => {
  const role = req.user!.role;

  if (role !== "project_manager" && role !== "system_administrator") {
    return res.status(403).json({ error: "Not Authorized" });
  }

  const { location_name, address } = req.body;
  const { error } = await dbClient.from("location").insert({
    location_name: location_name,
    address: address,
    is_active: true,
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ message: "Location created" });
});

export default router;
