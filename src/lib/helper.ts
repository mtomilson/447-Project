import { dbClient, authClient } from "../lib/supabaseServer";

export async function authenticateUser(email: string, password: string) {
  // first authenticate the user
  const { data, error } = await authClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string) {
  // queries the profile table looking for user_id that matches the authenticated user
  console.log(userId);
  const { data, error } = await dbClient
    .from("profiles")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  return data;
}
