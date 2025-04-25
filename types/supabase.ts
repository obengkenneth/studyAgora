export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          email: string
          role: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email: string
          role?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          email?: string
          role?: string | null
        }
      }
      sessions: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          facilitator_id: string
          is_live: boolean
          video_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          facilitator_id: string
          is_live: boolean
          video_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          facilitator_id?: string
          is_live?: boolean
          video_url?: string | null
        }
      }
      resources: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          url: string
          type: string
          uploaded_by: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          url: string
          type: string
          uploaded_by: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          url?: string
          type?: string
          uploaded_by?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
