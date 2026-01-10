import { Link } from 'react-router-dom';
import { Gamepad2, Settings } from 'lucide-react';
import { Button } from './ui/Button';

export function Header() {
    return (
        <header className="fixed top-0 w-full z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-white/5"></div>
            <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10 h-20 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative w-12 h-12 bg-surface/50 rounded-xl flex items-center justify-center border border-white/20 group-hover:scale-105 transition-transform duration-500 backdrop-blur-md">
                            <Gamepad2 className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col relative justify-center h-12">
                        <span className="font-heading text-2xl font-black tracking-tight text-white leading-none group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                            SlayGround
                        </span>
                        <span className="absolute -bottom-2 left-0 text-[10px] font-bold tracking-[0.2em] text-primary uppercase opacity-0 group-hover:opacity-100 transition-all duration-300">
                            Multiplayer
                        </span>
                    </div>
                </Link>

                <nav className="flex items-center gap-4">
                    <Link to="/play">
                        <Button variant="ghost" className="hidden md:flex gap-2 text-slate-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 rounded-xl">
                            <Gamepad2 className="w-4 h-4" />
                            <span>Join Game</span>
                        </Button>
                    </Link>
                    <div className="h-8 w-px bg-white/10 hidden md:block"></div>
                    <Link to="/admin">
                        <Button variant="primary" className="rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
                            <Settings className="w-5 h-5 md:mr-2" />
                            <span className="hidden md:inline font-bold">Command Center</span>
                        </Button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
