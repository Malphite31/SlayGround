import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Play, Pause, SkipForward, Trash2, Edit, Users, Presentation, Copy, Scan } from 'lucide-react';
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
        removeBots,
        isQRVisible, // Added
        toggleQR // Added
    } = useGameStore();

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



    const handleToggleQR = () => {
        toggleQR(!isQRVisible);
    };



    const handleClearBots = () => {
        if (confirm('Remove all simulated bots?')) {
            removeBots();
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

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple hardcoded key for now - can be moved to env/store
        if (password === '1234' || password === 'admin') {
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
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-400 hover:text-white hover:bg-white/5 border border-white/5 hover:border-white/10 rounded-lg md:rounded-xl text-xs md:text-base h-8 md:h-10 px-3 md:px-4">
                        <span className="hidden md:inline">Log Out</span>
                        <span className="md:hidden">Exit</span>
                    </Button>
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

                            <Button
                                variant={isQRVisible ? "primary" : "ghost"}
                                onClick={handleToggleQR}
                                className={`rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 ${isQRVisible ? 'bg-secondary hover:bg-secondary/90 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5 bg-black/20'}`}
                            >
                                <Scan className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                {isQRVisible ? 'Hide' : 'QR'}
                            </Button>

                            <Button variant="ghost" onClick={handleCopyLink} className="rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 text-slate-400 hover:text-white hover:bg-white/5 bg-black/20">
                                <Copy className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                Link
                            </Button>

                            <div className="h-6 md:h-8 w-px bg-white/10 mx-1 md:mx-2 flex-shrink-0"></div>


                            <Button variant="ghost" onClick={handleClearBots} className="rounded-lg md:rounded-xl h-9 md:h-10 text-xs md:text-sm px-3 md:px-4 flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 bg-black/20 border-dashed border border-red-500/20">
                                <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                                Clear
                            </Button>
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
        </div>
    );
}
