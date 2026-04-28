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
    quantity: number | null;
    material_item: { item_name: string; unit: string | null };
  }[];
  address: string | null;
  is_active: boolean | null;

};

export type Status = "requested" | "approved" | "denied" | "shipped" | "delivered";

export type POStatus = "created" | "shipped" | "delivered";

export type PayOrderItem = {
  po_item_id: string;
  item_id: string;
  quantity: number;
  material_item: {
    item_name: string;
    unit: string | null;
  };
  received_quantity: number | null;
};

export type PayOrder = {
  po_id: string;
  po_number: string;
  status: POStatus;
  vendor: string | null;
  source_location_id: string | null;
  destination_location_id: string;
  notes: string | null;
  created_by: string;
  created_at: string;
  pay_order_item: PayOrderItem[];
  signed: string | null;
  signer: { name: string } | null;
  has_missing_items: boolean;
  expected_delivery: string;
};

export type EventType = 'order_created' | 'order_shipped' | 'order_delivered';

export type Stats = {
  openOrders: number;
  deliveredToday: number;
  expectedDeliveries: number;
  missingItems: number;
}

export type ActivityLog = {
  log_id: string;
  actor_id: string;
  event_type: EventType;
  description: string;
  po_id: string;
  created_at: string;
}

export type MaterialItem = {
  item_id: string;
  item_name: string;
  unit: string | null;
};