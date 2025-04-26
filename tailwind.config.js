/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563eb', // blue-600
        secondary: '#4f46e5', // indigo-600
        accent: '#059669', // emerald-600
        warning: '#d97706', // amber-600
        error: '#dc2626', // red-600
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

