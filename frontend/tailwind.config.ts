import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        card: 'var(--card)',
        'card-2': 'var(--card-2)',
        'card-3': 'var(--card-3)',
        fg: 'var(--fg)',
        'fg-2': 'var(--fg-2)',
        'fg-3': 'var(--fg-3)',
        'fg-4': 'var(--fg-4)',
        border: 'var(--border)',
        'border-2': 'var(--border-2)',
        'border-strong': 'var(--border-strong)',
        sky: {
          DEFAULT: 'var(--sky)',
          2: 'var(--sky-2)',
          soft: 'var(--sky-soft)',
          edge: 'var(--sky-edge)',
        },
        teal: {
          DEFAULT: 'var(--teal)',
          2: 'var(--teal-2)',
          soft: 'var(--teal-soft)',
          edge: 'var(--teal-edge)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          2: 'var(--amber-2)',
          soft: 'var(--amber-soft)',
          edge: 'var(--amber-edge)',
        },
        rose: 'var(--rose)',
        violet: 'var(--violet)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xs: 'var(--r-xs)',
        sm: 'var(--r-sm)',
        md: 'var(--r-md)',
        lg: 'var(--r-lg)',
        xl: 'var(--r-xl)',
        '2xl': 'var(--r-2xl)',
        pill: 'var(--r-pill)',
      },
      transitionTimingFunction: {
        fast: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        default: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
        slow: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '120ms',
        default: '180ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
