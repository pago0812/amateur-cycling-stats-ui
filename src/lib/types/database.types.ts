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
      cyclist_genders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      cyclists: {
        Row: {
          born_year: number | null
          created_at: string
          gender_id: string | null
          id: string
          last_name: string
          name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          born_year?: number | null
          created_at?: string
          gender_id?: string | null
          id?: string
          last_name?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          born_year?: number | null
          created_at?: string
          gender_id?: string | null
          id?: string
          last_name?: string
          name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cyclists_gender_id_fkey"
            columns: ["gender_id"]
            isOneToOne: false
            referencedRelation: "cyclist_genders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cyclists_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_supported_categories: {
        Row: {
          event_id: string
          race_category_id: string
        }
        Insert: {
          event_id: string
          race_category_id: string
        }
        Update: {
          event_id?: string
          race_category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_supported_categories_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_supported_categories_race_category_id_fkey"
            columns: ["race_category_id"]
            isOneToOne: false
            referencedRelation: "race_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      event_supported_genders: {
        Row: {
          event_id: string
          race_category_gender_id: string
        }
        Insert: {
          event_id: string
          race_category_gender_id: string
        }
        Update: {
          event_id?: string
          race_category_gender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_supported_genders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_supported_genders_race_category_gender_id_fkey"
            columns: ["race_category_gender_id"]
            isOneToOne: false
            referencedRelation: "race_category_genders"
            referencedColumns: ["id"]
          },
        ]
      }
      event_supported_lengths: {
        Row: {
          event_id: string
          race_category_length_id: string
        }
        Insert: {
          event_id: string
          race_category_length_id: string
        }
        Update: {
          event_id?: string
          race_category_length_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_supported_lengths_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_supported_lengths_race_category_length_id_fkey"
            columns: ["race_category_length_id"]
            isOneToOne: false
            referencedRelation: "race_category_lengths"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          country: string
          created_at: string
          created_by: string
          date_time: string
          description: string | null
          event_status: string
          id: string
          is_public_visible: boolean
          name: string
          organization_id: string | null
          state: string
          updated_at: string
          year: number
        }
        Insert: {
          city?: string | null
          country: string
          created_at?: string
          created_by: string
          date_time: string
          description?: string | null
          event_status?: string
          id?: string
          is_public_visible?: boolean
          name: string
          organization_id?: string | null
          state: string
          updated_at?: string
          year: number
        }
        Update: {
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string
          date_time?: string
          description?: string | null
          event_status?: string
          id?: string
          is_public_visible?: boolean
          name?: string
          organization_id?: string | null
          state?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizers: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organizers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organizers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      race_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      race_category_genders: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      race_category_lengths: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      race_rankings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      race_results: {
        Row: {
          created_at: string
          cyclist_id: string
          id: string
          place: number
          race_id: string
          ranking_point_id: string | null
          time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cyclist_id: string
          id?: string
          place: number
          race_id: string
          ranking_point_id?: string | null
          time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cyclist_id?: string
          id?: string
          place?: number
          race_id?: string
          ranking_point_id?: string | null
          time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_results_cyclist_id_fkey"
            columns: ["cyclist_id"]
            isOneToOne: false
            referencedRelation: "cyclists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "race_results_ranking_point_id_fkey"
            columns: ["ranking_point_id"]
            isOneToOne: false
            referencedRelation: "ranking_points"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          created_at: string
          date_time: string
          description: string | null
          event_id: string
          id: string
          is_public_visible: boolean
          name: string | null
          race_category_gender_id: string
          race_category_id: string
          race_category_length_id: string
          race_ranking_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_time: string
          description?: string | null
          event_id: string
          id?: string
          is_public_visible?: boolean
          name?: string | null
          race_category_gender_id: string
          race_category_id: string
          race_category_length_id: string
          race_ranking_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_time?: string
          description?: string | null
          event_id?: string
          id?: string
          is_public_visible?: boolean
          name?: string | null
          race_category_gender_id?: string
          race_category_id?: string
          race_category_length_id?: string
          race_ranking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "races_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "races_race_category_gender_id_fkey"
            columns: ["race_category_gender_id"]
            isOneToOne: false
            referencedRelation: "race_category_genders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "races_race_category_id_fkey"
            columns: ["race_category_id"]
            isOneToOne: false
            referencedRelation: "race_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "races_race_category_length_id_fkey"
            columns: ["race_category_length_id"]
            isOneToOne: false
            referencedRelation: "race_category_lengths"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "races_race_ranking_id_fkey"
            columns: ["race_ranking_id"]
            isOneToOne: false
            referencedRelation: "race_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_points: {
        Row: {
          created_at: string
          id: string
          place: number
          points: number
          race_ranking_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          place: number
          points: number
          race_ranking_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          place?: number
          points?: number
          race_ranking_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ranking_points_race_ranking_id_fkey"
            columns: ["race_ranking_id"]
            isOneToOne: false
            referencedRelation: "race_rankings"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: string
          role_id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          id: string
          role_id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          role_id?: string
          updated_at?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      has_role: { Args: { role_type: string }; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_admin_check: { Args: never; Returns: boolean }
      is_in_event_organization: { Args: { event_id: string }; Returns: boolean }
      is_organizer: { Args: never; Returns: boolean }
      is_organizer_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
