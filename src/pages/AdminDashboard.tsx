import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, SkipForward, Trash2, Edit, Users, Presentation, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useGameStore } from '../store/gameStore';

export function AdminDashboard() {
    const navigate = useNavigate();
    const {
        gamePin,
        isActive,
        students,
        currentQuest,
        currentStage,
        totalStages,
        quests,
        createGame,
        startGame,
        pauseGame,
        nextStage,
        deleteQuest,
        startSync,
        loadQuests,
        finishGame,
        endGame,
        status,
    } = useGameStore();



    // Load quests from database on mount
    useEffect(() => {
        loadQuests();
    }, []);

    // Start polling sync on mount
    useEffect(() => {
        if (gamePin) {
            startSync();
        }
    }, [gamePin]);

    const handleLaunchQuest = (questId: string) => {
        if (gamePin && !confirm('This will end the current session and kick all students. Start new game?')) {
            return;
        }
        createGame(questId);
    };

    const handleEditQuest = (questId: string) => {
        navigate(`/admin/quest/edit/${questId}`);
    };

    const handleDeleteQuest = (questId: string) => {
        if (confirm('Are you sure you want to delete this quest?')) {
            deleteQuest(questId);
        }
    };



    const handleCopyLink = () => {
        const url = `${window.location.origin}/play?pin=${gamePin}`;
        navigator.clipboard.writeText(url);
        alert('Game link copied to clipboard!');
    };

    const handleStartGame = () => {
        startGame();
    };

    // Admin Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return sessionStorage.getItem('admin_auth') === 'true';
    });
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isManualOpen, setIsManualOpen] = useState(false);

    // Auto-display user manual on first login
    useEffect(() => {
        if (isAuthenticated && !localStorage.getItem('admin_manual_seen')) {
            setIsManualOpen(true);
        }
    }, [isAuthenticated]);

    const handleCloseManual = () => {
        setIsManualOpen(false);
        localStorage.setItem('admin_manual_seen', 'true');
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Strict Admin Key validation
        const validKeys = ['admin'];

        if (validKeys.includes(password)) {
            setIsAuthenticated(true);
            sessionStorage.setItem('admin_auth', 'true');
            setAuthError('');
        } else {
            setAuthError('Invalid Access Key');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="h-full flex items-center justify-center p-4">
                <div className="glass-panel p-6 md:p-8 rounded-2xl md:rounded-3xl w-full max-w-sm md:max-w-md border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 pointer-events-none"></div>

                    <div className="text-center mb-6 md:mb-8 relative z-10">
                        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-lg">
                            <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-heading font-black text-white">Command Center</h1>
                        <p className="text-slate-400 mt-2 text-sm md:text-base">Enter access key to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4 md:space-y-6 relative z-10">
                        <div className="space-y-2">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Access Key"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all font-mono text-center text-lg tracking-widest"
                                autoFocus
                            />
                            {authError && (
                                <p className="text-red-400 text-sm text-center font-medium animate-shake">
                                    {authError}
                                </p>
                            )}
                        </div>
                        <Button variant="primary" type="submit" className="w-full py-3 md:py-4 text-lg rounded-xl">
                            <span className="flex items-center gap-2">
                                Login <Users className="w-4 h-4" />
                            </span>
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    const progressPercentage = totalStages > 0 ? (currentStage / totalStages) * 100 : 0;

    const handleLogout = () => {
        setIsAuthenticated(false);
        sessionStorage.removeItem('admin_auth');
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h1 className="text-2xl md:text-5xl font-heading font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent leading-tight">
                            Command Center
                        </h1>
                        <p className="text-slate-400 text-xs md:text-lg font-medium hidden md:block">Manage your Finding X activities.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsManualOpen(true)} className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg md:rounded-xl text-xs md:text-base h-8 md:h-10 px-3 md:px-4">
                            <span className="hidden md:inline">User Manual</span>
                            <span className="md:hidden">Help</span>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg md:rounded-xl text-xs md:text-base h-8 md:h-10 px-3 md:px-4">
                            <span className="hidden md:inline">Log Out</span>
                            <span className="md:hidden">Exit</span>
                        </Button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="glass-panel p-2 rounded-xl md:rounded-2xl flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2 md:gap-4 border-white/10 bg-white/5">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 md:flex items-center gap-2 w-full xl:w-auto">
                        <Link to="/admin/quest/new" className="w-full md:w-auto">
                            <Button variant="primary" className="w-full md:w-auto rounded-lg md:rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all h-10 md:h-12 px-4 md:px-6 text-sm md:text-base">
                                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                                <span className="md:hidden">New</span>
                                <span className="hidden md:inline">Create Quest</span>
                            </Button>
                        </Link>
                        {gamePin && (
                            <Link to="/host" target="_blank" className="w-full md:w-auto">
                                <Button variant="outline" className="w-full md:w-auto rounded-lg md:rounded-xl border-white/10 hover:bg-white/5 h-10 md:h-12 px-4 md:px-6 text-sm md:text-base">
                                    <Presentation className="w-4 h-4 md:w-5 md:h-5 mr-1.5 md:mr-2" />
                                    <span className="md:hidden">Projector</span>
                                    <span className="hidden md:inline">Launch Projector</span>
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Session Utilities */}
                    {gamePin && (
                        <div className="flex items-center gap-1.5 md:gap-2 w-full xl:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                            <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2 hidden xl:block"></div>

                            <Button variant="ghost" onClick={handleCopyLink} className="rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 text-slate-400 hover:text-white hover:bg-white/5 bg-black/20">
                                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                Link
                            </Button>

                            {isActive && (
                                <>
                                    <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2 flex-shrink-0"></div>

                                    <Button variant="ghost" onClick={finishGame} className="rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-black/20 border-dashed border border-red-500/20">
                                        <span className="md:hidden">Finish</span>
                                        <span className="hidden md:inline">Finish Game</span>
                                    </Button>
                                </>
                            )}

                            {status === 'finished' && (
                                <>
                                    <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2 flex-shrink-0"></div>

                                    <Button variant="ghost" onClick={endGame} className="rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 text-slate-400 hover:text-white hover:bg-white/10 bg-black/20">
                                        <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                        <span className="md:hidden">Close</span>
                                        <span className="hidden md:inline">Close Session</span>
                                    </Button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Live Status Card */}
                {/* Live Status Card */}
                <div className="col-span-1 md:col-span-2 glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/30 transition-colors"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 md:w-6 md:h-6 text-accent" />
                                <span className="truncate max-w-[150px] md:max-w-none">{gamePin ? currentQuest?.title : 'No Active Game'}</span>
                            </h2>
                            {gamePin && (
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="px-3 py-1.5 md:px-4 md:py-2 bg-slate-800 rounded-lg md:rounded-xl font-mono text-lg md:text-2xl font-bold">
                                        PIN: {gamePin}
                                    </span>
                                    {isActive && (
                                        <span className="px-2 py-0.5 md:px-3 md:py-1 bg-green-500/20 text-green-400 rounded-full text-[10px] md:text-sm font-bold animate-pulse">
                                            LIVE
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {gamePin ? (
                            <div className="flex flex-col gap-3 md:gap-4">
                                <div className="text-3xl md:text-5xl font-black flex items-baseline gap-2">
                                    {students.length} <span className="text-base md:text-xl font-normal text-slate-400">Students</span>
                                </div>
                                <div className="w-full bg-slate-800 rounded-full h-3 md:h-4 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                                <p className="text-xs md:text-sm text-slate-400 flex justify-between">
                                    <span>Quest Progress</span>
                                    <span>Stage {currentStage}/{totalStages}</span>
                                </p>

                                {/* Game Controls */}
                                <div className="mt-4 grid grid-cols-2 gap-2 md:gap-3">
                                    {!isActive ? (
                                        <Button variant="secondary" onClick={handleStartGame} className="w-full gap-1.5 md:gap-2 rounded-xl h-10 md:h-12 text-sm md:text-base px-2 md:px-4 whitespace-nowrap">
                                            <Play className="w-4 h-4 md:w-5 md:h-5" /> Start Game
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={pauseGame} className="w-full gap-1.5 md:gap-2 rounded-xl h-10 md:h-12 text-sm md:text-base px-2 md:px-4 whitespace-nowrap">
                                            <Pause className="w-4 h-4 md:w-5 md:h-5" /> Pause
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        onClick={nextStage}
                                        disabled={!isActive || currentStage >= totalStages}
                                        className="w-full gap-1.5 md:gap-2 rounded-xl h-10 md:h-12 border border-white/5 bg-white/5 hover:bg-white/10 text-sm md:text-base px-2 md:px-4 whitespace-nowrap"
                                    >
                                        <SkipForward className="w-4 h-4 md:w-5 md:h-5" /> Next Stage
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-400 text-lg">Select a quest from the library to begin.</p>
                        )}
                    </div>
                </div>

                {/* Quick Stats / Library */}
                <div className="glass-panel p-6 rounded-3xl flex flex-col">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-4 text-slate-200">Quest Library ({quests.length})</h2>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                            {quests.map((quest) => (
                                <div
                                    key={quest.id}
                                    className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group/item"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold truncate">{quest.title}</p>
                                            <p className="text-xs text-slate-400">{quest.problems.length} questions</p>
                                        </div>
                                        <div className="flex gap-1 flex-shrink-0">
                                            <button
                                                onClick={() => handleLaunchQuest(quest.id)}
                                                className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                                                title="Launch Quest"
                                            >
                                                <Play className="w-4 h-4 text-primary" />
                                            </button>
                                            <button
                                                onClick={() => handleEditQuest(quest.id)}
                                                className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                                                title="Edit Quest"
                                            >
                                                <Edit className="w-4 h-4 text-accent" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteQuest(quest.id)}
                                                disabled={['intro-algebra', 'linear-equations'].includes(quest.id)}
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                                                title={['intro-algebra', 'linear-equations'].includes(quest.id) ? "Default quests cannot be deleted" : "Delete Quest"}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Students List */}
            {gamePin && students.length > 0 && (
                <div className="glass-panel p-6 rounded-3xl">
                    <h2 className="text-2xl font-bold mb-4">Connected Students</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {students.map((student) => (
                            <div
                                key={student.id}
                                className="p-4 bg-white/5 rounded-xl flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-bold">{student.name}</p>
                                    <p className="text-sm text-slate-400">Stage {student.currentStage}</p>
                                </div>
                                <div className="text-2xl font-bold text-accent">{student.score}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {/* User Manual Modal */}
            {isManualOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={handleCloseManual}>
                    <div className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto p-8 rounded-3xl border-white/20 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={handleCloseManual} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
                            <Plus className="w-6 h-6 rotate-45" />
                        </button>

                        <div className="mb-8">
                            <h2 className="text-4xl font-heading font-black text-white mb-2">Command Center User Guide</h2>
                            <p className="text-slate-400">Everything you need to know to run SlayGround like a pro</p>
                        </div>

                        <div className="space-y-10 text-slate-300">
                            <section className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-lg">📋</span>
                                    What is the Command Center?
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p>The <strong>Command Center</strong> is your mission control for SlayGround sessions. From here, you can:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Create and manage educational quests with custom questions</li>
                                        <li>Launch game sessions and monitor student participation in real-time</li>
                                        <li>Control game flow with start, pause, and navigation controls</li>
                                        <li>Display the projector view for classroom engagement</li>
                                        <li>Track student progress, scores, and unlocked dance moves</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg">🚀</span>
                                    Getting Started
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p className="text-lg font-semibold text-white">Quick Start in 3 Steps:</p>
                                    <ol className="list-decimal pl-5 space-y-3">
                                        <li>
                                            <strong className="text-white">Choose or Create a Quest</strong>
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                                <li>Click <span className="px-2 py-1 bg-primary/20 text-primary rounded font-mono text-xs">+ Create Quest</span> to build a new quest, or</li>
                                                <li>Select an existing quest from the Quest Library panel</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong className="text-white">Initialize the Game</strong>
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                                <li>Click the <Play className="w-3 h-3 inline text-primary" /> <strong>Play</strong> icon next to your chosen quest</li>
                                                <li>A unique 4-digit <strong>Game PIN</strong> will be generated automatically</li>
                                                <li>The game status changes to "waiting for students"</li>
                                            </ul>
                                        </li>
                                        <li>
                                            <strong className="text-white">Launch the Projector</strong>
                                            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                                                <li>Click <span className="px-2 py-1 bg-accent/20 text-accent rounded font-mono text-xs">Launch Projector</span> to open the Host View</li>
                                                <li>Drag the new tab to your projector/second screen</li>
                                                <li>Students can now scan the QR code or enter the PIN at <code className="bg-black/30 px-2 py-0.5 rounded">{window.location.host}/play</code></li>
                                            </ul>
                                        </li>
                                    </ol>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-lg">✏️</span>
                                    Quest Builder Guide
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p>Create engaging educational content with these question types:</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <h4 className="font-bold text-white mb-2">📝 Multiple Choice</h4>
                                            <p className="text-sm">Students select from 2-4 answer options</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <h4 className="font-bold text-white mb-2">✓ True/False</h4>
                                            <p className="text-sm">Simple binary choice questions</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <h4 className="font-bold text-white mb-2">⌨️ Fill in the Blank</h4>
                                            <p className="text-sm">Students type the missing word(s)</p>
                                        </div>
                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <h4 className="font-bold text-white mb-2">💬 Short Answer</h4>
                                            <p className="text-sm">Free-form text responses</p>
                                        </div>
                                    </div>
                                    <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                        <p className="text-sm"><strong className="text-blue-400">💡 Pro Tip:</strong> Set custom timer durations (default: 30s) and add YouTube music links for the final performance!</p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-lg">🎮</span>
                                    Game Controls
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p>Manage your game session with these controls:</p>
                                    <div className="space-y-3 mt-3">
                                        <div className="flex items-start gap-3">
                                            <span className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg font-bold text-sm whitespace-nowrap">START</span>
                                            <p className="text-sm">Begins the game timer and enables student answering. The first question appears on all screens.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg font-bold text-sm whitespace-nowrap">PAUSE</span>
                                            <p className="text-sm">Temporarily freezes the timer and prevents answers. Use for classroom discussions or technical issues.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg font-bold text-sm whitespace-nowrap">NEXT</span>
                                            <p className="text-sm">Manually advance to the next question. Normally automatic when timer expires, but useful for skipping.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg font-bold text-sm whitespace-nowrap">FINISH</span>
                                            <p className="text-sm">Ends the game and shows the winner podium. Results stay visible until you close the session.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <span className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg font-bold text-sm whitespace-nowrap">CLOSE</span>
                                            <p className="text-sm">Completely ends the session, clears all data, and returns to idle state. Students are disconnected.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-pink-600 flex items-center justify-center text-lg">💃</span>
                                    Dance Moves & Performance
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p>SlayGround gamifies learning with dance move rewards:</p>
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Unlock Moves:</strong> When students answer correctly, they unlock dance moves assigned to that question</li>
                                        <li><strong>Real-Time Display:</strong> The projector shows which student unlocked which move in real-time</li>
                                        <li><strong>Final Performance:</strong> After the game ends, all unlocked moves are showcased with music from the YouTube link you set</li>
                                        <li><strong>Song Parts:</strong> Each question can unlock a specific part of the choreography, building the full performance progressively</li>
                                    </ul>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-lg">🎓</span>
                                    Student Experience
                                </h3>
                                <div className="pl-13 space-y-3">
                                    <p>Understanding what students see helps you guide them:</p>
                                    <ol className="list-decimal pl-5 space-y-2">
                                        <li>Students visit <code className="bg-black/30 px-2 py-0.5 rounded">{window.location.host}/play</code> or scan the QR code</li>
                                        <li>They enter their name to join the lobby</li>
                                        <li>When you start the game, questions appear on their device</li>
                                        <li>They select/type answers before time runs out</li>
                                        <li>Correct answers earn points (speed bonus applies!)</li>
                                        <li>After all questions, the top 3 students appear on the winner podium</li>
                                        <li>The final dance performance showcases all unlocked moves</li>
                                    </ol>
                                </div>
                            </section>

                            <section className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-red-500/5 to-transparent border-red-500/20">
                                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                    <span className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-lg">⚠️</span>
                                    Troubleshooting
                                </h3>
                                <div className="pl-13 space-y-4">
                                    <div>
                                        <h4 className="font-bold text-white mb-2">❓ Students not appearing in real-time?</h4>
                                        <p className="text-sm">The system polls every 2 seconds. Wait a moment, or refresh the page. Check that students entered the correct PIN.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">❓ Projector shows blank screen?</h4>
                                        <p className="text-sm">Ensure you've initialized a game first. The projector needs an active game PIN to display content. Try refreshing the Host View tab.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">❓ Game won't start?</h4>
                                        <p className="text-sm">Make sure at least one student has joined. Check that you clicked the Play icon on a quest to generate a PIN.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">❓ Timer stuck or wrong duration?</h4>
                                        <p className="text-sm">The timer duration is set per-quest in the Quest Builder. Default is 30 seconds. Edit the quest to change it.</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white mb-2">❓ Need to reset everything?</h4>
                                        <p className="text-sm">Click <strong>Close Session</strong> to completely clear the current game. You can then start fresh with a new quest.</p>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/10 flex justify-between items-center">
                            <p className="text-slate-400 text-sm">💡 <strong>Tip:</strong> You can reopen this guide anytime from the User Manual button</p>
                            <Button variant="primary" onClick={handleCloseManual}>
                                Got it, Let's Go!
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
