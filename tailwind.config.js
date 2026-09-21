/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: { '2xl': '1280px' },
    },
    extend: {
      /**
       * Layering scale. Every overlay in the app references one of these tokens
       * instead of an arbitrary z-index, so stacking order is predictable:
       * page chrome (header) < backdrop < dialog/modal < popovers < toasts.
       */
      zIndex: {
        header: '40',
        overlay: '60',
        modal: '61',
        popover: '70',
        toast: '100',
      },
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        display: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        /* Brand palette — LabCare Diagnostics */
        navy: {
          50: '#eff6fc',
          100: '#dbeaf8',
          200: '#bdd8f1',
          300: '#90bde6',
          400: '#5c9bd7',
          500: '#377ec3',
          600: '#2763a5',
          700: '#214f86',
          800: '#1f436f',
          900: '#0a2540',
          950: '#061729',
        },
        teal: {
          50: '#edfcfa',
          100: '#d0f7f1',
          200: '#a3eee4',
          300: '#6dded3',
          400: '#38c6bc',
          500: '#1caaa3',
          600: '#128984',
          700: '#136e6b',
          800: '#145856',
          900: '#154a48',
          950: '#052b2b',
        },
        sand: {
          50: '#fbf9f4',
          100: '#f5f0e4',
          200: '#ebdfc6',
        },
        success: {
          50: '#effaf3',
          100: '#d8f3e2',
          500: '#16a34a',
          600: '#128040',
          700: '#0f6a36',
        },
        warning: {
          50: '#fffaeb',
          100: '#fef0c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      spacing: {
        4.5: '1.125rem',
        13: '3.25rem',
        15: '3.75rem',
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
        '3xl': 'calc(var(--radius) + 14px)',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(10 37 64 / 0.04), 0 1px 3px 0 rgb(10 37 64 / 0.06)',
        card: '0 1px 3px rgb(10 37 64 / 0.05), 0 8px 24px -12px rgb(10 37 64 / 0.12)',
        lift: '0 12px 32px -12px rgb(10 37 64 / 0.22)',
        ring: '0 0 0 1px rgb(10 37 64 / 0.06)',
        glow: '0 0 0 4px rgb(28 170 163 / 0.12)',
      },
      backgroundImage: {
        'grid-navy':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
        'hero-sheen':
          'radial-gradient(900px 500px at 12% 0%, rgba(28,170,163,0.20), transparent 60%), radial-gradient(700px 420px at 100% 10%, rgba(55,126,195,0.28), transparent 62%)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        /**
         * Dialog entrance. Deliberately does NOT touch translate() — dialogs are
         * centred by a flex wrapper, so centring must never depend on a transform
         * that an animation could overwrite. (A `scale-in` keyframe that wrote
         * `transform: scale(1)` with fill-mode `both` previously wiped out the
         * `-translate-x-1/2 -translate-y-1/2` centring utilities.)
         */
        'dialog-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'sheet-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'sheet-out-right': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'sheet-in-left': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
        'sheet-out-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'sheet-in-bottom': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        'sheet-out-bottom': {
          from: { transform: 'translateY(0)' },
          to: { transform: 'translateY(100%)' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'accordion-down': {
          from: { height: '0', opacity: '0' },
          to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { height: '0', opacity: '0' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.85)', opacity: '0.7' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'draw-line': {
          from: { strokeDashoffset: '${1000}' },
          to: { strokeDashoffset: '0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out both',
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        'dialog-in': 'dialog-in 0.18s cubic-bezier(0.22,1,0.36,1) both',
        'sheet-in-right': 'sheet-in-right 0.28s cubic-bezier(0.22,1,0.36,1) both',
        'sheet-out-right': 'sheet-out-right 0.22s cubic-bezier(0.4,0,1,1) both',
        'sheet-in-left': 'sheet-in-left 0.28s cubic-bezier(0.22,1,0.36,1) both',
        'sheet-out-left': 'sheet-out-left 0.22s cubic-bezier(0.4,0,1,1) both',
        'sheet-in-bottom': 'sheet-in-bottom 0.28s cubic-bezier(0.22,1,0.36,1) both',
        'sheet-out-bottom': 'sheet-out-bottom 0.22s cubic-bezier(0.4,0,1,1) both',
        'slide-in-right': 'slide-in-right 0.25s cubic-bezier(0.22,1,0.36,1) both',
        shimmer: 'shimmer 1.6s infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.24,0,0.38,1) infinite',
        'accordion-down': 'accordion-down 0.25s cubic-bezier(0.22,1,0.36,1)',
        'accordion-up': 'accordion-up 0.2s cubic-bezier(0.22,1,0.36,1)',
      },
    },
  },
  plugins: [],
}
