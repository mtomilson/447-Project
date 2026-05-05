import React from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "./navbar/index";
import { useRealtimeSync } from "../lib/supabase/useRealtimeSync";

export function Layout() {
  const { pathname } = useLocation();
  useRealtimeSync();
  return pathname !== "/" ? <Navbar /> : null;
}
