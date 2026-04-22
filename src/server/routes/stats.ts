import { Router } from "express";
import { dbClient } from "../../lib/supabaseServer";

const router = Router();

router.get("/", async (req, res) => {
  const start = new Date();
  const end = new Date();

  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  try {
    const [result1, result2, result3] = await Promise.all([
      dbClient
        .from("pay_orders")
        .select("*", { count: "exact", head: true })
        .eq("status", "created"),
      dbClient
        .from("pay_orders")
        .select("", { count: "exact", head: true })
        .eq("status", "delivered")
        .gte("created_at", start.toISOString())
        .lte("created_at", end.toISOString()),
      dbClient
        .from("location_item")
        .select("*", { count: "exact", head: true })
        .lt("quantity", 5),
    ]);

    const { count: openOrders, error: e1 } = result1;
    const { count: deliveredToday, error: e2 } = result2;
    const { count: lowStock, error: e3 } = result3;

    if (e1 || e2 || e3) throw new Error("Failed to Fetch Stats!");

    return res.json({ openOrders, deliveredToday, lowStock });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;