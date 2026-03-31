import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "../types/supabase";

dotenv.config();
const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!

export const dbClient = createClient<Database>(supabaseUrl, supabaseAnonKey);
export const authClient = createClient<Database>(supabaseUrl, supabaseAnonKey);


