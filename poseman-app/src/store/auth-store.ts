import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type { UserProfile, UserStats } from '@/types';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  stats: UserStats | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshStats: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      profile: null,
      stats: null,
      isLoading: true,
      isInitialized: false,

      initialize: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({ user: session.user, session });

            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Fetch stats
            const { data: stats } = await supabase
              .from('user_stats')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            set({
              profile: profile ? {
                id: profile.id,
                email: profile.email,
                username: profile.username,
                avatarUrl: profile.avatar_url,
                isPremium: profile.is_premium,
                createdAt: new Date(profile.created_at),
              } : null,
              stats: stats ? {
                totalGames: stats.total_games,
                totalScore: stats.total_score,
                wordsGuessed: stats.words_guessed,
                exercisesCompleted: stats.exercises_completed,
                battlesWon: stats.battles_won,
                battlesPlayed: stats.battles_played,
                currentStreak: stats.current_streak,
                longestStreak: stats.longest_streak,
              } : null,
            });
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            set({ user: session?.user ?? null, session });

            if (event === 'SIGNED_OUT') {
              set({ profile: null, stats: null });
            }
          });

          set({ isLoading: false, isInitialized: true });
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false, isInitialized: true });
        }
      },

      signUp: async (email, password, username) => {
        try {
          set({ isLoading: true });

          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            // Create profile
            await supabase.from('profiles').insert({
              id: data.user.id,
              email,
              username,
            });

            // Create initial stats
            await supabase.from('user_stats').insert({
              user_id: data.user.id,
            });
          }

          set({ isLoading: false });
          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error: error as Error };
        }
      },

      signIn: async (email, password) => {
        try {
          set({ isLoading: true });

          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          // Re-initialize to fetch profile and stats
          await get().initialize();

          return { error: null };
        } catch (error) {
          set({ isLoading: false });
          return { error: error as Error };
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null, profile: null, stats: null });
      },

      updateProfile: async (updates) => {
        const { user, profile } = get();
        if (!user || !profile) return;

        const dbUpdates: Record<string, unknown> = {};
        if (updates.username) dbUpdates.username = updates.username;
        if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;

        await supabase
          .from('profiles')
          .update(dbUpdates)
          .eq('id', user.id);

        set({
          profile: { ...profile, ...updates },
        });
      },

      refreshStats: async () => {
        const { user } = get();
        if (!user) return;

        const { data: stats } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (stats) {
          set({
            stats: {
              totalGames: stats.total_games,
              totalScore: stats.total_score,
              wordsGuessed: stats.words_guessed,
              exercisesCompleted: stats.exercises_completed,
              battlesWon: stats.battles_won,
              battlesPlayed: stats.battles_played,
              currentStreak: stats.current_streak,
              longestStreak: stats.longest_streak,
            },
          });
        }
      },
    }),
    {
      name: 'poseman-auth',
      partialize: (state) => ({
        // Don't persist sensitive data
      }),
    }
  )
);
