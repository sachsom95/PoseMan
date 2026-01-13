import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { BattleStatus, BattlePlayer } from '@/types';
import { getRandomChallenge } from '@/lib/game-data';

interface BattleState {
  battleId: string | null;
  status: BattleStatus;
  players: BattlePlayer[];
  myScore: number;
  opponentScore: number;
  currentChallenge: string | null;
  challengeIndex: number;
  totalChallenges: number;
  timeRemaining: number;
  winnerId: string | null;
  isSearching: boolean;

  // Actions
  searchForMatch: (userId: string) => Promise<void>;
  cancelSearch: () => void;
  joinBattle: (battleId: string, userId: string) => Promise<void>;
  setReady: () => void;
  submitScore: (points: number) => void;
  nextChallenge: () => void;
  endBattle: () => void;
  leaveBattle: () => void;
  updateTimer: (time: number) => void;

  // Real-time subscription
  subscribeToMatch: (battleId: string) => void;
  unsubscribe: () => void;
}

let realtimeSubscription: ReturnType<typeof supabase.channel> | null = null;

export const useBattleStore = create<BattleState>((set, get) => ({
  battleId: null,
  status: 'waiting',
  players: [],
  myScore: 0,
  opponentScore: 0,
  currentChallenge: null,
  challengeIndex: 0,
  totalChallenges: 5,
  timeRemaining: 0,
  winnerId: null,
  isSearching: false,

  searchForMatch: async (userId) => {
    set({ isSearching: true });

    try {
      // First, look for an existing waiting battle
      const { data: existingBattle } = await supabase
        .from('battles')
        .select('*')
        .eq('status', 'waiting')
        .neq('player1_id', userId)
        .limit(1)
        .single();

      if (existingBattle) {
        // Join existing battle
        await get().joinBattle(existingBattle.id, userId);
      } else {
        // Create new battle
        const { data: newBattle, error } = await supabase
          .from('battles')
          .insert({
            player1_id: userId,
            status: 'waiting',
          })
          .select()
          .single();

        if (error) throw error;

        set({
          battleId: newBattle.id,
          status: 'waiting',
          players: [{
            id: userId,
            username: 'You',
            score: 0,
            isReady: false,
          }],
        });

        // Subscribe to real-time updates
        get().subscribeToMatch(newBattle.id);
      }
    } catch (error) {
      console.error('Error searching for match:', error);
      set({ isSearching: false });
    }
  },

  cancelSearch: () => {
    const { battleId } = get();

    if (battleId) {
      supabase.from('battles').delete().eq('id', battleId);
    }

    get().unsubscribe();
    set({
      battleId: null,
      status: 'waiting',
      players: [],
      isSearching: false,
    });
  },

  joinBattle: async (battleId, userId) => {
    try {
      // Update battle with player2
      await supabase
        .from('battles')
        .update({
          player2_id: userId,
          status: 'matched',
        })
        .eq('id', battleId);

      set({
        battleId,
        status: 'matched',
        isSearching: false,
      });

      // Subscribe to real-time updates
      get().subscribeToMatch(battleId);
    } catch (error) {
      console.error('Error joining battle:', error);
    }
  },

  setReady: () => {
    const { players } = get();
    const updatedPlayers = players.map(p => ({ ...p, isReady: true }));
    set({ players: updatedPlayers });
  },

  submitScore: (points) => {
    const { myScore } = get();
    const newScore = myScore + points;

    set({ myScore: newScore });

    // Update score in database
    const { battleId } = get();
    if (battleId) {
      supabase
        .from('battles')
        .update({ player1_score: newScore })
        .eq('id', battleId);
    }
  },

  nextChallenge: () => {
    const { challengeIndex, totalChallenges } = get();

    if (challengeIndex >= totalChallenges - 1) {
      get().endBattle();
      return;
    }

    set({
      currentChallenge: getRandomChallenge(),
      challengeIndex: challengeIndex + 1,
      timeRemaining: 15,
    });
  },

  endBattle: () => {
    const { myScore, opponentScore, players } = get();
    let winnerId = null;

    if (myScore > opponentScore) {
      winnerId = players[0]?.id || null;
    } else if (opponentScore > myScore) {
      winnerId = players[1]?.id || null;
    }

    set({
      status: 'finished',
      winnerId,
    });
  },

  leaveBattle: () => {
    get().unsubscribe();
    set({
      battleId: null,
      status: 'waiting',
      players: [],
      myScore: 0,
      opponentScore: 0,
      currentChallenge: null,
      challengeIndex: 0,
      timeRemaining: 0,
      winnerId: null,
      isSearching: false,
    });
  },

  updateTimer: (time) => {
    set({ timeRemaining: time });
    if (time <= 0) {
      get().nextChallenge();
    }
  },

  subscribeToMatch: (battleId) => {
    get().unsubscribe();

    realtimeSubscription = supabase
      .channel(`battle:${battleId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'battles',
          filter: `id=eq.${battleId}`,
        },
        (payload) => {
          const battle = payload.new as Record<string, unknown>;

          set({
            status: battle.status as BattleStatus,
            opponentScore: (battle.player2_score as number) || 0,
            currentChallenge: battle.current_challenge as string | null,
          });

          if (battle.status === 'matched') {
            set({ isSearching: false });
          }

          if (battle.status === 'active' && !get().currentChallenge) {
            set({
              currentChallenge: getRandomChallenge(),
              timeRemaining: 15,
            });
          }
        }
      )
      .subscribe();
  },

  unsubscribe: () => {
    if (realtimeSubscription) {
      supabase.removeChannel(realtimeSubscription);
      realtimeSubscription = null;
    }
  },
}));
