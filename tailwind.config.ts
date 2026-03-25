import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Dark theme (default)
        dark: {
          primary: '#0B1120',
          secondary: '#111827',
          card: '#1A2332',
          'card-hover': '#1E2A3D',
          input: '#0F1A2A',
          sidebar: '#070D1A',
        },
        // Light theme
        light: {
          primary: '#B0B8C8',
          secondary: '#FFFFFF',
          card: '#FFFFFF',
          'card-hover': '#DDE1EA',
          input: '#C5CCDA',
        },
        border: {
          dark: '#1E2D40',
          light: '#9AA4B8',
          active: '#2A5A8A',
        },
        text: {
          primary: { dark: '#E8ECF1', light: '#000000' },
          secondary: { dark: '#8899AA', light: '#111827' },
          muted: { dark: '#556677', light: '#374151' },
        },
        accent: {
          blue: '#3B82F6',
          'blue-dark': '#1D4ED8',
          green: '#10B981',
          'green-dark': '#047857',
          orange: '#F59E0B',
          'orange-dark': '#92400E',
          red: '#EF4444',
          'red-dark': '#991B1B',
          purple: '#8B5CF6',
          'purple-dark': '#5B21B6',
          yellow: '#EAB308',
          cyan: '#06B6D4',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '18px',
      },
      animation: {
        'pulse-slow': 'pulse 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease',
        'fade-in': 'fadeIn 0.25s ease',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
