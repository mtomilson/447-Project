import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const authClient = createClient( // for some reason need both auth client and db client, otherwise it queries the database with the auth token
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

const dbClient = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

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

async function authenticateUser(email: string, password: string) { // first authenticate the user 
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function getUserProfile(userId: string) { // queries the profile table looking for user_id that matches the authenticated user 
  console.log(userId)
  const { data, error } = await dbClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await authenticateUser(email, password); // returns data about authenticated user, includes session token and uuid
    const profile = await getUserProfile(authData.user.id); // returns profile data for authenticated user, includes user_id and role

    return res.json({
      user: profile,
      token: authData.session?.access_token, // session token, can be used for subsequent authenticated requests 
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});


export default app;
