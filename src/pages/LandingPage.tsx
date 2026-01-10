import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Trophy, Users } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function LandingPage() {
    return (
        <div className="h-screen flex flex-col items-center justify-center relative z-10 px-4 pb-0 overflow-hidden">

            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

                {/* Text Content (Left) */}
                <div className="text-center lg:text-left space-y-4 md:space-y-6 flex flex-col justify-center relative z-20">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md animate-fade-in-up mb-4 md:mb-6">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-accent animate-pulse" />
                            <span className="text-[10px] md:text-xs font-bold tracking-wider text-slate-300 uppercase">The Ultimate Classroom Battle</span>
                        </div>

                        <div className="space-y-2 md:space-y-4 relative">
                            <h1 className="text-6xl xs:text-7xl md:text-8xl lg:text-9xl font-heading font-black text-white leading-[0.85] tracking-tighter animate-fade-in-up [animation-delay:100ms]">
                                LEVEL UP <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">LEARNING.</span>
                            </h1>
                            <p className="text-sm md:text-lg text-slate-400 font-medium max-w-xl mx-auto lg:mx-0 leading-relaxed animate-fade-in-up [animation-delay:200ms] px-2 md:px-0 mt-3 md:mt-0">
                                Turn quizzes into epic multiplayer battles. Engage students with real-time feedback, streaks, and a visual aesthetic they actually love.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start animate-fade-in-up [animation-delay:300ms]">
                        <Link to="/play" className="w-full sm:w-auto">
                            <Button size="lg" variant="primary" glow className="w-full sm:min-w-[180px] text-base md:text-lg h-12 md:h-14 rounded-xl">
                                Enter Game PIN
                                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link to="/admin" className="w-full sm:w-auto">
                            <Button size="lg" variant="glass" className="w-full sm:min-w-[180px] text-base md:text-lg h-12 md:h-14 rounded-xl bg-white/5 hover:bg-white/10 border-white/10">
                                <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2 text-yellow-400" />
                                Host a Session
                            </Button>
                        </Link>
                    </div>

                    <div className="pt-2 md:pt-4 flex items-center justify-center lg:justify-start gap-4 md:gap-6 text-slate-500 animate-fade-in-up [animation-delay:400ms]">
                        <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="font-bold text-xs md:text-sm">Unlimited Players</span>
                        </div>
                        <div className="w-px h-3 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-3 h-3 md:w-4 md:h-4" />
                            <span className="font-bold text-xs md:text-sm">Free Forever</span>
                        </div>
                    </div>
                </div>

                {/* Visual Content (Right) - Mockups (Hidden on Mobile) */}
                <div className="hidden lg:flex relative group perspective-1000 animate-fade-in-up [animation-delay:200ms] items-center justify-center">

                    {/* Abstract Decorations */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse pointer-events-none"></div>

                    <div className="relative transform scale-[0.65] lg:scale-100 transition-transform duration-500">
                        {/* Host Dashboard Mockup (Back/Large) */}
                        <div className="relative z-10 glass-panel p-2 rounded-2xl transform rotate-y-[-5deg] rotate-x-[5deg] group-hover:rotate-0 transition-transform duration-700 ease-out border-white/20 shadow-2xl bg-[#0f1020]/80 w-[600px] max-w-full">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0f1020] aspect-video flex flex-col relative">
                                {/* Mock Header */}
                                <div className="h-10 border-b border-white/10 flex items-center px-4 justify-between bg-white/5">
                                    <div className="w-16 h-1.5 bg-white/10 rounded-full"></div>
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    </div>
                                </div>
                                {/* Mock Content */}
                                <div className="flex-1 flex items-center justify-center relative p-8">
                                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                    <div className="text-center space-y-4 w-full flex flex-col items-center">
                                        <div className="w-32 h-6 bg-white/10 rounded-lg"></div>
                                        <div className="grid grid-cols-2 gap-4 w-3/4">
                                            <div className="h-20 rounded-lg bg-primary/20 border border-primary/30"></div>
                                            <div className="h-20 rounded-lg bg-secondary/20 border border-secondary/30"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Student View (Front/Floating) */}
                        <div className="absolute -bottom-8 -left-4 z-20 w-40 glass-panel p-1.5 rounded-[2rem] transform rotate-y-[10deg] translate-z-12 group-hover:translate-y-[-10px] transition-transform duration-500 delay-100 shadow-2xl bg-black/80 border-white/20">
                            <div className="rounded-[1.7rem] overflow-hidden border border-white/10 bg-black aspect-[9/19] relative flex flex-col">
                                {/* Notch */}
                                <div className="absolute top-0 inset-x-0 h-5 bg-black z-20 flex justify-center">
                                    <div className="w-16 h-3.5 bg-black rounded-b-lg border-b border-x border-white/10"></div>
                                </div>
                                {/* Content */}
                                <div className="flex-1 flex flex-col items-center justify-center p-3 space-y-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-accent to-purple-600 blur-sm animate-pulse"></div>
                                    <div className="space-y-1.5 w-full">
                                        <div className="h-8 w-full bg-white/10 rounded-lg"></div>
                                        <div className="h-8 w-full bg-primary/20 rounded-lg border border-primary/40"></div>
                                        <div className="h-8 w-full bg-white/10 rounded-lg"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
