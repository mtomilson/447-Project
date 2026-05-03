import express from "express"
import { authClient } from "../lib/supabase/supabaseServer"
import { getUserProfile } from "../lib/helper/helper";

export async function authenticate(
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