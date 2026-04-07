import { Router } from "express";
import { dbClient } from "../../lib/supabaseServer";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { data, error } = await dbClient
      .from("pay_orders")
      .select(`*, pay_order_item(*, material_item(*)), signer:profiles!pay_orders_signed_fkey(name)`)

    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/create", async (req, res) => {
  const { vendor, source_location_id, destination_location_id, notes, items } =
    req.body;
  const created_by = req.user!.user_id;

  if (req.user!.role !== "project_manager") {
    return res
      .status(403)
      .json({ error: "Unauthorized, Project Managers Only" });
  }

  const { data, error } = await dbClient
    .from("pay_orders")
    .insert({
      vendor,
      source_location_id,
      destination_location_id,
      notes,
      created_by,
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const po_id = data.po_id;

  for (const item of items) {
    const { data: existing } = await dbClient
      .from("material_item")
      .select("item_id")
      .ilike("item_name", item.item_name)
      .maybeSingle();
    let item_id = existing?.item_id;
    if (!item_id) {
      const { data: newItem, error: itemError } = await dbClient
        .from("material_item")
        .insert({ item_name: item.item_name, unit: item.unit })
        .select()
        .single();
      if (itemError) return res.status(500).json({ error: itemError.message });

      item_id = newItem.item_id;
    }
    const { error: poItemError } = await dbClient
      .from("pay_order_item")
      .insert({ po_id, item_id, quantity: item.quantity });

    if (poItemError)
      return res.status(500).json({ error: poItemError.message });
  }

  return res.status(201).json({ message: "success" });
});

router.patch("/:id", async (req, res) => {
  const { newStatus } = req.body;
  const po_id = req.params.id;

  // fetch the pay order and its items
  const { data: order, error: fetchError } = await dbClient
    .from("pay_orders")
    .select(`*, pay_order_item(*)`)
    .eq("po_id", po_id)
    .single();

  if (fetchError || !order)
    return res.status(404).json({ error: "Pay order not found" });

  // update the status
  const { error: updateError } = await dbClient
    .from("pay_orders")
    .update({ status: newStatus })
    .eq("po_id", po_id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  // shipped: deduct from source location (only if one exists)
  if (newStatus === "shipped" && order.source_location_id) {
    try {
      await Promise.all(
        order.pay_order_item.map(async (item) => {
          const { data: current } = await dbClient
            .from("location_item")
            .select("quantity")
            .eq("item_id", item.item_id)
            .eq("location_id", order.source_location_id!)
            .maybeSingle();

          if (!current) return;

          const newQty = (current.quantity ?? 0) - (item.quantity ?? 0);
          if (newQty < 0) throw new Error("Insufficient inventory at source location");

          const { error } = await dbClient
            .from("location_item")
            .update({ quantity: newQty })
            .eq("item_id", item.item_id)
            .eq("location_id", order.source_location_id!);

          if (error) throw new Error(error.message);
        })
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  // delivered: record signer, update received quantities, add to destination inventory
  if (newStatus === "delivered") {
    const { receivedItems } = req.body;

    const { error: signError } = await dbClient
      .from("pay_orders")
      .update({ signed: req.user!.user_id })
      .eq("po_id", po_id);

    if (signError) return res.status(500).json({ error: signError.message });

    let hasMissing = false;

    try {
      await Promise.all(
        order.pay_order_item.map(async (item) => {
          const received = receivedItems?.find((r: any) => r.po_item_id === item.po_item_id);
          const receivedQty = received?.received_quantity ?? item.quantity;

          if (receivedQty < item.quantity) hasMissing = true;

          const { error: itemError } = await dbClient
            .from("pay_order_item")
            .update({ received_quantity: receivedQty })
            .eq("po_item_id", item.po_item_id);

          if (itemError) throw new Error(itemError.message);

          const { data: current } = await dbClient
            .from("location_item")
            .select("quantity")
            .eq("item_id", item.item_id)
            .eq("location_id", order.destination_location_id)
            .maybeSingle();

          const newQty = (current?.quantity ?? 0) + receivedQty;

          const { error: upsertError } = await dbClient
            .from("location_item")
            .upsert(
              { location_id: order.destination_location_id, item_id: item.item_id, quantity: newQty },
              { onConflict: "location_id, item_id" }
            );

          if (upsertError) throw new Error(upsertError.message);
        })
      );
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    if (hasMissing) {
      await dbClient.from("pay_orders").update({ has_missing_items: true }).eq("po_id", po_id);
    }
  }

  return res.json({ message: "success" });
});

export default router;
