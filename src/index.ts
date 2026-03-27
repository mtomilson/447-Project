import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { supabase } from "./lib/supabaseServer.js";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PATCH", "DELETE"], // which HTTP methods to allow
    allowedHeaders: ["Content-Type", "Authorization"], // Authorization needed later for auth tokens
  }),
);

app.use(express.json());

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("server running on ", PORT);
});

app.get("/api/users", async (req, res) => {
  const {data, error} = await supabase.from("user").select("*")
  if (error) {
    res.status(500).json({error: error.message})
  } else {
    res.json(data)
  }
}); 


export default app;
