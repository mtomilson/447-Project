import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabaseClient";

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      supabase.realtime.setAuth(token);
      supabase.realtime.disconnect();
      supabase.realtime.connect();
    }

    const channel = supabase
      .channel("realtime-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pay_orders" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "location_item" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["locations"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
