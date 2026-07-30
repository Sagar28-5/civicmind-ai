/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#7C3AED',
        accent: '#06B6D4',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        navy: '#020617',
        card: '#0F172A',
        'card-light': '#1E293B',
        glass: 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
        'gradient-hero': 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #1a0533 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(37,99,235,0.1) 0%, rgba(124,58,237,0.1) 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(37,99,235,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(37,99,235,0.6)' },
        },
      },
    },
  },
  plugins: [],
}
