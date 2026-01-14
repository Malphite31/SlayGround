import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Student {
    id: string;
    name: string;
    score: number;
    currentStage: number;
    hasAnswered: boolean;
}

type QuestionType = 'multiple-choice' | 'fill-blank' | 'true-false' | 'short-answer';

interface Problem {
    question: string;
    answer: string;
    type: QuestionType;
    choices?: string[]; // For multiple choice and true/false
    blanks?: string[]; // For fill in the blank (multiple blanks)
    stage: number;
    move?: string; // Optional dance move unlocked
    songPart?: string; // Optional song part unlocked
}

interface Quest {
    id: string;
    title: string;
    description: string;
    problems: Problem[];
    musicUrl?: string; // YouTube video URL for final performance
    timerDuration?: number; // Custom timer duration in seconds (default 30)
    createdAt: number;
    updatedAt: number;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'finished';

interface GameState {
    gamePin: string | null;
    status: GameStatus;
    isActive: boolean; // Deprecated in favor of status, but kept for compatibility for now
    currentStage: number;
    totalStages: number;
    students: Student[];
    currentQuest: Quest | null;
    quests: Quest[];
    timeRemaining: number;
    timerDuration: number;
    syncInterval: any;

    // Actions
    createGame: (questId: string, timerDuration?: number) => Promise<void>;
    startGame: () => void;
    pauseGame: () => void;
    finishGame: () => void; // Explicitly finish game
    joinGame: (pin: string, name: string) => Promise<{ success: boolean; error?: string; studentId?: string }>;
    markStudentAnswered: (studentId: string, isCorrect: boolean) => Promise<void>;
    updateStudentProgress: (studentId: string, stage: number, score: number) => void;
    nextStage: () => Promise<void>;
    endGame: () => void;
    loadQuests: () => Promise<void>;
    addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateQuest: (questId: string, quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    deleteQuest: (questId: string) => Promise<void>;
    removeBots: () => void;
    setTimeRemaining: (time: number) => void;
    resetTimer: () => void;
    startSync: () => void;
    stopSync: () => void;
    syncGameState: () => Promise<void>;
    validateGamePin: () => Promise<boolean>;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            gamePin: null,
            status: 'idle',
            isActive: false,
            currentStage: 0,
            totalStages: 5,
            students: [],
            currentQuest: null,
            quests: [],
            timeRemaining: 30,
            timerDuration: 30,
            syncInterval: null,

            createGame: async (questId, timerDuration) => {
                const quest = get().quests.find(q => q.id === questId);
                if (!quest) return;

                // FIRST: Stop any existing sync and completely clear old game state
                get().stopSync();

                // Clear ALL old game state immediately to prevent any persistence issues
                set({
                    gamePin: null,
                    currentQuest: null,
                    status: 'idle',
                    isActive: false,
                    currentStage: 0,
                    totalStages: 0,
                    students: [],
                    timeRemaining: 30,
                });

                // Use quest's custom timer duration or default to 30 seconds
                const duration = quest.timerDuration || timerDuration || 30;

                // Generate random 4-digit PIN
                const pin = Math.floor(1000 + Math.random() * 9000).toString();

                // Call API and wait for response
                try {
                    const res = await fetch('/api/game/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            questId,
                            pin,
                            totalStages: quest.problems.length
                        })
                    });

                    if (!res.ok) {
                        const err = await res.json() as any;
                        alert(`Failed to create game: ${err.error || 'Unknown error'}`);
                        return;
                    }

                    // Wait a moment for the database to commit
                    await new Promise(resolve => setTimeout(resolve, 200));

                } catch (e) {
                    console.error("Failed to create game on server", e);
                    alert("Network error: Could not reach game server.");
                    return;
                }

                // Set NEW game state
                set({
                    gamePin: pin,
                    currentQuest: quest,
                    status: 'idle',
                    isActive: false,
                    currentStage: 1,
                    totalStages: quest.problems.length,
                    students: [],
                    timerDuration: duration,
                    timeRemaining: duration,
                });

                console.log('[CreateGame] New game created:', { pin, status: 'idle', currentStage: 1 });

