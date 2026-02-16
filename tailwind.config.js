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
                sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
};