-- PoseMan Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- USER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  total_games INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  words_guessed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  battles_won INTEGER DEFAULT 0,
  battles_played INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_played_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
  ON public.user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats"
  ON public.user_stats FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('classic', 'fitness', 'battle')),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  score INTEGER DEFAULT 0,
  words_completed INTEGER,
  exercises_completed INTEGER,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER
);

-- Enable RLS
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own sessions"
  ON public.game_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.game_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.game_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for leaderboards
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON public.game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_mode ON public.game_sessions(user_id, mode);

-- ============================================
-- BATTLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.battles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'matched', 'countdown', 'active', 'finished')),
  player1_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player2_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  player1_score INTEGER DEFAULT 0,
  player2_score INTEGER DEFAULT 0,
  winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  current_challenge TEXT,
  challenge_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.battles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view battles they're in"
  ON public.battles FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id OR status = 'waiting');

CREATE POLICY "Users can create battles"
  ON public.battles FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Users can update battles they're in"
  ON public.battles FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime for battles
ALTER PUBLICATION supabase_realtime ADD TABLE public.battles;

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id,
  p.username,
  p.avatar_url,
  p.is_premium,
  COALESCE(s.total_score, 0) as total_score,
  COALESCE(s.total_games, 0) as total_games,
  COALESCE(s.battles_won, 0) as battles_won,
  COALESCE(s.longest_streak, 0) as longest_streak,
  RANK() OVER (ORDER BY COALESCE(s.total_score, 0) DESC) as rank
FROM public.profiles p
LEFT JOIN public.user_stats s ON p.id = s.user_id
ORDER BY total_score DESC
LIMIT 100;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update user stats after a game
CREATE OR REPLACE FUNCTION public.update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user stats
  INSERT INTO public.user_stats (user_id, total_games, total_score, words_guessed, exercises_completed, last_played_at)
  VALUES (
    NEW.user_id,
    1,
    NEW.score,
    COALESCE(NEW.words_completed, 0),
    COALESCE(NEW.exercises_completed, 0),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_games = user_stats.total_games + 1,
    total_score = user_stats.total_score + EXCLUDED.total_score,
    words_guessed = user_stats.words_guessed + EXCLUDED.words_guessed,
    exercises_completed = user_stats.exercises_completed + EXCLUDED.exercises_completed,
    last_played_at = NOW(),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats when a game ends
CREATE TRIGGER on_game_session_ended
  AFTER UPDATE OF ended_at ON public.game_sessions
  FOR EACH ROW
  WHEN (OLD.ended_at IS NULL AND NEW.ended_at IS NOT NULL)
  EXECUTE FUNCTION public.update_user_stats_after_game();

-- Function to update battle stats
CREATE OR REPLACE FUNCTION public.update_battle_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update winner stats
  IF NEW.winner_id IS NOT NULL THEN
    UPDATE public.user_stats
    SET
      battles_won = battles_won + 1,
      battles_played = battles_played + 1,
      updated_at = NOW()
    WHERE user_id = NEW.winner_id;

    -- Update loser stats
    UPDATE public.user_stats
    SET
      battles_played = battles_played + 1,
      updated_at = NOW()
    WHERE user_id IN (NEW.player1_id, NEW.player2_id)
      AND user_id != NEW.winner_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update battle stats when battle finishes
CREATE TRIGGER on_battle_finished
  AFTER UPDATE OF status ON public.battles
  FOR EACH ROW
  WHEN (OLD.status != 'finished' AND NEW.status = 'finished')
  EXECUTE FUNCTION public.update_battle_stats();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1))
  );

  -- Create initial stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STREAK MANAGEMENT
-- ============================================

-- Function to update streak
CREATE OR REPLACE FUNCTION public.update_streak(p_user_id UUID)
RETURNS void AS $$
DECLARE
  last_played DATE;
  current_date_val DATE := CURRENT_DATE;
BEGIN
  SELECT DATE(last_played_at) INTO last_played
  FROM public.user_stats
  WHERE user_id = p_user_id;

  IF last_played IS NULL OR last_played < current_date_val - INTERVAL '1 day' THEN
    -- Reset streak
    UPDATE public.user_stats
    SET current_streak = 1
    WHERE user_id = p_user_id;
  ELSIF last_played = current_date_val - INTERVAL '1 day' THEN
    -- Increment streak
    UPDATE public.user_stats
    SET
      current_streak = current_streak + 1,
      longest_streak = GREATEST(longest_streak, current_streak + 1)
    WHERE user_id = p_user_id;
  END IF;
  -- If last_played = current_date, do nothing (already played today)
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
