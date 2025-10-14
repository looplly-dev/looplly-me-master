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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          agent_id: string
          config_key: string
          config_value: Json
          created_at: string
          data_type: Database["public"]["Enums"]["config_data_type"]
          description: string | null
          id: string
          is_secret: boolean
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          config_key: string
          config_value?: Json
          created_at?: string
          data_type?: Database["public"]["Enums"]["config_data_type"]
          description?: string | null
          id?: string
          is_secret?: boolean
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          config_key?: string
          config_value?: Json
          created_at?: string
          data_type?: Database["public"]["Enums"]["config_data_type"]
          description?: string | null
          id?: string
          is_secret?: boolean
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_configs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_configs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_dependencies: {
        Row: {
          created_at: string
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          dependent_agent_id: string
          id: string
          is_active: boolean
          parent_agent_id: string
        }
        Insert: {
          created_at?: string
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          dependent_agent_id: string
          id?: string
          is_active?: boolean
          parent_agent_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: Database["public"]["Enums"]["dependency_type"]
          dependent_agent_id?: string
          id?: string
          is_active?: boolean
          parent_agent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_dependencies_dependent_agent_id_fkey"
            columns: ["dependent_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_dependencies_parent_agent_id_fkey"
            columns: ["parent_agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_executions: {
        Row: {
          agent_id: string
          api_calls_made: number | null
          api_cost_usd: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          error_type: string | null
          execution_id: string
          id: string
          metadata: Json | null
          response_time_ms: number | null
          started_at: string
          status: Database["public"]["Enums"]["execution_status"]
          tenant_id: string | null
          trigger_data: Json | null
          trigger_type: string
          user_id: string | null
        }
        Insert: {
          agent_id: string
          api_calls_made?: number | null
          api_cost_usd?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          execution_id: string
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          started_at: string
          status: Database["public"]["Enums"]["execution_status"]
          tenant_id?: string | null
          trigger_data?: Json | null
          trigger_type: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string
          api_calls_made?: number | null
          api_cost_usd?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          error_type?: string | null
          execution_id?: string
          id?: string
          metadata?: Json | null
          response_time_ms?: number | null
          started_at?: string
          status?: Database["public"]["Enums"]["execution_status"]
          tenant_id?: string | null
          trigger_data?: Json | null
          trigger_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_executions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "ai_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_executions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_agents: {
        Row: {
          category: string
          created_at: string
          description: string
          icon_name: string
          id: string
          is_system: boolean
          name: string
          purpose: string
          slug: string
          status: Database["public"]["Enums"]["agent_status"]
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon_name: string
          id?: string
          is_system?: boolean
          name: string
          purpose: string
          slug: string
          status?: Database["public"]["Enums"]["agent_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          is_system?: boolean
          name?: string
          purpose?: string
          slug?: string
          status?: Database["public"]["Enums"]["agent_status"]
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_agents_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      badge_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          icon_name: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          rarity: string | null
          rep_points: number | null
          requirement: string | null
          shape: string | null
          tenant_id: string
          tier: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          rarity?: string | null
          rep_points?: number | null
          requirement?: string | null
          shape?: string | null
          tenant_id: string
          tier?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          icon_name?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          rarity?: string | null
          rep_points?: number | null
          requirement?: string | null
          shape?: string | null
          tenant_id?: string
          tier?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badge_catalog_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cint_survey_sessions: {
        Row: {
          actual_reward: number | null
          cint_session_id: string
          completed_at: string | null
          created_at: string | null
          estimated_duration: number | null
          estimated_reward: number
          id: string
          started_at: string | null
          status: string | null
          survey_id: string
          survey_url: string
          terminated_reason: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_reward?: number | null
          cint_session_id: string
          completed_at?: string | null
          created_at?: string | null
          estimated_duration?: number | null
          estimated_reward: number
          id?: string
          started_at?: string | null
          status?: string | null
          survey_id: string
          survey_url: string
          terminated_reason?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_reward?: number | null
          cint_session_id?: string
          completed_at?: string | null
          created_at?: string | null
          estimated_duration?: number | null
          estimated_reward?: number
          id?: string
          started_at?: string | null
          status?: string | null
          survey_id?: string
          survey_url?: string
          terminated_reason?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cint_survey_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      communication_preferences: {
        Row: {
          created_at: string | null
          email_notifications: boolean | null
          id: string
          marketing_emails: boolean | null
          push_notifications: boolean | null
          sms_notifications: boolean | null
          survey_invitations: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          survey_invitations?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email_notifications?: boolean | null
          id?: string
          marketing_emails?: boolean | null
          push_notifications?: boolean | null
          sms_notifications?: boolean | null
          survey_invitations?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      earning_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          reward_amount: number
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reward_amount: number
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          reward_amount?: number
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earning_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          badge_preview_mode: boolean | null
          country_code: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          ethnicity: string | null
          first_name: string | null
          gender: string | null
          gps_enabled: boolean | null
          household_income: string | null
          is_suspended: boolean | null
          is_verified: boolean | null
          last_name: string | null
          mobile: string | null
          profile_complete: boolean | null
          sec: string | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          badge_preview_mode?: boolean | null
          country_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          ethnicity?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          mobile?: string | null
          profile_complete?: boolean | null
          sec?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          badge_preview_mode?: boolean | null
          country_code?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          ethnicity?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          mobile?: string | null
          profile_complete?: boolean | null
          sec?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          api_key: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          api_key?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          source: string | null
          status: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          source?: string | null
          status?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_badges: {
        Row: {
          awarded_at: string | null
          badge_id: string
          id: string
          metadata: Json | null
          user_id: string
        }
        Insert: {
          awarded_at?: string | null
          badge_id: string
          id?: string
          metadata?: Json | null
          user_id: string
        }
        Update: {
          awarded_at?: string | null
          badge_id?: string
          id?: string
          metadata?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_balances: {
        Row: {
          balance: number
          created_at: string | null
          currency: string | null
          id: string
          lifetime_earnings: number | null
          pending_balance: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          lifetime_earnings?: number | null
          pending_balance?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          lifetime_earnings?: number | null
          pending_balance?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_balances_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth_users_with_phones: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          phone: string
          user_id: string
        }[]
      }
      get_user_tenant_id: {
        Args: { p_user_id: string }
        Returns: string
      }
      has_role: {
        Args: { p_role: string; p_user_id: string }
        Returns: boolean
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_metadata?: Json
          p_resource_id?: string
          p_resource_type?: string
          p_tenant_id: string
          p_user_id: string
        }
        Returns: string
      }
      validate_tenant_api_key: {
        Args: { api_key_input: string }
        Returns: string
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "testing"
      app_role: "admin" | "user"
      config_data_type: "string" | "number" | "boolean" | "json"
      dependency_type: "triggers" | "requires" | "observes"
      execution_status: "success" | "failure" | "timeout" | "cancelled"
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
      agent_status: ["active", "inactive", "testing"],
      app_role: ["admin", "user"],
      config_data_type: ["string", "number", "boolean", "json"],
      dependency_type: ["triggers", "requires", "observes"],
      execution_status: ["success", "failure", "timeout", "cancelled"],
    },
  },
} as const
