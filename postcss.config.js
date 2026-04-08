module.exports = {
  plugins: [
    require('tailwindcss'),
    require('postcss-flexbugs-fixes'),
    require('autoprefixer')({
      overrideBrowserslist: ['>1%', 'last 4 versions', 'Firefox ESR', 'not dead'],
      flexbox: 'no-2009',
    }),
  ],
};