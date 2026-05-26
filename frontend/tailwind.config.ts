import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95' },
        accent:   { 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2' },
        success:  { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
        warning:  { 400: '#facc15', 500: '#eab308', 600: '#ca8a04' },
        danger:   { 400: '#f87171', 500: '#ef4444', 600: '#dc2626' },
        surface:  { 600: '#3d3d52', 700: '#2a2a3a', 800: '#1c1c27', 900: '#111118', 950: '#0a0a0f' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '24px' },
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in':  'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(139, 92, 246, 0.35)',
        'glow-success': '0 0 20px rgba(34, 197, 94, 0.30)',
      },
    },
  },
  plugins: [],
} satisfies Config
