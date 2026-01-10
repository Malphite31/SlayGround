/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#8b5cf6', // Electric Violet
                    hover: '#7c3aed',
                    glow: 'rgba(139, 92, 246, 0.5)'
                },
                secondary: {
                    DEFAULT: '#06b6d4', // Cyber Blue
                    hover: '#0891b2',
                    glow: 'rgba(6, 182, 212, 0.5)'
                },
                accent: {
                    DEFAULT: '#f472b6', // Hot Pink
                    hover: '#db2777',
                    glow: 'rgba(244, 114, 182, 0.5)'
                },
                background: '#030712', // Deep Void (Darker than slate-900)
                surface: '#111827', // Gray 900
                glass: 'rgba(17, 24, 39, 0.7)',
            },
            fontFamily: {
                heading: ['"Space Grotesk"', 'sans-serif'],
                body: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'grid-pattern': "linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
                'radial-glow': "radial-gradient(circle at center, var(--tw-gradient-stops))",
            },
            animation: {
                'bounce-slow': 'bounce 3s infinite',
                'pulse-fast': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'grid-flow': 'grid-flow 20s linear infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 10px -5px var(--tw-shadow-color)' },
                    'to': { boxShadow: '0 0 25px 5px var(--tw-shadow-color)' },
                },
                'grid-flow': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(40px)' },
                }
            }
        },
    },
    plugins: [],
}
