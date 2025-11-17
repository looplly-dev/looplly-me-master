export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      address_components: {
        Row: {
          administrative_area_level_1: string | null
          administrative_area_level_2: string | null
          country: string | null
          created_at: string | null
          formatted_address: string
          id: string
          is_primary: boolean | null
          latitude: number | null
          locality: string | null
          longitude: number | null
          place_id: string | null
          postal_code: string | null
          route: string | null
          street_number: string | null
          updated_at: string | null
          user_id: string
          verified_at: string | null
        }
        Insert: {
          administrative_area_level_1?: string | null
          administrative_area_level_2?: string | null
          country?: string | null
          created_at?: string | null
          formatted_address: string
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          place_id?: string | null
          postal_code?: string | null
          route?: string | null
          street_number?: string | null
          updated_at?: string | null
          user_id: string
          verified_at?: string | null
        }
        Update: {
          administrative_area_level_1?: string | null
          administrative_area_level_2?: string | null
          country?: string | null
          created_at?: string | null
          formatted_address?: string
          id?: string
          is_primary?: boolean | null
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          place_id?: string | null
          postal_code?: string | null
          route?: string | null
          street_number?: string | null
          updated_at?: string | null
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      agent_configs: {
        Row: {
          agent_id: string
          config_key: string
          config_value: Json
          created_at: string | null
          data_type: Database["public"]["Enums"]["config_data_type"]
          description: string | null
          id: string
          is_secret: boolean
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          agent_id: string
          config_key: string
          config_value?: Json
          created_at?: string | null
          data_type?: Database["public"]["Enums"]["config_data_type"]
          description?: string | null
          id?: string
          is_secret?: boolean
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          agent_id?: string
          config_key?: string
          config_value?: Json
          created_at?: string | null
          data_type?: Database["public"]["Enums"]["config_data_type"]
          description?: string | null
          id?: string
          is_secret?: boolean
          tenant_id?: string | null
          updated_at?: string | null
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
          created_at: string | null
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          dependent_agent_id: string
          id: string
          is_active: boolean
          parent_agent_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          dependent_agent_id: string
          id?: string
          is_active?: boolean
          parent_agent_id: string
        }
        Update: {
          created_at?: string | null
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
          created_at: string | null
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
          created_at?: string | null
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
          created_at?: string | null
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
          created_at: string | null
          description: string
          icon_name: string
          id: string
          is_system: boolean
          name: string
          purpose: string
          slug: string
          status: Database["public"]["Enums"]["agent_status"]
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          is_system?: boolean
          name: string
          purpose: string
          slug: string
          status?: Database["public"]["Enums"]["agent_status"]
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          is_system?: boolean
          name?: string
          purpose?: string
          slug?: string
          status?: Database["public"]["Enums"]["agent_status"]
          tenant_id?: string | null
          updated_at?: string | null
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
      app_secrets: {
        Row: {
          created_at: string | null
          description: string | null
          environment: string
          id: string
          is_public: boolean
          key: string
          tenant_id: string | null
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environment?: string
          id?: string
          is_public?: boolean
          key: string
          tenant_id?: string | null
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environment?: string
          id?: string
          is_public?: boolean
          key?: string
          tenant_id?: string | null
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_secrets_tenant_id_fkey"
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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
        ]
      }
      auto_approval_config: {
        Row: {
          auto_approve_enabled: boolean | null
          confidence_threshold: number | null
          created_at: string | null
          id: string
          question_key: string
          require_manual_review: boolean | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          auto_approve_enabled?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          question_key: string
          require_manual_review?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_approve_enabled?: boolean | null
          confidence_threshold?: number | null
          created_at?: string | null
          id?: string
          question_key?: string
          require_manual_review?: boolean | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auto_approval_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
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
      communication_preferences: {
        Row: {
          created_at: string | null
          email_enabled: boolean | null
          id: string
          push_enabled: boolean | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
          whatsapp_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          whatsapp_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          email_enabled?: boolean | null
          id?: string
          push_enabled?: boolean | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          whatsapp_enabled?: boolean | null
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          moderation_score: Json | null
          poll_options: Json | null
          reputation_impact: number | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderation_score?: Json | null
          poll_options?: Json | null
          reputation_impact?: number | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          moderation_score?: Json | null
          poll_options?: Json | null
          reputation_impact?: number | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      community_votes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      country_blocklist: {
        Row: {
          blocked_at: string | null
          country_code: string
          country_name: string
          created_at: string | null
          dial_code: string
          id: string
          reason: string
        }
        Insert: {
          blocked_at?: string | null
          country_code: string
          country_name: string
          created_at?: string | null
          dial_code: string
          id?: string
          reason: string
        }
        Update: {
          blocked_at?: string | null
          country_code?: string
          country_name?: string
          created_at?: string | null
          dial_code?: string
          id?: string
          reason?: string
        }
        Relationships: []
      }
      country_legal_age: {
        Row: {
          country_code: string
          created_at: string | null
          id: string
          minimum_age: number
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: string
          minimum_age?: number
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: string
          minimum_age?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      country_profiling_gaps: {
        Row: {
          admin_feedback: string | null
          ai_metadata: Json | null
          confidence_score: number | null
          country_code: string
          country_iso: string
          country_name: string
          created_at: string | null
          detected_at: string | null
          draft_options: Json | null
          generated_at: string | null
          id: string
          question_id: string
          question_key: string
          question_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          admin_feedback?: string | null
          ai_metadata?: Json | null
          confidence_score?: number | null
          country_code: string
          country_iso: string
          country_name: string
          created_at?: string | null
          detected_at?: string | null
          draft_options?: Json | null
          generated_at?: string | null
          id?: string
          question_id: string
          question_key: string
          question_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_feedback?: string | null
          ai_metadata?: Json | null
          confidence_score?: number | null
          country_code?: string
          country_iso?: string
          country_name?: string
          created_at?: string | null
          detected_at?: string | null
          draft_options?: Json | null
          generated_at?: string | null
          id?: string
          question_id?: string
          question_key?: string
          question_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_profiling_gaps_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "profile_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "country_profiling_gaps_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      country_question_options: {
        Row: {
          country_code: string
          created_at: string | null
          id: string
          is_fallback: boolean | null
          metadata: Json | null
          options: Json
          question_id: string
          updated_at: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          id?: string
          is_fallback?: boolean | null
          metadata?: Json | null
          options: Json
          question_id: string
          updated_at?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          id?: string
          is_fallback?: boolean | null
          metadata?: Json | null
          options?: Json
          question_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "country_question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "profile_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation: {
        Row: {
          audience: string
          category: string
          content: string
          created_at: string | null
          description: string
          id: string
          parent: string | null
          status: string | null
          tags: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          audience: string
          category: string
          content: string
          created_at?: string | null
          description: string
          id: string
          parent?: string | null
          status?: string | null
          tags: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          audience?: string
          category?: string
          content?: string
          created_at?: string | null
          description?: string
          id?: string
          parent?: string | null
          status?: string | null
          tags?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documentation_access_log: {
        Row: {
          accessed_at: string | null
          action: string
          clicked_result_id: string | null
          document_id: string | null
          id: string
          ip_address: unknown
          result_count: number | null
          search_query: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          action: string
          clicked_result_id?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
          result_count?: number | null
          search_query?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string
          clicked_result_id?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
          result_count?: number | null
          search_query?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      documentation_answers: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          is_accepted: boolean | null
          question_id: string
          upvotes: number | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          question_id: string
          upvotes?: number | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          is_accepted?: boolean | null
          question_id?: string
          upvotes?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentation_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "documentation_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      documentation_feedback: {
        Row: {
          comment: string | null
          created_at: string | null
          document_id: string
          id: string
          rating: number | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          document_id: string
          id?: string
          rating?: number | null
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          document_id?: string
          id?: string
          rating?: number | null
          user_id?: string
        }
        Relationships: []
      }
      documentation_questions: {
        Row: {
          created_at: string | null
          document_id: string
          id: string
          question: string
          section: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          document_id: string
          id?: string
          question: string
          section?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          document_id?: string
          id?: string
          question?: string
          section?: string | null
          user_id?: string
        }
        Relationships: []
      }
      documentation_reading_progress: {
        Row: {
          document_id: string
          id: string
          last_position: string | null
          progress_percent: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          document_id: string
          id?: string
          last_position?: string | null
          progress_percent?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          document_id?: string
          id?: string
          last_position?: string | null
          progress_percent?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      earning_activities: {
        Row: {
          activity_type: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          expires_at: string | null
          external_id: string | null
          id: string
          metadata: Json | null
          provider: string | null
          reward_amount: number
          status: string
          time_estimate: number | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          activity_type: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          reward_amount: number
          status?: string
          time_estimate?: number | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          activity_type?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          expires_at?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          reward_amount?: number
          status?: string
          time_estimate?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      earning_rules: {
        Row: {
          config: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          rule_key: string
          rule_name: string
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_key: string
          rule_name: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          rule_key?: string
          rule_name?: string
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "earning_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          provider: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          verification_date: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          verification_date?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          verification_date?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      otp_verifications: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          mobile: string
          otp_code: string
          user_id: string
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          mobile: string
          otp_code: string
          user_id: string
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          mobile?: string
          otp_code?: string
          user_id?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      profile_answers: {
        Row: {
          answer_json: Json | null
          answer_normalized: string | null
          answer_value: string | null
          created_at: string | null
          id: string
          is_stale: boolean | null
          is_verified: boolean | null
          last_updated: string | null
          question_id: string
          selected_option_short_id: string | null
          targeting_metadata: Json | null
          user_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          answer_json?: Json | null
          answer_normalized?: string | null
          answer_value?: string | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          question_id: string
          selected_option_short_id?: string | null
          targeting_metadata?: Json | null
          user_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          answer_json?: Json | null
          answer_normalized?: string | null
          answer_value?: string | null
          created_at?: string | null
          id?: string
          is_stale?: boolean | null
          is_verified?: boolean | null
          last_updated?: string | null
          question_id?: string
          selected_option_short_id?: string | null
          targeting_metadata?: Json | null
          user_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "profile_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_categories: {
        Row: {
          created_at: string | null
          default_decay_config_key: string | null
          description: string | null
          display_name: string
          display_order: number
          icon: string | null
          id: string
          is_active: boolean | null
          level: number
          name: string
          short_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_decay_config_key?: string | null
          description?: string | null
          display_name: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          name: string
          short_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_decay_config_key?: string | null
          description?: string | null
          display_name?: string
          display_order?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          name?: string
          short_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_categories_default_decay_config_key_fkey"
            columns: ["default_decay_config_key"]
            isOneToOne: false
            referencedRelation: "profile_decay_config"
            referencedColumns: ["config_key"]
          },
        ]
      }
      profile_decay_config: {
        Row: {
          config_key: string
          created_at: string | null
          description: string | null
          id: string
          interval_days: number | null
          interval_type: string
          is_active: boolean
          updated_at: string | null
        }
        Insert: {
          config_key: string
          created_at?: string | null
          description?: string | null
          id?: string
          interval_days?: number | null
          interval_type: string
          is_active?: boolean
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          created_at?: string | null
          description?: string | null
          id?: string
          interval_days?: number | null
          interval_type?: string
          is_active?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      profile_questions: {
        Row: {
          applicability: string | null
          category_id: string
          country_codes: string[] | null
          created_at: string | null
          decay_config_key: string | null
          display_order: number
          help_text: string | null
          id: string
          is_active: boolean | null
          is_draft: boolean
          is_immutable: boolean
          is_required: boolean | null
          level: number
          options: Json | null
          placeholder: string | null
          question_group: string | null
          question_key: string
          question_text: string
          question_type: string
          short_id: string | null
          staleness_days: number | null
          targeting_tags: string[] | null
          updated_at: string | null
          validation_rules: Json | null
        }
        Insert: {
          applicability?: string | null
          category_id: string
          country_codes?: string[] | null
          created_at?: string | null
          decay_config_key?: string | null
          display_order?: number
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_draft?: boolean
          is_immutable?: boolean
          is_required?: boolean | null
          level: number
          options?: Json | null
          placeholder?: string | null
          question_group?: string | null
          question_key: string
          question_text: string
          question_type: string
          short_id?: string | null
          staleness_days?: number | null
          targeting_tags?: string[] | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Update: {
          applicability?: string | null
          category_id?: string
          country_codes?: string[] | null
          created_at?: string | null
          decay_config_key?: string | null
          display_order?: number
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_draft?: boolean
          is_immutable?: boolean
          is_required?: boolean | null
          level?: number
          options?: Json | null
          placeholder?: string | null
          question_group?: string | null
          question_key?: string
          question_text?: string
          question_type?: string
          short_id?: string | null
          staleness_days?: number | null
          targeting_tags?: string[] | null
          updated_at?: string | null
          validation_rules?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "profile_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_questions_decay_config_key_fkey"
            columns: ["decay_config_key"]
            isOneToOne: false
            referencedRelation: "profile_decay_config"
            referencedColumns: ["config_key"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          badge_preview_mode: boolean | null
          company_name: string | null
          company_role: string | null
          country_code: string
          country_iso: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          ethnicity: string | null
          first_login_at: string | null
          first_name: string | null
          gender: string | null
          gps_enabled: boolean | null
          household_income: string | null
          id: string
          invitation_sent_at: string | null
          invited_by: string | null
          is_suspended: boolean | null
          is_test_account: boolean | null
          last_name: string | null
          last_profile_update: string | null
          level_2_complete: boolean | null
          mobile: string
          must_change_password: boolean | null
          personal_income: string | null
          profile_complete: boolean | null
          profile_completeness_score: number | null
          profile_level: number | null
          sec: string | null
          short_id: string | null
          temp_password_expires_at: string | null
          updated_at: string | null
          user_id: string
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          address?: string | null
          badge_preview_mode?: boolean | null
          company_name?: string | null
          company_role?: string | null
          country_code?: string
          country_iso?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          ethnicity?: string | null
          first_login_at?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          id?: string
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_suspended?: boolean | null
          is_test_account?: boolean | null
          last_name?: string | null
          last_profile_update?: string | null
          level_2_complete?: boolean | null
          mobile: string
          must_change_password?: boolean | null
          personal_income?: string | null
          profile_complete?: boolean | null
          profile_completeness_score?: number | null
          profile_level?: number | null
          sec?: string | null
          short_id?: string | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          address?: string | null
          badge_preview_mode?: boolean | null
          company_name?: string | null
          company_role?: string | null
          country_code?: string
          country_iso?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          ethnicity?: string | null
          first_login_at?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          id?: string
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_suspended?: boolean | null
          is_test_account?: boolean | null
          last_name?: string | null
          last_profile_update?: string | null
          level_2_complete?: boolean | null
          mobile?: string
          must_change_password?: boolean | null
          personal_income?: string | null
          profile_complete?: boolean | null
          profile_completeness_score?: number | null
          profile_level?: number | null
          sec?: string | null
          short_id?: string | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      profiles_team_backup: {
        Row: {
          address: string | null
          badge_preview_mode: boolean | null
          company_name: string | null
          company_role: string | null
          country_code: string | null
          country_iso: string | null
          created_at: string | null
          date_of_birth: string | null
          ethnicity: string | null
          first_login_at: string | null
          first_name: string | null
          gender: string | null
          gps_enabled: boolean | null
          household_income: string | null
          id: string | null
          invitation_sent_at: string | null
          invited_by: string | null
          is_suspended: boolean | null
          is_test_account: boolean | null
          last_name: string | null
          last_profile_update: string | null
          level_2_complete: boolean | null
          mobile: string | null
          must_change_password: boolean | null
          password_hash: string | null
          personal_income: string | null
          profile_complete: boolean | null
          profile_completeness_score: number | null
          profile_level: number | null
          sec: string | null
          short_id: string | null
          temp_password_expires_at: string | null
          updated_at: string | null
          user_id: string | null
          user_type: Database["public"]["Enums"]["user_type"] | null
        }
        Insert: {
          address?: string | null
          badge_preview_mode?: boolean | null
          company_name?: string | null
          company_role?: string | null
          country_code?: string | null
          country_iso?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ethnicity?: string | null
          first_login_at?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          id?: string | null
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_suspended?: boolean | null
          is_test_account?: boolean | null
          last_name?: string | null
          last_profile_update?: string | null
          level_2_complete?: boolean | null
          mobile?: string | null
          must_change_password?: boolean | null
          password_hash?: string | null
          personal_income?: string | null
          profile_complete?: boolean | null
          profile_completeness_score?: number | null
          profile_level?: number | null
          sec?: string | null
          short_id?: string | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Update: {
          address?: string | null
          badge_preview_mode?: boolean | null
          company_name?: string | null
          company_role?: string | null
          country_code?: string | null
          country_iso?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          ethnicity?: string | null
          first_login_at?: string | null
          first_name?: string | null
          gender?: string | null
          gps_enabled?: boolean | null
          household_income?: string | null
          id?: string | null
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_suspended?: boolean | null
          is_test_account?: boolean | null
          last_name?: string | null
          last_profile_update?: string | null
          level_2_complete?: boolean | null
          mobile?: string | null
          must_change_password?: boolean | null
          password_hash?: string | null
          personal_income?: string | null
          profile_complete?: boolean | null
          profile_completeness_score?: number | null
          profile_level?: number | null
          sec?: string | null
          short_id?: string | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: Database["public"]["Enums"]["user_type"] | null
        }
        Relationships: []
      }
      question_answer_options: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          label: string
          metadata: Json | null
          question_id: string
          question_short_id: string
          short_id: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          label: string
          metadata?: Json | null
          question_id: string
          question_short_id: string
          short_id: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          label?: string
          metadata?: Json | null
          question_id?: string
          question_short_id?: string
          short_id?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_answer_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "profile_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_audit_log: {
        Row: {
          change_type: string
          changed_at: string | null
          changed_by: string | null
          id: string
          new_values: Json | null
          old_values: Json | null
          question_id: string | null
        }
        Insert: {
          change_type: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          question_id?: string | null
        }
        Update: {
          change_type?: string
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          new_values?: Json | null
          old_values?: Json | null
          question_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "question_audit_log_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "profile_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string | null
          id: string
          qualified_at: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          qualified_at?: string | null
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          qualified_at?: string | null
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      streak_unlock_config: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          stage: number
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          stage: number
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          stage?: number
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "streak_unlock_config_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      team_activity_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          team_user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          team_user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          team_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_activity_log_team_user_id_fkey"
            columns: ["team_user_id"]
            isOneToOne: false
            referencedRelation: "team_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      team_members: {
        Row: {
          access_level: string | null
          added_at: string | null
          added_by: string | null
          department: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          user_id: string
        }
        Insert: {
          access_level?: string | null
          added_at?: string | null
          added_by?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          user_id: string
        }
        Update: {
          access_level?: string | null
          added_at?: string | null
          added_by?: string | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      team_profiles: {
        Row: {
          company_name: string | null
          company_role: string | null
          created_at: string | null
          email: string
          first_login_at: string | null
          first_name: string | null
          id: string
          invitation_sent_at: string | null
          invited_by: string | null
          is_active: boolean | null
          last_name: string | null
          must_change_password: boolean | null
          temp_password_expires_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_name?: string | null
          company_role?: string | null
          created_at?: string | null
          email: string
          first_login_at?: string | null
          first_name?: string | null
          id?: string
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_name?: string | null
          company_role?: string | null
          created_at?: string | null
          email?: string
          first_login_at?: string | null
          first_name?: string | null
          id?: string
          invitation_sent_at?: string | null
          invited_by?: string | null
          is_active?: boolean | null
          last_name?: string | null
          must_change_password?: boolean | null
          temp_password_expires_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          currency: string
          description: string
          id: string
          metadata: Json | null
          source: string
          status: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description: string
          id?: string
          metadata?: Json | null
          source: string
          status?: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string
          id?: string
          metadata?: Json | null
          source?: string
          status?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_balances: {
        Row: {
          available_balance: number
          created_at: string | null
          lifetime_withdrawn: number
          pending_balance: number
          total_earned: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_balance?: number
          created_at?: string | null
          lifetime_withdrawn?: number
          pending_balance?: number
          total_earned?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_balance?: number
          created_at?: string | null
          lifetime_withdrawn?: number
          pending_balance?: number
          total_earned?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_referral_stats: {
        Row: {
          created_at: string | null
          id: string
          invited_count: number | null
          joined_count: number | null
          qualified_count: number | null
          total_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_count?: number | null
          joined_count?: number | null
          qualified_count?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_count?: number | null
          joined_count?: number | null
          qualified_count?: number | null
          total_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referral_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_referrals: {
        Row: {
          created_at: string | null
          earnings: number | null
          id: string
          paid_at: string | null
          qualified_at: string | null
          referral_code: string | null
          referred_user_id: string | null
          referrer_user_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          earnings?: number | null
          id?: string
          paid_at?: string | null
          qualified_at?: string | null
          referral_code?: string | null
          referred_user_id?: string | null
          referrer_user_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          earnings?: number | null
          id?: string
          paid_at?: string | null
          qualified_at?: string | null
          referral_code?: string | null
          referred_user_id?: string | null
          referrer_user_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_referrals_referrer_user_id_fkey"
            columns: ["referrer_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_reputation: {
        Row: {
          beta_cohort: boolean | null
          beta_rep_cap: number | null
          cohort_joined_at: string | null
          created_at: string | null
          history: Json | null
          id: string
          level: string | null
          next_level_threshold: number | null
          prestige: number | null
          quality_metrics: Json | null
          score: number | null
          tier: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          beta_cohort?: boolean | null
          beta_rep_cap?: number | null
          cohort_joined_at?: string | null
          created_at?: string | null
          history?: Json | null
          id?: string
          level?: string | null
          next_level_threshold?: number | null
          prestige?: number | null
          quality_metrics?: Json | null
          score?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          beta_cohort?: boolean | null
          beta_rep_cap?: number | null
          cohort_joined_at?: string | null
          created_at?: string | null
          history?: Json | null
          id?: string
          level?: string | null
          next_level_threshold?: number | null
          prestige?: number | null
          quality_metrics?: Json | null
          score?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reputation_user_id_fkey"
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
        Relationships: []
      }
      user_streaks: {
        Row: {
          consecutive_days_missed: number
          created_at: string | null
          current_streak: number | null
          grace_period_started_at: string | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          milestones: Json | null
          stage_unlock_history: Json | null
          streak_started_at: string | null
          unlocked_stages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          consecutive_days_missed?: number
          created_at?: string | null
          current_streak?: number | null
          grace_period_started_at?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          milestones?: Json | null
          stage_unlock_history?: Json | null
          streak_started_at?: string | null
          unlocked_stages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          consecutive_days_missed?: number
          created_at?: string | null
          current_streak?: number | null
          grace_period_started_at?: string | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          milestones?: Json | null
          stage_unlock_history?: Json | null
          streak_started_at?: string | null
          unlocked_stages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string | null
          destination: string
          fee_amount: number | null
          id: string
          method: string
          processed_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          destination: string
          fee_amount?: number | null
          id?: string
          method: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          destination?: string
          fee_amount?: number | null
          id?: string
          method?: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_reputation: {
        Args: { points_to_add: number; reason: string; target_user_id: string }
        Returns: undefined
      }
      can_view_user_profile: {
        Args: { target_user_id: string }
        Returns: boolean
      }
      find_users_by_criteria: {
        Args: { search_criteria: Json }
        Returns: {
          profile_data: Json
          user_id: string
        }[]
      }
      get_app_secrets: { Args: { secret_key: string }; Returns: string }
      get_auth_users_with_phones: {
        Args: never
        Returns: {
          created_at: string
          email: string
          id: string
          phone: string
        }[]
      }
      get_country_iso_from_dial_code: {
        Args: { dial_code_input: string }
        Returns: string
      }
      get_public_app_secrets: {
        Args: never
        Returns: {
          environment: string
          key: string
          value: string
        }[]
      }
      get_targeting_values_by_question: {
        Args: { question_key_input: string }
        Returns: {
          count: number
          value: string
        }[]
      }
      get_team_profile: {
        Args: { user_id_input: string }
        Returns: {
          company_name: string
          company_role: string
          email: string
          first_name: string
          is_active: boolean
          last_name: string
          user_id: string
        }[]
      }
      get_user_email: { Args: { user_uuid: string }; Returns: string }
      has_role: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      has_role_or_higher: {
        Args: { required_role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      is_team_member: { Args: never; Returns: boolean }
      normalize_mobile_number: {
        Args: { mobile_input: string }
        Returns: string
      }
      reset_user_journey: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      validate_user_age: {
        Args: { date_of_birth_input: string; user_id_input: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "testing"
      app_role: "admin" | "user" | "super_admin" | "tester"
      config_data_type: "string" | "number" | "boolean" | "json"
      dependency_type: "triggers" | "requires" | "observes"
      execution_status: "success" | "failure" | "timeout" | "cancelled"
      journey_stage:
        | "fresh_signup"
        | "otp_verified"
        | "basic_profile"
        | "full_profile"
        | "first_survey"
        | "established_user"
      user_type: "looplly_user" | "client_user" | "looplly_team_user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      agent_status: ["active", "inactive", "testing"],
      app_role: ["admin", "user", "super_admin", "tester"],
      config_data_type: ["string", "number", "boolean", "json"],
      dependency_type: ["triggers", "requires", "observes"],
      execution_status: ["success", "failure", "timeout", "cancelled"],
      journey_stage: [
        "fresh_signup",
        "otp_verified",
        "basic_profile",
        "full_profile",
        "first_survey",
        "established_user",
      ],
      user_type: ["looplly_user", "client_user", "looplly_team_user"],
    },
  },
} as const

