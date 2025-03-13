export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      answer_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          option_text: string
          order_number: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          option_text: string
          order_number: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          option_text?: string
          order_number?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answer_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          candidate_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_templates: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          ai_feedback: string | null
          candidate_id: string
          completion_time: string | null
          created_at: string
          created_by: string
          id: string
          overall_score: number | null
          start_time: string | null
          status: string
          strengths: string[] | null
          template_id: string
          updated_at: string
          weaknesses: string[] | null
        }
        Insert: {
          ai_feedback?: string | null
          candidate_id: string
          completion_time?: string | null
          created_at?: string
          created_by: string
          id?: string
          overall_score?: number | null
          start_time?: string | null
          status?: string
          strengths?: string[] | null
          template_id: string
          updated_at?: string
          weaknesses?: string[] | null
        }
        Update: {
          ai_feedback?: string | null
          candidate_id?: string
          completion_time?: string | null
          created_at?: string
          created_by?: string
          id?: string
          overall_score?: number | null
          start_time?: string | null
          status?: string
          strengths?: string[] | null
          template_id?: string
          updated_at?: string
          weaknesses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_assessments: {
        Row: {
          assessment_id: string
          candidate_id: string
          created_at: string
          id: string
          status: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          candidate_id: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          candidate_id?: string
          created_at?: string
          id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widget_settings: {
        Row: {
          allowed_roles: string[]
          description: string | null
          id: string
          is_visible: boolean
          order_number: number
          widget_key: string
          widget_name: string
          widget_type: string
        }
        Insert: {
          allowed_roles: string[]
          description?: string | null
          id?: string
          is_visible?: boolean
          order_number: number
          widget_key: string
          widget_name: string
          widget_type: string
        }
        Update: {
          allowed_roles?: string[]
          description?: string | null
          id?: string
          is_visible?: boolean
          order_number?: number
          widget_key?: string
          widget_name?: string
          widget_type?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          created_at: string
          created_by: string
          description: string
          id: string
          location: string | null
          requirements: string | null
          salary_range: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description: string
          id?: string
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          location?: string | null
          requirements?: string | null
          salary_range?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      manager_approvals: {
        Row: {
          approved_by: string | null
          created_at: string
          id: string
          manager_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          id?: string
          manager_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          id?: string
          manager_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_approvals_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manager_approvals_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_access_rules: {
        Row: {
          allowed_roles: string[]
          created_at: string
          id: string
          is_enabled: boolean
          page_name: string
          page_path: string
          updated_at: string
        }
        Insert: {
          allowed_roles: string[]
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_name: string
          page_path: string
          updated_at?: string
        }
        Update: {
          allowed_roles?: string[]
          created_at?: string
          id?: string
          is_enabled?: boolean
          page_name?: string
          page_path?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          position: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          assessment_template_id: string
          created_at: string
          evaluation_criteria: Json | null
          id: string
          order_number: number
          question_text: string
          question_type: string
          updated_at: string
        }
        Insert: {
          assessment_template_id: string
          created_at?: string
          evaluation_criteria?: Json | null
          id?: string
          order_number: number
          question_text: string
          question_type: string
          updated_at?: string
        }
        Update: {
          assessment_template_id?: string
          created_at?: string
          evaluation_criteria?: Json | null
          id?: string
          order_number?: number
          question_text?: string
          question_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_template_id_fkey"
            columns: ["assessment_template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          ai_feedback: string | null
          assessment_id: string
          created_at: string
          id: string
          question_id: string
          score: number | null
          selected_option_id: string | null
          text_response: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ai_feedback?: string | null
          assessment_id: string
          created_at?: string
          id?: string
          question_id: string
          score?: number | null
          selected_option_id?: string | null
          text_response?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ai_feedback?: string | null
          assessment_id?: string
          created_at?: string
          id?: string
          question_id?: string
          score?: number | null
          selected_option_id?: string | null
          text_response?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "answer_options"
            referencedColumns: ["id"]
          },
        ]
      }
      salesperson_managers: {
        Row: {
          created_at: string
          id: string
          manager_id: string
          salesperson_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          manager_id: string
          salesperson_id: string
        }
        Update: {
          created_at?: string
          id?: string
          manager_id?: string
          salesperson_id?: string
        }
        Relationships: []
      }
      shop_visits: {
        Row: {
          audio_url: string | null
          created_at: string
          id: string
          location: Json
          notes: string | null
          salesperson_id: string
          shop_name: string
          status: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          id?: string
          location: Json
          notes?: string | null
          salesperson_id: string
          shop_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          id?: string
          location?: Json
          notes?: string | null
          salesperson_id?: string
          shop_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      training_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          last_position: number
          last_updated_at: string | null
          quiz_completed: boolean
          quiz_score: number | null
          user_id: string
          video_id: string
          watched_percentage: number
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          last_position?: number
          last_updated_at?: string | null
          quiz_completed?: boolean
          quiz_score?: number | null
          user_id: string
          video_id: string
          watched_percentage?: number
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          last_position?: number
          last_updated_at?: string | null
          quiz_completed?: boolean
          quiz_score?: number | null
          user_id?: string
          video_id?: string
          watched_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_options: {
        Row: {
          id: string
          is_correct: boolean
          option_text: string
          order_number: number
          question_id: string
        }
        Insert: {
          id?: string
          is_correct?: boolean
          option_text: string
          order_number: number
          question_id: string
        }
        Update: {
          id?: string
          is_correct?: boolean
          option_text?: string
          order_number?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "training_quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_questions: {
        Row: {
          created_at: string
          id: string
          question: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_questions_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_quiz_results: {
        Row: {
          created_at: string
          id: string
          score: number
          total_questions: number
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_quiz_results_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_video_progress: {
        Row: {
          created_at: string
          id: string
          last_position: number
          progress_percentage: number
          updated_at: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_position?: number
          progress_percentage?: number
          updated_at?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_position?: number
          progress_percentage?: number
          updated_at?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_video_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "training_videos"
            referencedColumns: ["id"]
          },
        ]
      }
      training_videos: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          has_quiz: boolean | null
          id: string
          thumbnail_url: string | null
          title: string
          video_url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          has_quiz?: boolean | null
          id?: string
          thumbnail_url?: string | null
          title: string
          video_url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          has_quiz?: boolean | null
          id?: string
          thumbnail_url?: string | null
          title?: string
          video_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "candidate" | "manager" | "admin" | "salesperson"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
