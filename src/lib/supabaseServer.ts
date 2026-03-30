import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import type { Database } from "../types/supabase";

dotenv.config();
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
