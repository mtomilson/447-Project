/**
 * Server file, defines all routes to connect the frontend to the database
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

declare module "express" {
  interface Request {
    user?: {
      user_id: string;
      name: string;
      email: string;
      role: string;
      created_at: string;
      is_active: boolean;
    };
  }
}

dotenv.config();

const authClient = createClient(
  // for some reason need both auth client and db client, otherwise it queries the database with the auth token
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
);

const dbClient = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
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

async function authenticateUser(email: string, password: string) {
  // first authenticate the user
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function getUserProfile(userId: string) {
  // queries the profile table looking for user_id that matches the authenticated user
  console.log(userId);
  const { data, error } = await dbClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}

/**
 * Authenticate function is a middleware function, it authenticates any user trying to make a request,
 * It is attached to any route as an argument and when a route is called that has it, it runs authenticate first
 * then if it's a valid token, it proceeds to the next function.
 */

async function authenticate(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) {
  const token = req.headers.authorization?.split(" ")[1]; // gets rid of "bearer" tag on authorization

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const { data, error } = await authClient.auth.getUser(token); // determines if token is valid

  if (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const user_id = data.user.id;

  const userData = await getUserProfile(user_id);

  req.user = userData[0];

  next(); // token is valid, continue to the route handler
}

/**
 * login route
 * params: email: string, password: string
 * returns: user: JSON Object, token: string
 */

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const authData = await authenticateUser(email, password); // returns data about authenticated user, includes session token and uuid
    const profile = await getUserProfile(authData.user.id); // returns profile data for authenticated user, includes user_id and role

    return res.json({
      user: profile,
      token: authData.session?.access_token, // session token, can be used for subsequent authenticated requests
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ANY CRUD operations should have authenticate in the header to prevent any non authenticated users from accessing database

/**
 * Authenticated route, will return all requests with all items attached to request and the quantity.
 */
app.get("/api/requests", authenticate, async (req, res) => {
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
    console.log("error: ", error.message);
    return res.status(500).json({ error: error.message });
  }
});

/**
 * Authenticated route, will update a request with a given status that is passed in the params 
 */

app.patch("/api/requests/:id", authenticate, async (req, res) => {
  const { newStatus } = req.body;
  const requestId = req.params.id;
  const { data, error } = await dbClient
    .from("requests")
    .update({ status: newStatus }) // status is the column name, newStatus is the new value to give it
    .eq("request_id", requestId);

  if (error) {
    res.status(500).json({ error: error.message });
  }

  return res.json({ data });
});

/**
 * Authenticated Route, will return all locations and the items and quantities associated to each location
 */

app.get("/api/locations", authenticate, async (req, res) => {
  const { data, error } = await dbClient.from("location").select(`*, location_item(*, material_item(*))`);

  if (error) {
    res.status(500).json({ error: error.message });
  }

  return res.json({ data });
});



export default app;