                // Start sync to get fresh data from server
                get().startSync();
            },

            joinGame: async (pin, name) => {
                const studentId = crypto.randomUUID();

                try {
                    const res = await fetch('/api/student/join', {
                        method: 'POST',
                        body: JSON.stringify({ pin, name, studentId })
                    });
                    const data = await res.json();

                    if (!data.success) {
                        return { success: false, error: data.error };
                    }

                    // Optimistic update locally? 
                    // No, wait for poll or just set basic info
                    // Set gamePin locally so sync works
                    set({ gamePin: pin });

                    return { success: true, studentId };
                } catch (e) {
                    return { success: false, error: 'Network error' };
                }
            },

            startGame: async () => {
                const pin = get().gamePin;
                if (pin) {
                    // Update server status
                    fetch('/api/game/update', {
                        method: 'POST',
                        body: JSON.stringify({ action: 'start_game', pin })
                    }).catch(console.error);
                }
                set({ status: 'playing', isActive: true });
            },
            pauseGame: () => set({ status: 'paused', isActive: false }),

            finishGame: async () => {
                const pin = get().gamePin;
                if (pin) {
                    fetch('/api/game/update', {
                        method: 'POST',
                        body: JSON.stringify({ action: 'finish_game', pin })
                    }).catch(console.error);
                }
                set({ status: 'finished', isActive: false });
            },


            markStudentAnswered: async (studentId, isCorrect) => {
                const stage = get().currentStage;
                // Optimistic Update
                set((state) => ({
                    students: state.students.map((student) =>
                        student.id === studentId
                            ? {
                                ...student,
                                hasAnswered: true,
                                score: isCorrect ? student.score + 100 : student.score
                            }
                            : student
                    ),
                }));

                // API Call
                fetch('/api/student/answer', {
                    method: 'POST',
                    body: JSON.stringify({ studentId, isCorrect, stage })
                }).catch(console.error);
            },

            updateStudentProgress: (studentId, stage, score) => set((state) => ({
                students: state.students.map((student) =>
                    student.id === studentId
                        ? { ...student, currentStage: stage, score }
                        : student
                ),
            })),

            nextStage: async () => {
                const state = get();
                const nextStageNum = state.currentStage + 1;
                const pin = state.gamePin;

                // If advancing would exceed total stages, finish the game
                if (nextStageNum > state.totalStages) {
                    await get().finishGame();
                    return;
                }

                // Otherwise, advance to next stage
                if (pin) {
                    fetch('/api/game/update', {
                        method: 'POST',
                        body: JSON.stringify({ action: 'next_stage', pin, stage: nextStageNum })
                    }).catch(console.error);
                }

                set({
                    currentStage: nextStageNum,
                    timeRemaining: state.timerDuration,
                    students: state.students.map(s => ({ ...s, hasAnswered: false })),
                });
            },

            syncGameState: async () => {
                const pin = get().gamePin;
                if (!pin) {
                    console.log('[Sync] No PIN, skipping');
                    return;
                }

                try {
                    // console.log(`[Sync] Fetching /api/game/${pin}`); // Reduce noise
                    const res = await fetch(`/api/game/${pin}`);
                    if (!res.ok) {
                        return;
                    }
                    const data = await res.json();

                    // Merge Server State
                    const { status, current_stage, total_stages, quest_id } = data;

                    set(() => ({
                        status: status || 'idle',
                        currentStage: current_stage || 1,
                        totalStages: total_stages || 0,
                        // Use server source of truth for students
                        students: data.students.map((s: any) => ({
                            id: s.id,
                            name: s.name,
                            score: s.score || 0,
                            hasAnswered: s.hasAnswered || !!s.has_answered,
                            currentStage: s.currentStage || s.current_stage || 1
                        })),
                    }));

                    // Fetch Quest if missing or different
                    const currentQuest = get().currentQuest;
                    if (quest_id && (!currentQuest || currentQuest.id !== quest_id)) {
                        console.log('[Sync] Fetching quest details for', quest_id);
                        try {
                            const questRes = await fetch(`/api/quest/${quest_id}`);
                            if (questRes.ok) {
                                const questData = await questRes.json();
                                set({ currentQuest: questData });
                            }
                        } catch (qe) {
                            console.error('[Sync] Failed to fetch quest', qe);
                        }
                    }
                } catch (e) {
                    console.error('[Sync] Error:', e);
                }
            },

            startSync: () => {
                if (get().syncInterval) {
                    // Clear existing interval just in case it's a stale ID from hydration
                    clearInterval(get().syncInterval);
                }

                console.log('[Sync] Starting sync...');

                // Call immediately
                get().syncGameState();

                // Then poll every 2s
                const interval = setInterval(() => {
                    get().syncGameState();
                }, 2000);

                set({ syncInterval: interval });
            },

            stopSync: () => {
                const interval = get().syncInterval;
                if (interval) clearInterval(interval);
                set({ syncInterval: null });
            },

            endGame: () => {
                get().stopSync();
                set({
                    status: 'idle',
                    isActive: false,
                    gamePin: null,
                    currentStage: 0,
                    students: [],
                    currentQuest: null,
                    timeRemaining: 30,
                });
            },

            loadQuests: async () => {
                try {
                    const res = await fetch('/api/quest/list');
                    if (!res.ok) return;
                    const quests = await res.json();
                    set({ quests });
                } catch (e) {
                    console.error('Failed to load quests', e);
                }
            },

            addQuest: async (quest) => {
                try {
                    const res = await fetch('/api/quest/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(quest)
                    });
                    if (!res.ok) {
                        alert('Failed to create quest');
                        return;
                    }
                    await get().loadQuests();
                } catch (e) {
                    console.error('Failed to create quest', e);
                    alert('Network error');
                }
            },

            updateQuest: async (questId, quest) => {
                try {
                    const res = await fetch('/api/quest/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: questId, ...quest })
                    });
                    if (!res.ok) {
                        alert('Failed to update quest');
                        return;
                    }
                    await get().loadQuests();
                } catch (e) {
                    console.error('Failed to update quest', e);
                    alert('Network error');
                }
            },

            deleteQuest: async (questId) => {
                try {
                    const res = await fetch('/api/quest/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: questId })
                    });
                    if (!res.ok) {
                        const err = await res.json();
                        alert(err.error || 'Failed to delete quest');
                        return;
                    }
                    await get().loadQuests();
                } catch (e) {
                    console.error('Failed to delete quest', e);
                    alert('Network error');
                }
            },

            removeBots: () => set((state) => ({
                students: state.students.filter(s => !s.name.startsWith('Bot '))
            })),

            setTimeRemaining: (time) => set({ timeRemaining: time }),
            resetTimer: () => set((state) => ({ timeRemaining: state.timerDuration })),

            validateGamePin: async () => {
                const pin = get().gamePin;
                if (!pin) {
                    console.log('[Validate] No PIN to validate');
                    return true; // No PIN is valid (idle state)
                }

                try {
                    console.log('[Validate] Checking if PIN', pin, 'exists on server');
                    const res = await fetch(`/api/game/${pin}`);

                    if (!res.ok) {
                        console.log('[Validate] PIN', pin, 'not found on server, clearing state');
                        // Game doesn't exist on server, clear local state
                        get().endGame();
                        return false;
                    }

                    console.log('[Validate] PIN', pin, 'is valid');
                    return true;
                } catch (e) {
                    console.error('[Validate] Error validating PIN:', e);
                    // On network error, keep the state for now
                    return true;
                }
            },
        }),
        {
            name: 'slayground-storage',
            partialize: (state) => {
                const { status, syncInterval, ...rest } = state;

                // Don't persist gamePin and currentQuest if:
                // - Game is finished
                // - Game is currently playing (to prevent stale active games)
                // - Game is idle with no students
                const shouldClearGame = state.status === 'finished' ||
                    state.status === 'playing' ||
                    (state.status === 'idle' && state.students.length === 0);

                return {
                    ...rest,
                    syncInterval: null, // Do not persist interval ID
                    gamePin: shouldClearGame ? null : state.gamePin,
                    currentQuest: shouldClearGame ? null : state.currentQuest,
                    students: shouldClearGame ? [] : state.students,
                    currentStage: shouldClearGame ? 0 : state.currentStage,
                    // Do not persist status - always start fresh and sync from server
                };
            },
        }
    )
);
