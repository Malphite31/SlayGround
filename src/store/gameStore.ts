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

    // Actions
    createGame: (questId: string, timerDuration?: number) => void;
    startGame: () => void;
    pauseGame: () => void;
    finishGame: () => void; // Explicitly finish game
    toggleQR: (visible: boolean) => void;
    addStudent: (id: string, name: string) => void;
    markStudentAnswered: (studentId: string, isCorrect: boolean) => void;
    updateStudentProgress: (studentId: string, stage: number, score: number) => void;
    nextStage: () => void;
    endGame: () => void;
    addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateQuest: (questId: string, quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
    deleteQuest: (questId: string) => void;
    removeBots: () => void;
    setTimeRemaining: (time: number) => void;
    resetTimer: () => void;
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

            createGame: (questId, timerDuration = 30) => {
                const quest = get().quests.find(q => q.id === questId);
                if (!quest) return;

                const pin = "1234!";
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
                    isQRVisible: true, // Auto-show guide on creation
                });
            },

            startGame: () => set({ status: 'playing', isActive: true, isQRVisible: false }), // Auto-hide guide on start
            pauseGame: () => set({ status: 'paused', isActive: false }),

            finishGame: () => set({ status: 'finished', isActive: false }),
            toggleQR: (visible) => set({ isQRVisible: visible }),

            addStudent: (id, name) => set((state) => ({
                students: [
                    ...state.students,
                    {
                        id,
                        name,
                        score: 0,
                        currentStage: 1,
                        hasAnswered: false,
                    },
                ],
            })),

            markStudentAnswered: (studentId, isCorrect) => set((state) => ({
                students: state.students.map((student) =>
                    student.id === studentId
                        ? {
                            ...student,
                            hasAnswered: true,
                            score: isCorrect ? student.score + 100 : student.score
                        }
                        : student
                ),
            })),

            updateStudentProgress: (studentId, stage, score) => set((state) => ({
                students: state.students.map((student) =>
                    student.id === studentId
                        ? { ...student, currentStage: stage, score }
                        : student
                ),
            })),

            nextStage: () => set((state) => {
                if (state.currentStage >= state.totalStages) {
                    return { status: 'finished', isActive: false };
                }
                return {
                    currentStage: state.currentStage + 1,
                    timeRemaining: state.timerDuration,
                    students: state.students.map(s => ({ ...s, hasAnswered: false })),
                };
            }),

            endGame: () => set({
                status: 'idle',
                isActive: false,
                gamePin: null,
                currentStage: 0,
                students: [],
                currentQuest: null,
                timeRemaining: 30,
            }),

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
