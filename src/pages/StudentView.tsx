import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Gamepad2, AlertCircle, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export function StudentView() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlPin = searchParams.get('pin');

    const { gamePin, joinGame } = useGameStore();

    const [pin, setPin] = useState(urlPin || gamePin || '');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = async () => {
        setError('');
        setIsJoining(true);

        if (!pin.trim() || !name.trim()) {
            setError('Please fill in all fields');
            setIsJoining(false);
            return;
        }

        const res = await joinGame(pin, name);

        if (res.success && res.studentId) {
            navigate('/play/game', { state: { name, pin, studentId: res.studentId } });
        } else {
            setError(res.error || 'Failed to join game');
        }
        setIsJoining(false);
    };

    return (
        <div className="max-w-md mx-auto h-full flex flex-col justify-center px-4 relative z-10 pb-6">

            {/* Decorative BG */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent -z-10 rounded-t-[3rem]"></div>

            <div className="text-center mb-6 animate-pop-in">
                <div className="mx-auto w-16 h-16 md:w-24 md:h-24 bg-surface rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center border-2 border-white/10 shadow-[0_0_30px_-10px_rgba(139,92,246,0.5)] rotate-3 mb-4 group hover:rotate-6 transition-transform">
                    <Gamepad2 className="w-8 h-8 md:w-12 md:h-12 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <h1 className="text-3xl md:text-4xl font-heading font-black text-white tracking-tight drop-shadow-lg">
                    JOIN QUEST
                </h1>
                <p className="text-sm md:text-base text-slate-400 font-medium">Enter mission details</p>
            </div>

            <div className="glass-panel p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] text-center space-y-4 md:space-y-6 shadow-2xl border-white/10 animate-pop-in [animation-delay:100ms] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>

                {error && (
                    <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 animate-pulse text-left">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs font-bold">{error}</p>
                    </div>
                )}

                <div className="space-y-3 md:space-y-4">
                    <div className="relative group">
                        <div className="absolute top-0 left-0 pl-4 py-3 md:py-4 flex items-center pointer-events-none h-full">
                            <span className="text-slate-500 font-bold text-[10px] md:text-xs tracking-widest uppercase bg-surface/80 px-1.5 py-0.5 rounded">PIN</span>
                        </div>
                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="0000"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-surface border-2 border-white/5 rounded-xl md:rounded-2xl py-4 md:py-6 px-4 text-center text-3xl md:text-4xl font-mono font-black tracking-[0.5em] text-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all placeholder:text-slate-700 placeholder:tracking-widest"
                        />
                    </div>

                    <div className="relative group">
                        <div className="absolute top-0 left-0 pl-4 py-3 md:py-4 flex items-center pointer-events-none h-full">
                            <span className="text-slate-500 font-bold text-[10px] md:text-xs tracking-widest uppercase bg-surface/80 px-1.5 py-0.5 rounded">AGENT</span>
                        </div>
                        <input
                            type="text"
                            placeholder="YOUR NAME"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-surface border-2 border-white/5 rounded-xl md:rounded-2xl py-4 md:py-6 px-4 pl-16 md:pl-20 text-lg md:text-xl font-bold text-white focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/20 transition-all placeholder:text-slate-600 placeholder:font-medium"
                        />
                    </div>
                </div>

                <Button
                    size="xl"
                    variant="primary"
                    glow
                    isLoading={isJoining}
                    className="w-full shadow-lg shadow-primary/30 group text-lg md:text-xl py-4 md:py-6 rounded-xl md:rounded-2xl"
                    onClick={handleJoin}
                >
                    ENTER GAME
                    {!isJoining && <ChevronRight className="w-5 h-5 md:w-6 md:h-6 ml-1 group-hover:translate-x-1 transition-transform" />}
                </Button>
            </div>

            <p className="text-center text-slate-600 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-6 md:mt-8">
                SlayGround v2.0
            </p>
        </div>
    );
}
