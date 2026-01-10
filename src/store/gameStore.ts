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
    isQRVisible: boolean;
    syncInterval: any;

    // Actions
    createGame: (questId: string, timerDuration?: number) => Promise<void>;
    startGame: () => void;
    pauseGame: () => void;
    finishGame: () => void; // Explicitly finish game
    toggleQR: (visible: boolean) => void;
    joinGame: (pin: string, name: string) => Promise<{ success: boolean; error?: string }>;
    markStudentAnswered: (studentId: string, isCorrect: boolean) => Promise<void>;
    updateStudentProgress: (studentId: string, stage: number, score: number) => void;
    nextStage: () => Promise<void>;
    endGame: () => void;
    addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateQuest: (questId: string, quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteQuest: (questId: string) => void;
    removeBots: () => void;
    setTimeRemaining: (time: number) => void;
    resetTimer: () => void;
    startSync: () => void;
    stopSync: () => void;
}

const defaultQuests: Quest[] = [
    {
        id: 'intro-algebra',
        title: 'Intro to Algebra',
        description: 'Basic algebra problems for beginners',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        problems: [
            {
                question: 'Solve: x + 5 = 12',
                answer: '7',
                type: 'multiple-choice',
                choices: ['5', '7', '17', '12'],
                stage: 1
            },
            {
                question: 'The answer to x - 3 = 10 is ___',
                answer: '13',
                type: 'fill-blank',
                stage: 2
            },
            {
                question: 'x + 8 = 20. True or False: x = 12',
                answer: 'True',
                type: 'true-false',
                choices: ['True', 'False'],
                stage: 3
            },
            {
                question: 'Solve: x - 7 = 5',
                answer: '12',
                type: 'short-answer',
                stage: 4
            },
            {
                question: 'Solve: x + 15 = 30',
                answer: '15',
                type: 'multiple-choice',
                choices: ['45', '30', '15', '25'],
                stage: 5
            },
        ],
    },
    {
        id: 'linear-equations',
        title: 'Linear Equations',
        description: 'Practice solving linear equations',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        problems: [
            {
                question: 'Solve: 2x = 14',
                answer: '7',
                type: 'multiple-choice',
                choices: ['6', '7', '14', '28'],
                stage: 1
            },
            {
                question: 'If 3x = 21, then x = ___',
                answer: '7',
                type: 'fill-blank',
                stage: 2
            },
            {
                question: 'Solve: 5x = 25',
                answer: '5',
                type: 'multiple-choice',
                choices: ['5', '20', '30', '125'],
                stage: 3
            },
            {
                question: '4x = 16. True or False: x = 4',
                answer: 'True',
                type: 'true-false',
                choices: ['True', 'False'],
                stage: 4
            },
            {
                question: 'Solve: 6x = 36',
                answer: '6',
                type: 'short-answer',
                stage: 5
            },
        ],
    },
    {
        id: 'finding-x-dance',
        title: 'Finding x: Dance Mission',
        description: 'Solve algebra to unlock the final dance routine!',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        problems: [
            {
                question: 'x + 5 = 15',
                answer: '10',
                type: 'short-answer',
                stage: 1,
                move: 'Step Forward',
                songPart: 'Intro Beat'
            },
            {
                question: '2x = 12',
                answer: '6',
                type: 'short-answer',
                stage: 2,
                move: 'Turn',
                songPart: 'Bassline'
            },
            {
                question: '3x - 4 = 11',
                answer: '5',
                type: 'short-answer',
                stage: 3,
                move: 'Clap',
                songPart: 'Melody'
            },
            {
                question: '4x + 2 = 18',
                answer: '4',
                type: 'short-answer',
                stage: 4,
                move: 'Jump',
                songPart: 'Full Song Unlocked'
            },
        ],
    },
];

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
            quests: defaultQuests,
            timeRemaining: 30,
            timerDuration: 30,
            isQRVisible: false,
            syncInterval: null,

            createGame: async (questId, timerDuration = 30) => {
                const quest = get().quests.find(q => q.id === questId);
                if (!quest) return;

                // Generate random 4-digit PIN
                const pin = Math.floor(1000 + Math.random() * 9000).toString();

                // Call API
                try {
                    await fetch('/api/game/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            questId,
                            pin,
                            totalStages: quest.problems.length
                        })
                    });
                } catch (e) {
                    console.error("Failed to create game on server", e);
                }

                set({
                    gamePin: pin,
                    currentQuest: quest,
                    status: 'idle',
                    isActive: false,
                    currentStage: 1,
                    totalStages: quest.problems.length,
                    students: [],
                    timerDuration,
                    timeRemaining: timerDuration,
                    isQRVisible: true,
                });

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
                    return { success: true };
                } catch (e) {
                    return { success: false, error: 'Network error' };
                }
            },

            startGame: () => set({ status: 'playing', isActive: true, isQRVisible: false }),
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

            toggleQR: (visible) => set({ isQRVisible: visible }),

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
                const nextStage = state.currentStage + 1;
                const pin = state.gamePin;

                if (state.currentStage >= state.totalStages) {
                    get().finishGame();
                    return;
                }

                if (pin) {
                    fetch('/api/game/update', {
                        method: 'POST',
                        body: JSON.stringify({ action: 'next_stage', pin, stage: nextStage })
                    }).catch(console.error);
                }

                set({
                    currentStage: nextStage,
                    timeRemaining: state.timerDuration,
                    students: state.students.map(s => ({ ...s, hasAnswered: false })),
                });
            },

            startSync: () => {
                if (get().syncInterval) return;
                const interval = setInterval(async () => {
                    const pin = get().gamePin;
                    // Only sync if we are in a game context
                    if (!pin) return;

                    try {
                        const res = await fetch(`/api/game/${pin}`);
                        if (!res.ok) return;
                        const data = await res.json();

                        // Merge Server State
                        set(() => ({
                            // Use server source of truth for students
                            students: data.students.map((s: any) => ({
                                id: s.id,
                                name: s.name,
                                score: s.score || 0,
                                hasAnswered: !!s.has_answered,
                                currentStage: s.current_stage || 1
                            })),
                            // If Host, we are source of truth for Status/Stage usually,
                            // but if we are client (Student), we need to listen.
                            // For simplicity, everyone listens to DB, but Host writes to DB.
                        }));
                    } catch (e) {
                        // silent fail
                    }
                }, 2000); // Poll every 2s
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

            addQuest: (quest) => set((state) => ({
                quests: [
                    ...state.quests,
                    {
                        ...quest,
                        id: Math.random().toString(36).substr(2, 9),
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                ],
            })),

            updateQuest: (questId, quest) => set((state) => ({
                quests: state.quests.map(q =>
                    q.id === questId
                        ? { ...quest, id: questId, createdAt: q.createdAt, updatedAt: Date.now() }
                        : q
                ),
            })),

            deleteQuest: (questId) => set((state) => {
                console.log('Attempting to delete quest:', questId);
                // Protect default quests from deletion
                if (['intro-algebra', 'linear-equations'].includes(questId)) {
                    console.warn('Cannot delete default quest:', questId);
                    return {};
                }
                const newQuests = state.quests.filter(q => q.id !== questId);
                console.log('Quests after deletion:', newQuests.length);
                return { quests: newQuests };
            }),

            removeBots: () => set((state) => ({
                students: state.students.filter(s => !s.name.startsWith('Bot '))
            })),

            setTimeRemaining: (time) => set({ timeRemaining: time }),
            resetTimer: () => set((state) => ({ timeRemaining: state.timerDuration })),
        }),
        {
            name: 'slayground-storage',
        }
    )
);
