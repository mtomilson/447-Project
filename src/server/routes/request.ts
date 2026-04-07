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

  // check if the new status we just updated to is shipped, if it is we want to pull the requested from location and deduct inventory
  const { data: requestData } = await dbClient
    .from("requests")
    .select(`*, request_item(*)`)
    .eq("request_id", requestId)
    .single();

  if (!requestData) {
    return res.status(404).json({ error: "Request Not Found" });
  }
  if (!requestData.requested_from)
    return res.status(400).json({ error: "No source location on request" });

  if (newStatus === "shipped") {
    for (let i = 0; i < requestData.request_item.length; i++) {
      const { data: location } = await dbClient
        .from("location_item")
        .select("quantity")
        .eq("item_id", requestData.request_item[i].item_id)
        .eq("location_id", requestData.requested_from)
        .single();
      if (!location) continue;

      const newQuantity =
        (location.quantity ?? 0) - (requestData.request_item[i].quantity ?? 0);
      if (newQuantity < 0) {
        return res
          .status(400)
          .json({ error: "Insufficient inventory to fulfill this request" });
      }
      const { error } = await dbClient
        .from("location_item")
        .update({ quantity: newQuantity })
        .eq("item_id", requestData.request_item[i].item_id)
        .eq("location_id", requestData.requested_from);
      if (error) return res.status(500).json({ error: error.message });
    }
  }

  if (newStatus === "delivered") {
    if (!requestData.requested_to)
      return res.status(400).json({ error: "No destination location on request" });

    for (let i = 0; i < requestData.request_item.length; i++) {
      const item = requestData.request_item[i];

      // fetch current quantity at jobsite, may not exist yet
      const { data: existing } = await dbClient
        .from("location_item")
        .select("quantity")
        .eq("item_id", item.item_id)
        .eq("location_id", requestData.requested_to)
        .single();

      const newQuantity = (existing?.quantity ?? 0) + (item.quantity ?? 0);
      
      // upsert will update if it exists, insert if it doesn't 

      const { error } = await dbClient
        .from("location_item")
        .upsert({
          location_id: requestData.requested_to,
          item_id: item.item_id,
          quantity: newQuantity,
        }, {onConflict: "location_id, item_id"});
      if (error) return res.status(500).json({ error: error.message });
    }
  }
  return res.json({ data });
});

router.post("/create", async (req, res) => {
  const { requested_to, requested_from, items } = req.body;
  const logged_by = req.user!.user_id;

  const { data, error } = await dbClient
    .from("requests")
    .insert({
      logged_by: logged_by,
      requested_to: requested_to,
      requested_from: requested_from,
    })
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const request_id = data[0].request_id;
  for (let i = 0; i < items.length; i++) {
    const { data, error } = await dbClient.from("request_item").insert({
      request_id: request_id,
      item_id: items[i].item_id,
      quantity: items[i].quantity,
    });

    if (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(201).json({ message: "success" });
});

export default router;
