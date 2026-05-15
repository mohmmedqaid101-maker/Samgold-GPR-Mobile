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
      activity_log: {
        Row: {
          category: Database["public"]["Enums"]["activity_category"]
          created_at: string
          description_ar: string
          description_en: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          description_ar: string
          description_en: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["activity_category"]
          created_at?: string
          description_ar?: string
          description_en?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      ai_usage_log: {
        Row: {
          cost_credits: number | null
          created_at: string
          endpoint: string | null
          id: string
          metadata: Json | null
          model: string
          tokens_input: number | null
          tokens_output: number | null
          user_id: string
        }
        Insert: {
          cost_credits?: number | null
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          model: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id: string
        }
        Update: {
          cost_credits?: number | null
          created_at?: string
          endpoint?: string | null
          id?: string
          metadata?: Json | null
          model?: string
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          battery_level: number
          created_at: string
          firmware_version: string | null
          id: string
          last_seen_at: string
          metadata: Json | null
          model: string
          name: string
          serial_number: string | null
          status: Database["public"]["Enums"]["device_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          battery_level?: number
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          model?: string
          name: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          battery_level?: number
          created_at?: string
          firmware_version?: string | null
          id?: string
          last_seen_at?: string
          metadata?: Json | null
          model?: string
          name?: string
          serial_number?: string | null
          status?: Database["public"]["Enums"]["device_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gpr_readings: {
        Row: {
          anomaly_score: number | null
          created_at: string
          depth_meters: number | null
          frequency_hz: number | null
          id: string
          recorded_at: string
          signal_data: Json
          soil_type: string | null
          survey_id: string | null
          user_id: string
        }
        Insert: {
          anomaly_score?: number | null
          created_at?: string
          depth_meters?: number | null
          frequency_hz?: number | null
          id?: string
          recorded_at?: string
          signal_data: Json
          soil_type?: string | null
          survey_id?: string | null
          user_id: string
        }
        Update: {
          anomaly_score?: number | null
          created_at?: string
          depth_meters?: number | null
          frequency_hz?: number | null
          id?: string
          recorded_at?: string
          signal_data?: Json
          soil_type?: string | null
          survey_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "gpr_readings_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body_ar: string | null
          body_en: string | null
          created_at: string
          id: string
          link: string | null
          metadata: Json | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          read: boolean
          title_ar: string
          title_en: string
          user_id: string
        }
        Insert: {
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read?: boolean
          title_ar: string
          title_en: string
          user_id: string
        }
        Update: {
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          id?: string
          link?: string | null
          metadata?: Json | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          read?: boolean
          title_ar?: string
          title_en?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biometric_enabled: boolean
          created_at: string
          display_name: string | null
          id: string
          language: string
          mfa_enabled: boolean
          paddle_customer_id: string | null
          paddle_subscription_id: string | null
          phone: string | null
          subscription_expires_at: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          subscription_tier: Database["public"]["Enums"]["subscription_tier"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          biometric_enabled?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string
          mfa_enabled?: boolean
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          phone?: string | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          biometric_enabled?: boolean
          created_at?: string
          display_name?: string | null
          id?: string
          language?: string
          mfa_enabled?: boolean
          paddle_customer_id?: string | null
          paddle_subscription_id?: string | null
          phone?: string | null
          subscription_expires_at?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          metadata: Json | null
          name: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          metadata: Json | null
          report_type: string
          summary: string | null
          survey_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          summary?: string | null
          survey_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          metadata?: Json | null
          report_type?: string
          summary?: string | null
          survey_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          notes: string | null
          project_id: string | null
          raw_data: Json | null
          status: string
          survey_date: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          project_id?: string | null
          raw_data?: Json | null
          status?: string
          survey_date?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          notes?: string | null
          project_id?: string | null
          raw_data?: Json | null
          status?: string
          survey_date?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      targets: {
        Row: {
          confidence: number | null
          created_at: string
          depth_meters: number | null
          detected_at: string
          frequency_hz: number | null
          id: string
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          name: string
          notes: string | null
          signal_strength: number | null
          survey_id: string | null
          target_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          depth_meters?: number | null
          detected_at?: string
          frequency_hz?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name: string
          notes?: string | null
          signal_strength?: number | null
          survey_id?: string | null
          target_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          depth_meters?: number | null
          detected_at?: string
          frequency_hz?: number | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          signal_strength?: number | null
          survey_id?: string | null
          target_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "targets_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          default_frequency_mhz: number | null
          default_gain_db: number | null
          default_max_depth_m: number | null
          default_velocity: number | null
          id: string
          language: string
          preferences: Json | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_frequency_mhz?: number | null
          default_gain_db?: number | null
          default_max_depth_m?: number | null
          default_velocity?: number | null
          id?: string
          language?: string
          preferences?: Json | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_frequency_mhz?: number | null
          default_gain_db?: number | null
          default_max_depth_m?: number | null
          default_velocity?: number | null
          id?: string
          language?: string
          preferences?: Json | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_ai_usage_summary: {
        Args: { days?: number }
        Returns: {
          calls: number
          credits: number
          model: string
          tokens_in: number
          tokens_out: number
        }[]
      }
      admin_list_users: {
        Args: { max_rows?: number; search?: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          language: string
          role: string
          subscription_tier: string
          user_id: string
        }[]
      }
      claim_first_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_category:
        | "scan"
        | "auth"
        | "system"
        | "ai"
        | "payment"
        | "device"
      app_role: "admin" | "moderator" | "user"
      device_status: "online" | "offline" | "maintenance"
      notification_type: "info" | "warning" | "success" | "error"
      subscription_status:
        | "active"
        | "trialing"
        | "past_due"
        | "canceled"
        | "inactive"
      subscription_tier: "free" | "pro" | "gold"
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
      activity_category: ["scan", "auth", "system", "ai", "payment", "device"],
      app_role: ["admin", "moderator", "user"],
      device_status: ["online", "offline", "maintenance"],
      notification_type: ["info", "warning", "success", "error"],
      subscription_status: [
        "active",
        "trialing",
        "past_due",
        "canceled",
        "inactive",
      ],
      subscription_tier: ["free", "pro", "gold"],
    },
  },
} as const
