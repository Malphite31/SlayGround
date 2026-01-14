import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { Users, Trophy, Clock, Sparkles, Music, Crown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import confetti from 'canvas-confetti';

// Helper function to extract YouTube video ID from URL
function getYouTubeVideoId(url: string): string | null {
    try {
        const urlObj = new URL(url);
        // Handle youtube.com/watch?v=VIDEO_ID
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
        // Handle youtu.be/VIDEO_ID
        if (urlObj.hostname.includes('youtu.be')) {
            return urlObj.pathname.slice(1);
        }
    } catch {
        return null;
    }
    return null;
}

export function HostView() {
    const {
        gamePin,
        isQRVisible,
        students,
        currentQuest,
        currentStage,
        totalStages,
        timeRemaining,
        setTimeRemaining,
        nextStage,
        status,
        startSync // Added
    } = useGameStore();

    // Start polling sync if game is active
    useEffect(() => {
        if (gamePin) {
            console.log('[HostView] Game PIN detected, starting sync:', gamePin);
            startSync();
        }
    }, [gamePin, startSync]);

    // Also try to sync on mount in case gamePin is already set
    useEffect(() => {
        const pin = useGameStore.getState().gamePin;
        if (pin) {
            console.log('[HostView] Mounted with existing PIN, starting sync:', pin);
            startSync();
        }
    }, [startSync]);

    const currentProblem = currentQuest?.problems.find(p => p.stage === currentStage);
    const answeredCount = students.filter(s => s.hasAnswered).length;

    // Timer countdown
    const [showAnswer, setShowAnswer] = useState(false);

    //Winner screen state (must be at top level, not inside conditional)
    const [showCountdown, setShowCountdown] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [showPerformance, setShowPerformance] = useState(false);

    // Handle answer reveal and auto-advance when timer reaches 0
    useEffect(() => {
        if (status !== 'playing' || !currentProblem || timeRemaining !== 0) return;

        // Reveal answer
        setShowAnswer(true);

        // After 5 seconds, advance to next stage
        const timeout = setTimeout(() => {
            setShowAnswer(false);
            nextStage();
        }, 5000);

        return () => clearTimeout(timeout);
    }, [status, currentProblem, timeRemaining]); // Removed showAnswer from dependencies

    // Timer countdown interval
    useEffect(() => {
        if (status !== 'playing' || !currentProblem || timeRemaining === 0) return;

        const interval = setInterval(() => {
            setTimeRemaining(Math.max(0, timeRemaining - 1));
        }, 1000);

        return () => clearInterval(interval);
    }, [status, timeRemaining, currentProblem, setTimeRemaining]);

    // Reset showAnswer when stage changes
    useEffect(() => {
        setShowAnswer(false);
    }, [currentStage]);

    // Reset countdown when game finishes
    useEffect(() => {
        if (status === 'finished') {
            setShowCountdown(false); // Start with NO countdown
            setCountdown(3);
            setShowPerformance(false);
        }
    }, [status]);

    // Transition to countdown before performance
    useEffect(() => {
        if (status === 'finished' && !showCountdown && !showPerformance) {
            // Wait 8 seconds after winner appears, then show countdown
            const timer = setTimeout(() => {
                setShowCountdown(true); // Show countdown before performance
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [status, showCountdown, showPerformance]);

    if (!gamePin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-center px-4 relative overflow-hidden">
                <div className="bg-mesh opacity-50 absolute inset-0"></div>

                <div className="glass-panel p-16 rounded-[3rem] max-w-3xl relative z-10 border-white/10 shadow-2xl animate-pop-in">
                    <div className="mb-8 w-24 h-24 bg-surface/50 rounded-full flex items-center justify-center mx-auto border border-white/10">
                        <Sparkles className="w-12 h-12 text-slate-500 animate-pulse" />
                    </div>
                    <h1 className="text-7xl font-heading font-black mb-6 text-slate-400 tracking-tight">
                        SYSTEM IDLE
                    </h1>
                    <p className="text-2xl text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">
                        Initialize a mission from the Command Center to begin broadcast.
                    </p>
                </div>


            </div>
        );
    }

    // Winner View
    if (status === 'finished') {
        const sortedStudents = [...students].sort((a, b) => b.score - a.score);
        const top3 = sortedStudents.slice(0, 3);
        const winners = sortedStudents.filter(s => s.score === top3[0]?.score);

        // Countdown timer - triggers performance after countdown finishes
        useEffect(() => {
            if (!showCountdown) return; // Only run if countdown is showing

            if (countdown > 0) {
                const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
                return () => clearTimeout(timer);
            } else if (countdown === 0) {
                setTimeout(() => {
                    setShowCountdown(false);
                    setShowPerformance(true); // Show performance after countdown
                }, 500);
            }
        }, [countdown, showCountdown]);

        // Fire realistic fireworks loop
        useEffect(() => {
            const duration = 15 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            return () => clearInterval(interval);
        }, []);

        // Show countdown before performance transition (if has moves)
        if (showCountdown && currentQuest?.problems.some(p => p.move)) {
            return (
                <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
                    <div className="bg-mesh opacity-30 absolute inset-0" />
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center relative z-10"
                    >
                        <motion.h1
                            initial={{ y: -50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-7xl md:text-9xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent mb-12 leading-tight"
                        >
                            GET READY TO<br />SHOW YOUR MOVES!
                        </motion.h1>

                        {countdown > 0 && (
                            <motion.div
                                key={countdown}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-[20rem] font-black text-primary drop-shadow-[0_0_50px_rgba(139,92,246,0.5)]"
                            >
                                {countdown}
                            </motion.div>
                        )}

                        {countdown === 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: [0, 1.2, 1] }}
                                className="text-9xl font-black text-yellow-400 drop-shadow-[0_0_50px_rgba(234,179,8,0.8)]"
                            >
                                LET'S GO!
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            );
        }

        return (
            <div className="min-h-screen overflow-y-auto overflow-x-hidden flex flex-col items-center relative p-8 bg-background">
                {/* Background Grid */}
                <div className="bg-grid opacity-30 z-[-5]" />
                <div className="absolute inset-0 bg-mesh opacity-20 -z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0c0d1a] to-background -z-20"></div>
                {/* Winner Reveal Flash */}

                {/* Winner Reveal Flash */}
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0 bg-white z-[100] pointer-events-none"
                />

                {/* Show winner podium if performance hasn't started yet */}
                {!showPerformance && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: -50, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="text-center mb-16 relative z-10"
                        >
                            <div className="flex justify-center mb-4">
                                <motion.div
                                    initial={{ rotate: -180, scale: 0 }}
                                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{
                                        rotate: { duration: 1, ease: "easeOut" },
                                        scale: { duration: 4, repeat: Infinity }
                                    }}
                                >
                                    <Crown className="w-24 h-24 text-yellow-400 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                                </motion.div>
                            </div>
                            <h1 className="text-8xl md:text-9xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] leading-none mb-4">
                                {winners.length > 1 ? 'WINNERS' : 'WINNER'}
                            </h1>
                            <p className="text-2xl text-yellow-100/50 font-bold tracking-[0.4em] uppercase">The Slayground Champion</p>
                        </motion.div>

                        <div className="flex items-end gap-6 md:gap-12 relative z-10 mb-12 h-64 md:h-80">
                            {/* 2nd Place */}
                            {top3[1] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        <div className="text-2xl font-bold text-slate-300 drop-shadow-md">{top3[1].name}</div>
                                        <div className="font-mono text-lg text-slate-400">{top3[1].score} pts</div>
                                    </div>
                                    <div className="w-28 md:w-36 h-32 md:h-40 glass-panel bg-slate-400/10 border-slate-400/30 rounded-t-3xl flex items-center justify-center relative overflow-hidden group">
                                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-slate-400/20 to-transparent" />
                                        <span className="text-6xl font-black text-slate-500/20">2</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* 1st Place */}
                            {top3[0] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 1.1, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="flex flex-col items-center relative z-20"
                                >
                                    <div className="mb-6 text-center">
                                        <div className="text-5xl md:text-6xl font-black text-yellow-400 mb-2 drop-shadow-[0_0_20px_rgba(234,179,8,0.4)]">{top3[0].name}</div>
                                        <div className="font-mono text-3xl text-white/90 font-black">{top3[0].score} PTS</div>
                                    </div>
                                    <div className="w-36 md:w-48 h-48 md:h-64 glass-panel bg-yellow-500/20 border-yellow-500/50 rounded-t-3xl border-b-0 flex items-center justify-center relative overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)]">
                                        <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/30 via-yellow-500/5 to-transparent animate-pulse" />
                                        <span className="text-8xl font-black text-yellow-500/20 relative z-10">1</span>
                                        <div className="absolute top-0 w-full h-1 bg-yellow-300/50" />
                                    </div>
                                </motion.div>
                            )}

                            {/* 3rd Place */}
                            {top3[2] && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className="mb-4 text-center">
                                        <div className="text-2xl font-bold text-orange-200 drop-shadow-md">{top3[2].name}</div>
                                        <div className="font-mono text-lg text-orange-400">{top3[2].score} pts</div>
                                    </div>
                                    <div className="w-28 md:w-36 h-24 md:h-32 glass-panel bg-orange-500/10 border-orange-500/30 rounded-t-3xl flex items-center justify-center relative overflow-hidden shadow-inner">
                                        <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-orange-500/20 to-transparent" />
                                        <span className="text-6xl font-black text-orange-500/20">3</span>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}

                {/* FINAL PERFORMANCE - Show only after podium */}
                {showPerformance && currentQuest?.problems.some(p => p.move) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-primary/30 bg-primary/5 max-w-6xl w-full relative z-10 shadow-2xl backdrop-blur-md"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-2xl">
                                    <Music className="w-8 h-8 text-primary animate-bounce" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-heading font-black text-white">FINAL PERFORMANCE</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Unlock your final groove</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-primary font-black text-xl">ROUTINE READY!</div>
                            </div>
                        </div>

                        {/* YouTube Player if music URL exists */}
                        {currentQuest.musicUrl && getYouTubeVideoId(currentQuest.musicUrl) && (
                            <div className="mb-6 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-2xl">
                                <iframe
                                    width="100%"
                                    height="315"
                                    src={`https://www.youtube.com/embed/${getYouTubeVideoId(currentQuest.musicUrl)}?autoplay=1&mute=0`}
                                    title="Performance Music"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-4 md:gap-6">
                            {currentQuest.problems.filter(p => p.move).map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 1.2 + (i * 0.15) }}
                                    className="bg-white/5 p-4 md:p-5 rounded-2xl border border-white/10 text-center hover:bg-white/10 transition-colors group cursor-default"
                                >
                                    <div className="text-primary text-[10px] font-black tracking-widest uppercase mb-1 opacity-50 group-hover:opacity-100 transition-opacity">Step {i + 1}</div>
                                    <div className="text-lg md:text-xl font-bold text-white group-hover:scale-105 transition-transform">{p.move}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-6 flex items-center justify-center gap-4 text-xl text-slate-300 font-medium">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                            <span>Perform the routine together in front of the class!</span>
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                        </div>
                    </motion.div>
                )}
            </div>
        )
    }

    // Timer color based on remaining time
    const getTimerColor = () => {
        const percentage = (timeRemaining / 30) * 100;
        if (percentage > 50) return 'text-green-400';
        if (percentage > 20) return 'text-yellow-400';
        return 'text-red-500';
    };

    // Waiting Screen with QR Code (before game starts)
    if (status !== 'playing' && status !== 'finished') {
        const joinUrl = `${window.location.origin}/join/${gamePin}`;

        return (
            <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-background p-8">
                <div className="bg-mesh opacity-30 absolute inset-0" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center relative z-10 max-w-4xl"
                >
                    <h1 className="text-6xl md:text-8xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary mb-4">
                        {currentQuest?.title}
                    </h1>
                    <p className="text-2xl text-slate-400 mb-12 font-medium">
                        Scan the QR code or visit the link to join!
                    </p>

                    <div className="glass-panel p-12 rounded-[3rem] border-white/10 shadow-2xl mb-8 inline-block">
                        <QRCode value={joinUrl} size={300} level="H" />
                    </div>

                    <div className="glass-panel px-8 py-4 rounded-2xl border-primary/30 bg-primary/5 inline-block mb-8">
                        <p className="text-4xl font-mono font-black text-white tracking-wider">
                            PIN: {gamePin}
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        <Users className="w-8 h-8 text-primary" />
                        <p className="text-3xl font-black text-white">
                            {students.length} {students.length === 1 ? 'Student' : 'Students'} Joined
                        </p>
                    </div>

                    {students.length > 0 && (
                        <div className="glass-panel p-6 rounded-2xl max-w-2xl mx-auto">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {students.map((student) => (
                                    <div key={student.id} className="bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                                        <p className="text-white font-bold truncate">{student.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <p className="text-slate-500 mt-8 text-lg">
                        Waiting for teacher to start the game...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen overflow-hidden flex flex-col p-8 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0f1020] to-background -z-20"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-shrink-0 animate-pop-in">
                <div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary filter drop-shadow-lg truncate max-w-xl mb-2">
                        {currentQuest?.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-32 bg-surface rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(currentStage / (totalStages || 1)) * 100}%` }}></div>
                        </div>
                        <p className="text-slate-400 text-lg font-bold tracking-wide uppercase">Phase {currentStage} / {totalStages}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`px-4 py-2 rounded-2xl glass-panel ${status === 'playing' ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'} flex items-center gap-3`}>
                        <span className={`relative flex h-3 w-3`}>
                            {status === 'playing' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'playing' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                        </span>
                        <span className={`text-sm font-bold uppercase tracking-widest ${status === 'playing' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {status === 'playing' ? 'Active' : 'Waiting'}
                        </span>
                    </div>

                    {status === 'playing' && currentProblem && (
                        <div className="glass-panel px-6 py-3 rounded-2xl flex items-center gap-3 border-white/10 shadow-2xl">
                            <Clock className={`w-8 h-8 ${getTimerColor()} ${timeRemaining <= 10 ? 'animate-pulse' : ''}`} />
                            <div className={`text-5xl font-black font-mono tabular-nums tracking-tighter ${getTimerColor()}`}>{timeRemaining}s</div>
                        </div>
                    )}

                    <div className="text-right glass-panel px-6 py-3 rounded-2xl border-primary/20 bg-primary/5">
                        <p className="text-primary text-[10px] font-bold tracking-[0.2em] mb-1 uppercase leading-none">Mission Code</p>
                        <div className="text-5xl font-mono font-black text-white tracking-widest leading-none mt-1">{gamePin}</div>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            {currentProblem ? (
                <div className="flex-1 flex gap-6 min-h-0 relative">
                    {/* Left: Question Area */}
                    <div className="flex-[3] flex flex-col gap-6 relative">
                        <div className="glass-panel p-8 md:p-12 rounded-[3rem] flex-1 flex flex-col items-center justify-center relative overflow-hidden border-white/10 shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                            <div className="text-center space-y-8 w-full px-8 relative z-10">
                                <h2 className="text-6xl md:text-8xl font-heading font-black text-white leading-tight drop-shadow-2xl">
                                    {currentProblem.question}
                                </h2>
                                {currentProblem.choices && (
                                    <div className="grid grid-cols-2 gap-6 mt-12 max-w-5xl mx-auto w-full">
                                        {currentProblem.choices.map((choice, index) => {
                                            const isCorrect = choice === currentProblem.answer;
                                            const isDimmed = showAnswer && !isCorrect;

                                            return (
                                                <div
                                                    key={index}
                                                    className={`glass-panel p-8 rounded-3xl border transition-all duration-500 flex items-center justify-center text-4xl font-bold shadow-xl
                                                        ${showAnswer && isCorrect ? 'bg-green-500 text-white border-green-400 scale-105 shadow-[0_0_50px_theme(\'colors.green.500\')] z-20' :
                                                            isDimmed ? 'opacity-20 bg-surface/40 border-white/5 blur-sm scale-95' :
                                                                'bg-surface/40 border-white/10 text-white'}`}
                                                >
                                                    {choice}
                                                    {showAnswer && isCorrect && (
                                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-4 -right-4 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                                            <CheckCircle2 className="w-8 h-8" />
                                                        </motion.div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="absolute bottom-8 right-8 glass-panel px-8 py-5 rounded-3xl border-white/10 flex items-center gap-5 bg-surface/90 backdrop-blur-2xl shadow-2xl">
                                <div className="text-right">
                                    <span className="text-4xl font-black text-white leading-none block">{answeredCount}/{students.length}</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 block">Responses</span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Sidebar Stats */}
                    <div className="flex-1 flex flex-col gap-6 min-h-0">
                        {/* Leaderboard Card */}
                        <div className="flex-[2] glass-panel p-6 rounded-[2.5rem] flex flex-col relative overflow-hidden border-white/10 shadow-xl min-h-0">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10 shrink-0">
                                <Trophy className="w-6 h-6 text-yellow-400" />
                                <h3 className="text-xl font-heading font-black text-yellow-500 uppercase tracking-widest">Top 10 Agents</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-none">
                                <AnimatePresence mode="popLayout">
                                    {students.sort((a, b) => b.score - a.score).slice(0, 10).map((s, i) => (
                                        <motion.div layout key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={`p-3 rounded-2xl flex items-center gap-3 bg-white/5 border border-white/5 ${s.hasAnswered ? 'ring-2 ring-primary/30' : ''}`}>
                                            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm font-black text-slate-400">{i + 1}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold truncate text-slate-200">{s.name}</p>
                                                {s.hasAnswered && <span className="text-[10px] text-primary font-black uppercase">Mission Ready</span>}
                                            </div>
                                            <div className="font-mono font-black text-lg text-white">{s.score}</div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Routine Tracker Card */}
                        {currentQuest?.problems.some(p => p.move) && (
                            <div className="flex-1 glass-panel p-6 rounded-[2.5rem] border-primary/20 bg-primary/5 flex flex-col min-h-0">
                                <div className="flex items-center gap-2 mb-4 shrink-0">
                                    <Music className="w-5 h-5 text-primary" />
                                    <h4 className="text-sm font-black text-primary uppercase tracking-widest">Dance Routine</h4>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-none">
                                    {currentQuest.problems.map((p, i) => {
                                        const isUnlocked = (i + 1) < currentStage;
                                        const isCurrent = (i + 1) === currentStage;
                                        return (
                                            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isUnlocked ? 'bg-primary/20 border-primary/30' :
                                                isCurrent ? 'bg-white/10 border-white/20 animate-pulse' :
                                                    'bg-black/20 border-white/5 opacity-40'
                                                }`}>
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${isUnlocked ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500'}`}>
                                                    {i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                                        {p.move || 'Secret Action'}
                                                    </p>
                                                    {isUnlocked && <span className="text-[10px] text-primary font-black uppercase">Unlocked</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-8 p-16 glass-panel rounded-[4rem] border-white/5">
                        <div className="relative inline-block">
                            <Sparkles className="w-20 h-20 text-primary absolute -top-12 -right-12 animate-pulse" />
                            <h2 className="text-9xl font-heading font-black text-white tracking-tighter">STAND BY</h2>
                        </div>
                        <p className="text-3xl text-slate-500 font-bold uppercase tracking-[0.3em]">Calibrating Mission Modules...</p>
                    </div>
                </div>
            )}

            {/* QR Overlay */}
            <AnimatePresence>
                {isQRVisible && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-12">
                        <div className="glass-panel p-20 rounded-[4rem] border-white/10 shadow-2xl max-w-6xl w-full flex items-center gap-20 relative">
                            <div className="bg-white p-8 rounded-[3rem] shadow-2xl shrink-0">
                                <QRCode value={`${window.location.origin}/play?pin=${gamePin}`} size={350} />
                            </div>
                            <div className="flex-1 space-y-12">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-black text-primary">1</div>
                                        <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-widest">Connect Device</h2>
                                    </div>
                                    <div className="text-6xl font-heading font-black text-white break-all">{window.location.host}</div>
                                </div>
                                <div className="space-y-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl font-black text-primary">2</div>
                                        <h2 className="text-3xl font-bold text-slate-400 uppercase tracking-widest">Authorize Key</h2>
                                    </div>
                                    <div className="bg-surface border-4 border-white/10 px-12 py-6 rounded-[2.5rem] inline-block shadow-inner">
                                        <span className="text-8xl font-mono font-black text-white tracking-[0.25em]">{gamePin}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-2xl font-black text-white bg-primary/10 border border-primary/20 p-6 rounded-3xl w-max">
                                    <div className="w-4 h-4 bg-green-500 rounded-full animate-ping" />
                                    Agents Linked: <span className="text-primary">{students.length}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
