import { dbClient } from "../../lib/supabaseServer";
import type { EventType } from "../../types/requests";

// helper function that logs activity to the activity_log table - used for creating the recent activity on dashboard

export async function logActivity(actorId: string, eventType: EventType, poID: string, po_number: string) {
  const { data, error } = await dbClient
    .from("profiles")
    .select("name")
    .eq("user_id", actorId)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  const name = data.name;

  let description = "";

  switch (eventType) {
    case "order_created":
      description = `${po_number} was created by ${name}`;
      break;
    case "order_shipped":
      description = `${po_number} was marked shipped by ${name}`;
      break;
    case "order_delivered":
      description = `${po_number} was marked delivered by ${name}`;
      break;
    default:
      description = "";
  }

  const { error: insertError } = await dbClient.from("activity_log").insert({
    actor_id: actorId,
    event_type: eventType,
    description: description,
    po_id: poID,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}
