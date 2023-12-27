/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './public/**/*.{html,js}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'lightBg': '#f6f5e0',
        'lightText': '#110000',
        'lightPrimary': '#03dac6',
        'lightSecondary': '#000000',

        'darkBg': '#333333',
        'darkText': '#eeeedd',
        'darkPrimary': '#03dac6',
        'darkSecondary': '#9975D6 ',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
      },
    },
    animation: {
      'fade': 'fadeOut 6s ease-in-out',
    }
    },
  },
  variants: {
    scrollbar: ['rounded'],
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwind-scrollbar'),
    function ({ addVariant, theme, variants }) {
      addVariant('dark', ({ modifySelectors, separator }) => {
        modifySelectors(({ selector }) => {
          return `.${theme('dark')}${separator}${selector}`;
        });
      });

      const colorModeVariants = ['dark', 'light'];

      colorModeVariants.forEach((mode) => {
        addVariant(mode, ({ modifySelectors, separator }) => {
          modifySelectors(({ selector }) => {
            return `.${mode}${separator}${selector}`;
          });
        });
      });
    },
  ],
}

