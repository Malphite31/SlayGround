import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { CheckCircle2, XCircle, Clock, Award, ChevronRight, Music, Crown } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export function GamePlay() {
    const navigate = useNavigate();
    const { state } = useLocation();
    const studentId = state?.studentId;

    const {
        currentStage,
        status,
        students,
        currentQuest,
        timeRemaining,
        markStudentAnswered,
    } = useGameStore();

    const [selectedAnswer, setSelectedAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Get current student data live from store
    const myStudent = students.find(s => s.id === studentId);
    const score = myStudent?.score || 0;

    const currentProblem = currentQuest?.problems.find(p => p.stage === currentStage);

    // Reset submission state when stage changes
    useEffect(() => {
        setHasSubmitted(false);
        setSelectedAnswer('');
        setFeedback(null);
    }, [currentStage]);

    useEffect(() => {
        // Only redirect if there's no quest or studentId (invalid state)
        // Allow students to wait in lobby when status is 'idle'
        if (!currentQuest || !studentId) {
            navigate('/play');
        }
    }, [currentQuest, navigate, studentId]);

    const handleSubmit = (answer: string) => {
        if (hasSubmitted || !studentId) return;

        const isCorrect = answer === currentProblem?.answer;
        setHasSubmitted(true);
        markStudentAnswered(studentId, isCorrect);

        if (isCorrect) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }

        setTimeout(() => {
            setFeedback(null);
            setSelectedAnswer('');
        }, 3000);
    };

    // Winner / Game Over View
    if (status === 'finished') {
        const sortedStudents = [...students].sort((a, b) => b.score - a.score);
        const myRank = sortedStudents.findIndex(s => s.id === studentId) + 1;
        const isWinner = myRank === 1;

        // Fire realistic fireworks loop for winner
        useEffect(() => {
            if (isWinner) {
                const duration = 5000; // Shorter burst for student device
                const animationEnd = Date.now() + duration;
                const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

                const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

                const interval: any = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                        return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
                }, 250);

                return () => clearInterval(interval);
            }
        }, [isWinner]);

        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center px-6 bg-[#030712] relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh opacity-30" />

                {isWinner && (
                    <div className="absolute inset-0 pointer-events-none z-0" />
                )}

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-panel p-8 md:p-12 rounded-[2.5rem] max-w-sm w-full relative z-10 border-white/10 shadow-2xl backdrop-blur-3xl"
                >
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 relative ${isWinner ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-[0_0_40px_rgba(234,179,8,0.4)]' : 'bg-surface border border-white/10'}`}>
                        {isWinner ? (
                            <Crown className="w-12 h-12 text-white" />
                        ) : (
                            <Award className="w-12 h-12 text-slate-400" />
                        )}
                        {isWinner && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white font-black text-[10px] px-2 py-1 rounded-full border-2 border-[#030712]"
                            >
                                WINNER
                            </motion.div>
                        )}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-heading font-black mb-2 text-white">
                        {isWinner ? 'WINNER!' : 'MISSION COMPLETE'}
                    </h1>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm mb-8">
                        {isWinner ? 'You conquered the slayground' : 'Great work, agent!'}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-8">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Rank</div>
                            <div className={`text-3xl font-black ${isWinner ? 'text-yellow-400' : 'text-white'}`}>#{myRank}</div>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Score</div>
                            <div className="text-3xl font-black text-white">{score}</div>
                        </div>
                    </div>

                    <Button
                        size="xl"
                        variant="primary"
                        className="w-full text-lg rounded-2xl h-14"
                        onClick={() => navigate('/play')}
                    >
                        Play Again
                    </Button>
                </motion.div>
            </div>
        );
    }

    // Waiting for next problem state (if currentProblem is undefined but NOT finished)
    if (!currentProblem) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100dvh] text-center px-6">
                <div className="animate-spin mb-4">
                    <Clock className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-white">Loading Mission...</h2>
            </div>
        )
    }

    const totalProblems = currentQuest?.problems.length || 1;
    const progressPerc = (currentStage / totalProblems) * 100;



    // Render based on question type
    const renderQuestionInput = () => {
        switch (currentProblem.type) {
            case 'multiple-choice':
            case 'true-false':
                return (
                    <div className="grid grid-cols-1 gap-3 md:gap-4 w-full">
                        {currentProblem.choices?.map((choice, index) => (
                            <motion.button
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileTap={{ scale: hasSubmitted ? 1 : 0.98 }}
                                onClick={() => !hasSubmitted && handleSubmit(choice)}
                                disabled={hasSubmitted}
                                className={`p-5 md:p-6 rounded-xl md:rounded-2xl font-bold text-lg md:text-xl relative overflow-hidden group transition-all shadow-lg ${hasSubmitted
                                    ? choice === currentProblem.answer
                                        ? 'bg-green-500 text-white border-green-400 shadow-[0_0_20px_theme(\'colors.green.500\')] scale-[1.02] z-10'
                                        : selectedAnswer === choice
                                            ? 'bg-red-500/50 text-white border-red-500 opacity-50'
                                            : 'bg-surface/30 text-slate-500 opacity-30 blur-[1px]'
                                    : 'bg-surface border-2 border-white/5 hover:border-primary/50 hover:bg-surface/80 text-white'
                                    }`}
                            >
                                {!hasSubmitted && (
                                    <div className={`absolute inset-0 bg-gradient-to-r ${['from-red-500/10', 'from-blue-500/10', 'from-yellow-500/10', 'from-green-500/10'][index % 4]} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                                )}
                                <span className="relative z-10">{choice}</span>
                            </motion.button>
                        ))}
                    </div>
                );

            case 'fill-blank':
            case 'short-answer':
            default:
                return (
                    <div className="space-y-6 w-full animate-pop-in [animation-delay:200ms]">
                        <div className="relative">
                            <input
                                type="text"
                                value={selectedAnswer}
                                onChange={(e) => setSelectedAnswer(e.target.value)}
                                placeholder="Type answer..."
                                disabled={hasSubmitted}
                                className="w-full bg-surface border-2 border-white/10 rounded-2xl p-6 text-center text-3xl font-bold text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all disabled:opacity-50 placeholder:text-slate-600 shadow-inner"
                                onKeyPress={(e) => e.key === 'Enter' && !hasSubmitted && handleSubmit(selectedAnswer)}
                                autoFocus
                            />
                            {!hasSubmitted && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                    <div className="w-3 h-3 bg-primary rounded-full animate-ping"></div>
                                </div>
                            )}
                        </div>

                        <Button
                            size="xl"
                            variant="primary"
                            glow
                            className="w-full text-xl py-6 shadow-xl shadow-primary/20"
                            onClick={() => handleSubmit(selectedAnswer)}
                            disabled={!selectedAnswer.trim() || hasSubmitted}
                        >
                            {hasSubmitted ? 'Processing...' : 'Submit Answer'}
                            {!hasSubmitted && <ChevronRight className="w-6 h-6 ml-2" />}
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-[100dvh] bg-background relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-20"></div>
            <div className="bg-grid opacity-30 absolute inset-0 -z-10"></div>

            {/* Header Score/Timer - Ultra Compact */}
            <div className="flex items-center justify-between px-3 pt-3 relative z-20">
                <div className="flex items-center gap-2">
                    <div className={`px-3 py-1.5 rounded-xl font-mono font-black text-lg flex items-center gap-2 transition-all duration-500 shadow-lg ${timeRemaining <= 10 ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse shadow-red-500/20' : 'bg-surface/50 text-primary border border-white/10 shadow-black/20'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${timeRemaining <= 10 ? 'bg-red-400' : 'bg-primary'}`} />
                        {timeRemaining}s
                    </div>
                </div>
                <div className="glass-panel px-4 py-1.5 rounded-xl border-white/10 shadow-lg flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mb-0.5">Points</span>
                        <div className="text-xl font-black text-white leading-none">
                            {score}
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Award className="w-5 h-5 text-primary" />
                    </div>
                </div>
            </div>

            {/* Progress Line */}
            <div className="w-full h-1 bg-white/5 mt-2 md:mt-4">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out" style={{ width: `${progressPerc}%` }}></div>
            </div>

            {/* Main Game Area - Optimized spacing */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-4 w-full max-w-2xl mx-auto relative z-10">

                {/* Question Area */}
                <div className="w-full text-center mb-8 md:mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-panel p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5 bg-white/[0.02] shadow-2xl relative group overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                            <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                                Mission Stage {currentStage}
                            </span>
                            <h2 className="text-2xl xs:text-3xl md:text-5xl font-heading font-black text-white leading-tight drop-shadow-2xl">
                                {currentProblem.question}
                            </h2>
                        </div>
                    </motion.div>
                </div>

                <div className="w-full">
                    {renderQuestionInput()}
                </div>

            </div>

            {/* Full Screen Feedback Overlay */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className={`fixed inset-0 z-50 flex flex-col items-center justify-center backdrop-blur-xl ${feedback === 'correct' ? 'bg-green-500/80' : 'bg-red-500/80'
                            }`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                            className="bg-white rounded-full p-8 shadow-[0_0_100px_rgba(255,255,255,0.5)]"
                        >
                            {feedback === 'correct' ? (
                                <CheckCircle2 className="w-24 h-24 text-green-500" />
                            ) : (
                                <XCircle className="w-24 h-24 text-red-500" />
                            )}
                        </motion.div>

                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-6xl font-heading font-black text-white mt-8 drop-shadow-lg"
                        >
                            {feedback === 'correct' ? 'EPIC!' : 'OOPS!'}
                        </motion.h2>

                        {feedback === 'correct' ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-3xl font-bold text-white mt-4"
                            >
                                +100 PTS
                            </motion.p>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-center mt-4"
                            >
                                <p className="text-white/80 font-bold mb-2">The answer was:</p>
                                <p className="text-3xl font-black text-white bg-black/20 px-6 py-2 rounded-xl">{currentProblem.answer}</p>
                            </motion.div>
                        )}

                        {feedback === 'correct' && currentProblem.move && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-8 bg-white/20 backdrop-blur-md p-6 rounded-2xl border border-white/30 text-center shadow-xl"
                            >
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    <Music className="w-6 h-6 text-yellow-300 animate-bounce" />
                                    <span className="text-yellow-300 font-black text-xs uppercase tracking-widest">Unlock Info</span>
                                </div>
                                <h3 className="text-2xl font-black text-white mb-1">
                                    {currentProblem.move}
                                </h3>
                                <p className="text-white/70 text-sm font-medium">
                                    {currentProblem.songPart}
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
