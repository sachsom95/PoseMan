import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          username: string;
          avatar_url: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          username: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          is_premium?: boolean;
        };
      };
      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          mode: 'classic' | 'fitness' | 'battle';
          score: number;
          words_completed: number | null;
          exercises_completed: number | null;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          user_id: string;
          mode: 'classic' | 'fitness' | 'battle';
          score?: number;
          words_completed?: number | null;
          exercises_completed?: number | null;
        };
        Update: {
          score?: number;
          words_completed?: number | null;
          exercises_completed?: number | null;
          ended_at?: string;
        };
      };
      user_stats: {
        Row: {
          user_id: string;
          total_games: number;
          total_score: number;
          words_guessed: number;
          exercises_completed: number;
          battles_won: number;
          battles_played: number;
          current_streak: number;
          longest_streak: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
        };
        Update: {
          total_games?: number;
          total_score?: number;
          words_guessed?: number;
          exercises_completed?: number;
          battles_won?: number;
          battles_played?: number;
          current_streak?: number;
          longest_streak?: number;
        };
      };
      battles: {
        Row: {
          id: string;
          status: 'waiting' | 'matched' | 'countdown' | 'active' | 'finished';
          player1_id: string;
          player2_id: string | null;
          player1_score: number;
          player2_score: number;
          winner_id: string | null;
          current_challenge: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          player1_id: string;
          status?: 'waiting';
        };
        Update: {
          status?: 'waiting' | 'matched' | 'countdown' | 'active' | 'finished';
          player2_id?: string;
          player1_score?: number;
          player2_score?: number;
          winner_id?: string;
          current_challenge?: string;
        };
      };
    };
  };
}
