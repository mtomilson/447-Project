import { Router } from "express";
import { dbClient } from "../../lib/supabase/supabaseServer";
import { Resend } from "resend";
import { logActivity } from "../helper/logActivity";

const resend = new Resend(process.env.RESEND_API_KEY);
const router = Router();3

router.get("/", async (req, res) => {
  const limit = req.query.limit
    ? parseInt(req.query.limit as string)
    : undefined;

  try {
    let query = dbClient
      .from("pay_orders")
      .select(
        `*, pay_order_item(*, material_item(*)), signer:profiles!pay_orders_signed_fkey(name)`,
      )
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);
    const { data, error } = await query;
    if (error) throw error;

    return res.json({ data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/create", async (req, res) => {
  const { vendor, po_number, source_location_id, destination_location_id, notes, items, expectedDelivery } =
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
      po_number,
      source_location_id,
      destination_location_id,
      notes,
      created_by,
      expected_delivery: expectedDelivery
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

  await logActivity(created_by, "order_created", po_id, po_number);

  return res.status(201).json({ message: "success" });
});

router.patch("/:id", async (req, res) => {
  const { newStatus } = req.body;
  const po_id = req.params.id;
  const user = req.user!.user_id;

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

  // const { data: manager } = await dbClient
  //   .from("profiles")
  //   .select("email")
  //   .eq("user_id", order.created_by)
  //   .single();

  // if (manager) {
  //   await resend.emails.send({
  //     from: 'onboarding@resend.dev',
  //     to: manager.email,
  //     subject: "Order Status has been Updated",
  //     html: `<p>Your order has been marked as <strong>${newStatus}</strong>.</p>`,
  //   });
  // }

  // the free tier of Resend allows only for emails to be sent to the email address, 'mtomils1@umbc.edu'
  // for testing purposes, this is all we need - however the above the code can be uncommented out if this ever becomes production level

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "mtomils1@umbc.edu",
    subject: `Order ${order.po_number}, Status has been Updated`,
    html: `<p>Your order, <strong>${order.po_number}</strong>, has been marked as <strong>${newStatus}</strong>.<p>`,
  });

  // shipped: deduct from source location (only if one exists)
  if (newStatus === "shipped" && order.source_location_id) {
    try {
      await Promise.all(
        order.pay_order_item.map(async (item: any) => {
          const { data: current } = await dbClient
            .from("location_item")
            .select("quantity")
            .eq("item_id", item.item_id)
            .eq("location_id", order.source_location_id!)
            .maybeSingle();

          if (!current) return;

          const newQty = (current.quantity ?? 0) - (item.quantity ?? 0);
          if (newQty < 0)
            throw new Error("Insufficient inventory at source location");

          const { error } = await dbClient
            .from("location_item")
            .update({ quantity: newQty })
            .eq("item_id", item.item_id)
            .eq("location_id", order.source_location_id!);

          if (error) throw new Error(error.message);
        }),
      );
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
    await logActivity(user, "order_shipped", po_id, order.po_number);
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
        order.pay_order_item.map(async (item: any) => {
          const received = receivedItems?.find(
            (r: any) => r.po_item_id === item.po_item_id,
          );
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
              {
                location_id: order.destination_location_id,
                item_id: item.item_id,
                quantity: newQty,
              },
              { onConflict: "location_id, item_id" },
            );

          if (upsertError) throw new Error(upsertError.message);
        }),
      );
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }

    if (hasMissing) {
      await dbClient
        .from("pay_orders")
        .update({ has_missing_items: true })
        .eq("po_id", po_id);
    }
    await logActivity(user, "order_delivered", po_id, order.po_number);
  }

  return res.json({ message: "success" });
});

export default router;
