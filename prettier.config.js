module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',

  // FSD import groups (top to bottom)
  importOrder: [
    // 1) React/React Native/Expo built-ins
    '^(react|react-native|expo(?:-[a-z-]+)?)(/.*)?$',
    // 2) External packages (scoped/unscoped)
    '^@?\\w',
    // 3) App layers via @ alias
    '^@/app/(.*)$',
    '^@/pages/(.*)$',
    '^@/widgets/(.*)$',
    '^@/features/(.*)$',
    '^@/entities/(.*)$',
    '^@/shared/(.*)$',
    // 4) Fallback project root alias
    '^@/(.*)$',
    // 5) Relative imports
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx'],

  plugins: [
    '@trivago/prettier-plugin-sort-imports',
    'prettier-plugin-tailwindcss',
  ],

  // Tailwind config
  tailwindAttributes: ['className'],
};