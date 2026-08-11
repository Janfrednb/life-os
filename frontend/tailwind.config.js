/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#080e08',
          1: '#0f160f',
          2: '#161e16',
          3: '#1f2d1f',
          4: '#263826',
        },
        green: {
          dim: '#16a34a',
          DEFAULT: '#22c55e',
          glow: '#4ade80',
          pale: '#86efac',
          muted: '#166534',
        },
        text: {
          base: '#e2f0e2',
          muted: '#6b8f6b',
          dim: '#3d5c3d',
        },
        danger: '#ef4444',
        warn: '#f59e0b',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Mono"', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
