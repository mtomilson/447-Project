import { Router } from "express";
import { dbClient } from "../../lib/supabase/supabaseServer";

const router = Router();

router.get("/", async (req, res) => {
  const start = new Date();
  const end = new Date();
  const today = new Date().toISOString().split("T")[0]
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  

  try {
    const [result1, result2, result3, result4] = await Promise.all([
      dbClient
        .from("pay_orders")
        .select("*", { count: "exact", head: true })
        .or("status.eq.created, status.eq.shipped"),
      dbClient
        .from("pay_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "delivered")
        .gte("delivered_at", start.toISOString())
        .lte("delivered_at", end.toISOString()),
      dbClient
        .from("pay_orders")
        .select("*", { count: "exact", head: true })
        .eq("expected_delivery", today),
      dbClient
        .from("pay_orders")
        .select("*", { count: "exact", head: true })
        .eq("has_missing_items", true),
    ]);

    const { count: openOrders, error: e1 } = result1;
    const { count: deliveredToday, error: e2 } = result2;
    const { count: expectedDeliveries, error: e3 } = result3;
    const { count: missingItems, error: e4 } = result4;

    if (e1 || e2 || e3 || e4) throw new Error("Failed to Fetch Stats!");

    return res.json({ openOrders, deliveredToday, expectedDeliveries, missingItems });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
