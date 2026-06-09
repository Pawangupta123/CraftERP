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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      buyers: {
        Row: {
          address: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      hardware_components: {
        Row: {
          description: string | null
          id: string
          name: string | null
          position: number | null
          quantity: number | null
          serial_no: number | null
          sku_id: string
          unit: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          name?: string | null
          position?: number | null
          quantity?: number | null
          serial_no?: number | null
          sku_id: string
          unit?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string | null
          position?: number | null
          quantity?: number | null
          serial_no?: number | null
          sku_id?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hardware_components_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_issues: {
        Row: {
          created_at: string
          date: string
          id: string
          issued_by: string | null
          issued_to_name: string | null
          item_name: string
          quantity: number | null
          remark: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          issued_by?: string | null
          issued_to_name?: string | null
          item_name: string
          quantity?: number | null
          remark?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          issued_by?: string | null
          issued_to_name?: string | null
          item_name?: string
          quantity?: number | null
          remark?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_issues_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      iron_components: {
        Row: {
          description: string | null
          id: string
          length: number | null
          picture_url: string | null
          position: number | null
          remark: string | null
          section: string | null
          sku_id: string
          width: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          length?: number | null
          picture_url?: string | null
          position?: number | null
          remark?: string | null
          section?: string | null
          sku_id: string
          width?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          length?: number | null
          picture_url?: string | null
          position?: number | null
          remark?: string | null
          section?: string | null
          sku_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "iron_components_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_components: {
        Row: {
          barcode: string | null
          corners: string | null
          corrugated_box: string | null
          id: string
          labels: string | null
          position: number | null
          sku_id: string
        }
        Insert: {
          barcode?: string | null
          corners?: string | null
          corrugated_box?: string | null
          id?: string
          labels?: string | null
          position?: number | null
          sku_id: string
        }
        Update: {
          barcode?: string | null
          corners?: string | null
          corrugated_box?: string | null
          id?: string
          labels?: string | null
          position?: number | null
          sku_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_components_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number | null
          bl: boolean
          brc: boolean
          container_no: string | null
          conversion_rate: number | null
          created_at: string
          currency: Database["public"]["Enums"]["currency_code"]
          date: string | null
          id: string
          percentage: number | null
          po_id: string
          remark: string | null
        }
        Insert: {
          amount?: number | null
          bl?: boolean
          brc?: boolean
          container_no?: string | null
          conversion_rate?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          date?: string | null
          id?: string
          percentage?: number | null
          po_id: string
          remark?: string | null
        }
        Update: {
          amount?: number | null
          bl?: boolean
          brc?: boolean
          container_no?: string | null
          conversion_rate?: number | null
          created_at?: string
          currency?: Database["public"]["Enums"]["currency_code"]
          date?: string | null
          id?: string
          percentage?: number | null
          po_id?: string
          remark?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      po_line_items: {
        Row: {
          id: string
          po_id: string
          position: number | null
          quantity: number
          sku_id: string
        }
        Insert: {
          id?: string
          po_id: string
          position?: number | null
          quantity?: number
          sku_id: string
        }
        Update: {
          id?: string
          po_id?: string
          position?: number | null
          quantity?: number
          sku_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "po_line_items_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_line_items_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_date: string | null
          id: string
          inspection_date: string | null
          photo_url: string | null
          po_no: string
          shipping_country: string | null
          shipping_date: string | null
          status: Database["public"]["Enums"]["po_status"]
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          inspection_date?: string | null
          photo_url?: string | null
          po_no: string
          shipping_country?: string | null
          shipping_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_date?: string | null
          id?: string
          inspection_date?: string | null
          photo_url?: string | null
          po_no?: string
          shipping_country?: string | null
          shipping_date?: string | null
          status?: Database["public"]["Enums"]["po_status"]
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      skus: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          photo_url: string | null
          remark: string | null
          sku_no: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          photo_url?: string | null
          remark?: string | null
          sku_no: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          remark?: string | null
          sku_no?: string
        }
        Relationships: []
      }
      stage_tracking: {
        Row: {
          current_stage: string | null
          id: string
          po_line_item_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          current_stage?: string | null
          id?: string
          po_line_item_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          current_stage?: string | null
          id?: string
          po_line_item_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_tracking_po_line_item_id_fkey"
            columns: ["po_line_item_id"]
            isOneToOne: false
            referencedRelation: "po_line_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_tracking_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wood_components: {
        Row: {
          breadth: number | null
          description: string | null
          id: string
          length: number | null
          position: number | null
          quantity: number | null
          sku_id: string
          thickness: number | null
        }
        Insert: {
          breadth?: number | null
          description?: string | null
          id?: string
          length?: number | null
          position?: number | null
          quantity?: number | null
          sku_id: string
          thickness?: number | null
        }
        Update: {
          breadth?: number | null
          description?: string | null
          id?: string
          length?: number | null
          position?: number | null
          quantity?: number | null
          sku_id?: string
          thickness?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "wood_components_sku_id_fkey"
            columns: ["sku_id"]
            isOneToOne: false
            referencedRelation: "skus"
            referencedColumns: ["id"]
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
      currency_code: "INR" | "USD" | "EUR"
      po_status: "upcoming" | "in_progress" | "completed"
      user_role: "admin" | "operator" | "manager" | "store_manager"
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
      currency_code: ["INR", "USD", "EUR"],
      po_status: ["upcoming", "in_progress", "completed"],
      user_role: ["admin", "operator", "manager", "store_manager"],
    },
  },
} as const
