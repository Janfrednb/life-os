/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: 'rgb(var(--color-bg-0) / <alpha-value>)',
          1: 'rgb(var(--color-bg-1) / <alpha-value>)',
          2: 'rgb(var(--color-bg-2) / <alpha-value>)',
          3: 'rgb(var(--color-bg-3) / <alpha-value>)',
          4: 'rgb(var(--color-bg-4) / <alpha-value>)',
        },
        green: {
          dim: 'rgb(var(--color-green-dim) / <alpha-value>)',
          DEFAULT: 'rgb(var(--color-green) / <alpha-value>)',
          glow: 'rgb(var(--color-green-glow) / <alpha-value>)',
          pale: 'rgb(var(--color-green-pale) / <alpha-value>)',
          muted: 'rgb(var(--color-green-muted) / <alpha-value>)',
        },
        text: {
          base: 'rgb(var(--color-text-base) / <alpha-value>)',
          muted: 'rgb(var(--color-text-muted) / <alpha-value>)',
          dim: 'rgb(var(--color-text-dim) / <alpha-value>)',
        },
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        warn: 'rgb(var(--color-warn) / <alpha-value>)',
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
