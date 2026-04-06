export type RequestItem = {
  item_id: string;
  quantity: number | null;
  material_item: {
    item_name: string;
    unit: string | null;
  };
};

export type Request = {
  request_id: string;
  status: string | null;
  created_at: string;
  logged_by: string | null;
  requested_from: string | null;
  requested_to: string | null;
  request_item: RequestItem[];
};

export type Location = {
  location_id: string;
  location_name: string | null;
  location_item: {
    item_id: string;
    material_item: { item_name: string; unit: string };
  }[];
};

export type Status = "requested" | "approved" | "denied" | "shipped" | "delivered";
