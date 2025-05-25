export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      child_status: {
        Row: {
          id: number;
          total_stars: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          total_stars?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          total_stars?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      completed_tasks: {
        Row: {
          id: string;
          daily_record_id: string;
          task_name: string;
          stars_awarded: number;
          is_custom: boolean;
          completed_at: string;
        };
        Insert: {
          id?: string;
          daily_record_id: string;
          task_name: string;
          stars_awarded?: number;
          is_custom?: boolean;
          completed_at?: string;
        };
        Update: {
          id?: string;
          daily_record_id?: string;
          task_name?: string;
          stars_awarded?: number;
          is_custom?: boolean;
          completed_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "completed_tasks_daily_record_id_fkey";
            columns: ["daily_record_id"];
            isOneToOne: false;
            referencedRelation: "daily_records";
            referencedColumns: ["id"];
          }
        ];
      };
      daily_records: {
        Row: {
          id: string;
          date: string;
          total_stars_earned_today: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          total_stars_earned_today?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          total_stars_earned_today?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      redeemed_rewards: {
        Row: {
          id: string;
          reward_name: string;
          stars_cost: number;
          redeemed_at: string;
        };
        Insert: {
          id?: string;
          reward_name: string;
          stars_cost: number;
          redeemed_at?: string;
        };
        Update: {
          id?: string;
          reward_name?: string;
          stars_cost?: number;
          redeemed_at?: string;
        };
        Relationships: [];
      };
      rewards: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          stars_cost: number;
          icon: string | null;
          image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          stars_cost: number;
          icon?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          stars_cost?: number;
          icon?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          name: string;
          default_stars: number;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          default_stars?: number;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          default_stars?: number;
          icon?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
