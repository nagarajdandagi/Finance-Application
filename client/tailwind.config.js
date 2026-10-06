/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        finova: {
          navy: {
            950: '#070d18',
            900: '#0b1528',
            850: '#0f1e38',
            800: '#152848',
            700: '#1e3860',
            600: '#2c4f82',
          },
          primary: {
            DEFAULT: '#0f274a',
            hover: '#0a1a33',
            light: '#1e3b68',
          },
          accent: {
            DEFAULT: '#2563eb',
            hover: '#1d4ed8',
            light: '#3b82f6',
            subtle: '#eff6ff',
          },
          success: {
            DEFAULT: '#059669',
            light: '#10b981',
            bg: '#ecfdf5',
          },
          warning: {
            DEFAULT: '#d97706',
            light: '#f59e0b',
            bg: '#fffbeb',
          },
          danger: {
            DEFAULT: '#dc2626',
            light: '#ef4444',
            bg: '#fef2f2',
          },
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'elevated': '0 20px 25px -5px rgba(15, 39, 74, 0.1), 0 8px 10px -6px rgba(15, 39, 74, 0.04)',
      }
    },
  },
  plugins: [],
}
