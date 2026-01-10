import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "variant"> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'glass';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
    glow?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, glow = true, children, ...props }, ref) => {

        const variantStyles = {
            primary: 'bg-primary text-white border border-primary-hover shadow-[0_0_15px_-3px_rgba(139,92,246,0.5)] hover:bg-primary-hover hover:shadow-[0_0_25px_-5px_theme(\'colors.primary.DEFAULT\')]',
            secondary: 'bg-secondary text-white border border-secondary-hover shadow-[0_0_15px_-3px_rgba(6,182,212,0.5)] hover:bg-secondary-hover hover:shadow-[0_0_25px_-5px_theme(\'colors.secondary.DEFAULT\')]',
            accent: 'bg-accent text-white border border-accent-hover shadow-[0_0_15px_-3px_rgba(244,114,182,0.5)] hover:bg-accent-hover hover:shadow-[0_0_25px_-5px_theme(\'colors.accent.DEFAULT\')]',
            outline: 'bg-transparent border-2 border-white/20 text-white hover:bg-white/5 hover:border-white/40 shadow-none hover:shadow-[0_0_15px_-5px_rgba(255,255,255,0.2)]',
            ghost: 'bg-transparent text-slate-300 hover:text-white hover:bg-white/5 shadow-none',
            glass: 'bg-surface/30 backdrop-blur-md border border-white/10 text-white hover:bg-surface/50 hover:border-white/30 shadow-lg hover:shadow-xl',
        };

        const sizeStyles = {
            sm: 'px-4 py-2 text-sm rounded-lg',
            md: 'px-6 py-3 text-base rounded-xl',
            lg: 'px-8 py-4 text-lg font-bold rounded-2xl',
            xl: 'px-10 py-5 text-2xl font-black rounded-3xl',
        };

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    'font-heading font-medium transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group',
                    variantStyles[variant],
                    sizeStyles[size],
                    isLoading && 'opacity-70 cursor-wait pointer-events-none',
                    className
                )}
                {...props}
            >
                {/* Glow Effect */}
                {glow && variant !== 'ghost' && variant !== 'outline' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:animate-shine" />
                )}

                {isLoading ? (
                    <>
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Loading...</span>
                    </>
                ) : children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
