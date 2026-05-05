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
        (payload) => {
          console.log("realtime: pay_orders change", payload);
          queryClient.invalidateQueries({ queryKey: ["orders"] });
          queryClient.invalidateQueries({ queryKey: ["stats"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        (payload) => {
          console.log("realtime: activity_log change", payload);
          queryClient.invalidateQueries({ queryKey: ["activity"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "location_item" },
        (payload) => {
          console.log("realtime: location_item change", payload);
          queryClient.invalidateQueries({ queryKey: ["locations"] });
        },
      )
      .subscribe((status) => {
        console.log("realtime status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
