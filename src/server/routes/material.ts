import { Router } from "express";
import { dbClient } from "../../lib/supabaseServer"

const router = Router();

router.get("/", async (req, res) => {
    const {data, error} = await dbClient.from("material_item").select("*");

    if(error) {
        return res.status(500).json({error: error.message});

    }
    return res.json({data})
})

export default router;