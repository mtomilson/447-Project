export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          actor_id: string | null
          created_at: string | null
          description: string | null
          event_type: Database["public"]["Enums"]["event"] | null
          log_id: string
          po_id: string | null
        }
        Insert: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: Database["public"]["Enums"]["event"] | null
          log_id?: string
          po_id?: string | null
        }
        Update: {
          actor_id?: string | null
          created_at?: string | null
          description?: string | null
          event_type?: Database["public"]["Enums"]["event"] | null
          log_id?: string
          po_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "activity_log_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "pay_orders"
            referencedColumns: ["po_id"]
          },
        ]
      }
      deliveries: {
        Row: {
          delivery_date: string
          delivery_id: string
          location_id: string | null
          logged_by: string | null
          notes: string | null
        }
        Insert: {
          delivery_date?: string
          delivery_id?: string
          location_id?: string | null
          logged_by?: string | null
          notes?: string | null
        }
        Update: {
          delivery_date?: string
          delivery_id?: string
          location_id?: string | null
          logged_by?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "deliveries_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      delivery_item: {
        Row: {
          delivery_id: string
          item_id: string
          quantity: number | null
        }
        Insert: {
          delivery_id: string
          item_id: string
          quantity?: number | null
        }
        Update: {
          delivery_id?: string
          item_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_item_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "deliveries"
            referencedColumns: ["delivery_id"]
          },
          {
            foreignKeyName: "delivery_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "material_item"
            referencedColumns: ["item_id"]
          },
        ]
      }
      location: {
        Row: {
          address: string | null
          created_at: string
          is_active: boolean | null
          location_id: string
          location_name: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          is_active?: boolean | null
          location_id?: string
          location_name?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          is_active?: boolean | null
          location_id?: string
          location_name?: string | null
        }
        Relationships: []
      }
      location_item: {
        Row: {
          item_id: string
          location_id: string
          quantity: number | null
        }
        Insert: {
          item_id: string
          location_id: string
          quantity?: number | null
        }
        Update: {
          item_id?: string
          location_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "location_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "material_item"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "location_item_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
        ]
      }
      material_item: {
        Row: {
          item_id: string
          item_name: string
          unit: string | null
        }
        Insert: {
          item_id?: string
          item_name: string
          unit?: string | null
        }
        Update: {
          item_id?: string
          item_name?: string
          unit?: string | null
        }
        Relationships: []
      }
      pay_order_item: {
        Row: {
          item_id: string
          po_id: string
          po_item_id: string
          quantity: number
          received_quantity: number | null
        }
        Insert: {
          item_id: string
          po_id: string
          po_item_id?: string
          quantity: number
          received_quantity?: number | null
        }
        Update: {
          item_id?: string
          po_id?: string
          po_item_id?: string
          quantity?: number
          received_quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pay_order_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "material_item"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "pay_order_item_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "pay_orders"
            referencedColumns: ["po_id"]
          },
        ]
      }
      pay_orders: {
        Row: {
          created_at: string
          created_by: string
          delivered_at: string | null
          destination_location_id: string
          has_missing_items: boolean | null
          notes: string | null
          po_id: string
          po_number: string
          shipped_at: string | null
          signed: string | null
          source_location_id: string | null
          status: string
          vendor: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          delivered_at?: string | null
          destination_location_id: string
          has_missing_items?: boolean | null
          notes?: string | null
          po_id?: string
          po_number?: string
          shipped_at?: string | null
          signed?: string | null
          source_location_id?: string | null
          status?: string
          vendor?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          delivered_at?: string | null
          destination_location_id?: string
          has_missing_items?: boolean | null
          notes?: string | null
          po_id?: string
          po_number?: string
          shipped_at?: string | null
          signed?: string | null
          source_location_id?: string | null
          status?: string
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pay_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pay_orders_destination_location_id_fkey"
            columns: ["destination_location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "pay_orders_signed_fkey"
            columns: ["signed"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "pay_orders_source_location_id_fkey"
            columns: ["source_location_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          home_jobsite_id: string | null
          is_active: boolean
          name: string
          role: Database["public"]["Enums"]["role_type"] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string
          home_jobsite_id?: string | null
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["role_type"] | null
          user_id?: string
        }
        Update: {
          created_at?: string
          email?: string
          home_jobsite_id?: string | null
          is_active?: boolean
          name?: string
          role?: Database["public"]["Enums"]["role_type"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_home_jobsite_id_fkey"
            columns: ["home_jobsite_id"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
        ]
      }
      request_item: {
        Row: {
          item_id: string
          quantity: number | null
          request_id: string
        }
        Insert: {
          item_id?: string
          quantity?: number | null
          request_id?: string
        }
        Update: {
          item_id?: string
          quantity?: number | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_item_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "material_item"
            referencedColumns: ["item_id"]
          },
          {
            foreignKeyName: "request_item_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["request_id"]
          },
        ]
      }
      requests: {
        Row: {
          approved_by: string | null
          created_at: string
          logged_by: string
          request_id: string
          requested_from: string | null
          requested_to: string | null
          status: Database["public"]["Enums"]["status"]
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          logged_by: string
          request_id?: string
          requested_from?: string | null
          requested_to?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          logged_by?: string
          request_id?: string
          requested_from?: string | null
          requested_to?: string | null
          status?: Database["public"]["Enums"]["status"]
        }
        Relationships: [
          {
            foreignKeyName: "requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "requests_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "requests_requested_from_fkey"
            columns: ["requested_from"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "requests_requested_to_fkey"
            columns: ["requested_to"]
            isOneToOne: false
            referencedRelation: "location"
            referencedColumns: ["location_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event: "order_created" | "order_shipped" | "order_delivered"
      role_type:
        | "jobsite_logistic"
        | "warehouse_logistic"
        | "project_manager"
        | "system_administrator"
      status: "requested" | "approved" | "shipped" | "delivered" | "denied"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      event: ["order_created", "order_shipped", "order_delivered"],
      role_type: [
        "jobsite_logistic",
        "warehouse_logistic",
        "project_manager",
        "system_administrator",
      ],
      status: ["requested", "approved", "shipped", "delivered", "denied"],
    },
  },
} as const
