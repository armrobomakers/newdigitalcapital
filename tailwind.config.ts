import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './data/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        night: '#08061c',
        ink: '#110b35',
        violet: '#7c3cff',
        neon: '#a56bff',
        gold: '#f1c268'
      },
      boxShadow: {
        glow: '0 0 45px rgba(124,60,255,.35)',
        card: '0 24px 90px rgba(0,0,0,.28)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'Times New Roman', 'serif']
      }
    }
  },
  plugins: []
};

export default config;
