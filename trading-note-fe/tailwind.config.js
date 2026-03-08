/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{ts,tsx,js,jsx}',
        './components/**/*.{ts,tsx,js,jsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#10b981',
            },
            fontFamily: {
                sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
                mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
};