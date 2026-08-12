/** @type {import('tailwindcss').Config} */
module.exports = {
  // Dark mode removed — ZenU 2.0 is light mode only
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        /* ── Shadcn backward-compat ── */
        border:     'hsl(var(--border))',
        input:      'hsl(var(--input))',
        ring:       'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT:    'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT:    'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT:    'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },

        /* ── ZenU 2.0 semantic tokens ── */
        zen: {
          bg:          'hsl(var(--zen-bg))',
          'bg-subtle': 'hsl(var(--zen-bg-subtle))',
          'bg-muted':  'hsl(var(--zen-bg-muted))',

          surface:        'hsl(var(--zen-surface))',
          'surface-raised': 'hsl(var(--zen-surface-raised))',

          fg:          'hsl(var(--zen-fg))',
          'fg-muted':  'hsl(var(--zen-fg-muted))',
          'fg-subtle': 'hsl(var(--zen-fg-subtle))',
          'fg-inverse':'hsl(var(--zen-fg-inverse))',

          primary:       'hsl(var(--zen-primary))',
          'primary-hover':'hsl(var(--zen-primary-hover))',
          'primary-soft': 'hsl(var(--zen-primary-soft))',
          'primary-fg':   'hsl(var(--zen-primary-fg))',

          secondary:       'hsl(var(--zen-secondary))',
          'secondary-soft':'hsl(var(--zen-secondary-soft))',
          'secondary-fg':  'hsl(var(--zen-secondary-fg))',

          accent:       'hsl(var(--zen-accent))',
          'accent-soft':'hsl(var(--zen-accent-soft))',
          'accent-fg':  'hsl(var(--zen-accent-fg))',

          joy:       'hsl(var(--zen-joy))',
          'joy-soft':'hsl(var(--zen-joy-soft))',

          border:        'hsl(var(--zen-border))',
          'border-soft': 'hsl(var(--zen-border-soft))',
          'border-focus':'hsl(var(--zen-border-focus))',

          success:       'hsl(var(--zen-success))',
          'success-soft':'hsl(var(--zen-success-soft))',
          warning:       'hsl(var(--zen-warning))',
          'warning-soft':'hsl(var(--zen-warning-soft))',
          danger:        'hsl(var(--zen-destructive))',
          'danger-soft': 'hsl(var(--zen-destructive-soft))',
        },
      },

      borderRadius: {
        /* Shadcn backward-compat aliases */
        lg:  'var(--radius)',
        md:  'calc(var(--radius) - 2px)',
        sm:  'calc(var(--radius) - 4px)',
        /* ZenU 2.0 radius system */
        'zen-sm':   'var(--radius-sm)',
        'zen-md':   'var(--radius-md)',
        'zen-lg':   'var(--radius-lg)',
        'zen-xl':   'var(--radius-xl)',
        'zen-2xl':  'var(--radius-2xl)',
        'zen-full': 'var(--radius-full)',
      },

      boxShadow: {
        'zen-subtle':   'var(--shadow-subtle)',
        'zen-card':     'var(--shadow-card)',
        'zen-elevated': 'var(--shadow-elevated)',
        'zen-floating': 'var(--shadow-floating)',
        'zen-modal':    'var(--shadow-modal)',
      },

      fontFamily: {
        sans:  ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'system-ui', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'Times New Roman', 'serif'],
      },

      transitionTimingFunction: {
        'zen-out':    'cubic-bezier(0.16, 1, 0.3, 1)',
        'zen-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
        'zen-spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      transitionDuration: {
        'zen-fast': '100ms',
        'zen-base': '220ms',
        'zen-slow': '380ms',
      },

      keyframes: {
        'zen-fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'zen-breathe': {
          '0%,100%': { transform: 'scale(1)',    opacity: '0.85' },
          '50%':      { transform: 'scale(1.12)', opacity: '1' },
        },
        'zen-float': {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-8px)' },
        },
        'zen-shimmer': {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        'zen-pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':      { opacity: '0.65' },
        },
      },

      animation: {
        'zen-fade-up':    'zen-fade-up 380ms cubic-bezier(0.16,1,0.3,1) forwards',
        'zen-breathe':    'zen-breathe 4.5s ease-in-out infinite',
        'zen-float':      'zen-float 6s ease-in-out infinite',
        'zen-shimmer':    'zen-shimmer 1.6s ease-in-out infinite',
        'zen-pulse-soft': 'zen-pulse-soft 2.5s ease-in-out infinite',
      },

      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
        'safe-top':    'env(safe-area-inset-top, 0px)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
  ],
}