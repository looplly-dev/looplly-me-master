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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      cint_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      cint_survey_sessions: {
        Row: {
          actual_reward: number | null
          cint_session_id: string
          completed_at: string | null
          created_at: string
          estimated_duration: number | null
          estimated_reward: number
          id: string
          started_at: string
          status: string
          survey_id: string
          survey_url: string
          terminated_reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          actual_reward?: number | null
          cint_session_id: string
          completed_at?: string | null
          created_at?: string
          estimated_duration?: number | null
          estimated_reward: number
          id?: string
          started_at?: string
          status?: string
          survey_id: string
          survey_url: string
          terminated_reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          actual_reward?: number | null
          cint_session_id?: string
          completed_at?: string | null
          created_at?: string
          estimated_duration?: number | null
          estimated_reward?: number
          id?: string
          started_at?: string
          status?: string
          survey_id?: string
          survey_url?: string
          terminated_reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      communication_preferences: {
        Row: {
          created_at: string
          earning_updates: boolean | null
          email_marketing: boolean | null
          id: string
          push_notifications: boolean | null
          sms_marketing: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earning_updates?: boolean | null
          email_marketing?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_marketing?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          earning_updates?: boolean | null
          email_marketing?: boolean | null
          id?: string
          push_notifications?: boolean | null
          sms_marketing?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      earning_activities: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string | null
          reward_amount: number
          status: Database["public"]["Enums"]["activity_status"] | null
          time_estimate: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          reward_amount: number
          status?: Database["public"]["Enums"]["activity_status"] | null
          time_estimate?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          reward_amount?: number
          status?: Database["public"]["Enums"]["activity_status"] | null
          time_estimate?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          country_code: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_type"] | null
          gps_enabled: boolean | null
          id: string
          is_verified: boolean | null
          last_name: string | null
          mobile: string | null
          profile_complete: boolean | null
          sec: Database["public"]["Enums"]["sec_classification"] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gps_enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          mobile?: string | null
          profile_complete?: boolean | null
          sec?: Database["public"]["Enums"]["sec_classification"] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          country_code?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_type"] | null
          gps_enabled?: boolean | null
          id?: string
          is_verified?: boolean | null
          last_name?: string | null
          mobile?: string | null
          profile_complete?: boolean | null
          sec?: Database["public"]["Enums"]["sec_classification"] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string
          user_id?: string
          uses_count?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          accountant_status: string | null
          created_at: string
          funds_verified: boolean | null
          id: string
          min_rep_points: number | null
          paid_at: string | null
          payout_completed: boolean | null
          qualification_met: boolean | null
          qualified_at: string | null
          referee_earnings: number | null
          referee_id: string
          referral_code: string
          referrer_id: string
          referrer_payout: number | null
          status: string
          updated_at: string
        }
        Insert: {
          accountant_status?: string | null
          created_at?: string
          funds_verified?: boolean | null
          id?: string
          min_rep_points?: number | null
          paid_at?: string | null
          payout_completed?: boolean | null
          qualification_met?: boolean | null
          qualified_at?: string | null
          referee_earnings?: number | null
          referee_id: string
          referral_code: string
          referrer_id: string
          referrer_payout?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          accountant_status?: string | null
          created_at?: string
          funds_verified?: boolean | null
          id?: string
          min_rep_points?: number | null
          paid_at?: string | null
          payout_completed?: boolean | null
          qualification_met?: boolean | null
          qualified_at?: string | null
          referee_earnings?: number | null
          referee_id?: string
          referral_code?: string
          referrer_id?: string
          referrer_payout?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          id: string
          metadata: Json | null
          referral_id: string | null
          source: string | null
          status: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          referral_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          id?: string
          metadata?: Json | null
          referral_id?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["transaction_status"] | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_balances: {
        Row: {
          available_balance: number | null
          created_at: string
          id: string
          lifetime_withdrawn: number | null
          pending_balance: number | null
          total_earned: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number | null
          created_at?: string
          id?: string
          lifetime_withdrawn?: number | null
          pending_balance?: number | null
          total_earned?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number | null
          created_at?: string
          id?: string
          lifetime_withdrawn?: number | null
          pending_balance?: number | null
          total_earned?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
    }
    Enums: {
      activity_status: "available" | "in_progress" | "completed" | "expired"
      activity_type: "survey" | "video" | "task" | "app_download" | "game_play"
      app_role: "admin" | "user"
      gender_type: "male" | "female" | "other"
      sec_classification: "A" | "B" | "C1" | "C2" | "D" | "E"
      transaction_status: "pending" | "completed" | "failed" | "cancelled"
      transaction_type: "earning" | "withdrawal" | "bonus" | "referral"
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
      activity_status: ["available", "in_progress", "completed", "expired"],
      activity_type: ["survey", "video", "task", "app_download", "game_play"],
      app_role: ["admin", "user"],
      gender_type: ["male", "female", "other"],
      sec_classification: ["A", "B", "C1", "C2", "D", "E"],
      transaction_status: ["pending", "completed", "failed", "cancelled"],
      transaction_type: ["earning", "withdrawal", "bonus", "referral"],
    },
  },
} as const
