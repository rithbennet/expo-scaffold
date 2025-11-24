# Expo Scaffold

A modern Expo + React Native template with:

- Expo Router (file-based navigation)
- React Native Reusables (shared UI primitives/components)
- Feature-Sliced Design (FSD) architecture
- NativeWind (Tailwind CSS-in-RN)
- Prettier with sorted imports (Trivago plugin)
- pnpm as the package manager

## Contents

- [Requirements](#requirements)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Project Structure (FSD)](#project-structure-fsd)
- [Aliases](#aliases)
- [Styling (NativeWind)](#styling-nativewind)
- [Code Style (Prettier)](#code-style-prettier)
- [Environment Variables](#environment-variables)
- [EAS (optional)](#eas-optional)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

---

## Requirements

- Node.js LTS (recommended 18+)
- pnpm 8+
- Expo CLI (optional, you can use `pnpm expo`)
- iOS: Xcode + Simulator (macOS)
- Android: Android Studio + Emulator

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm start
# or explicitly
pnpm expo start

# Run on iOS Simulator (macOS)
pnpm ios

# Run on Android Emulator
pnpm android

# Open web (if enabled)
pnpm web
```

## Scripts

```json
{
  "scripts": {
    "start": "expo start",
    "ios": "expo run:ios",
    "android": "expo run:android",
    "web": "expo start --web",
    "lint": "prettier --check .",
    "format": "prettier --write .",
    "typecheck": "tsc --noEmit"
  }
}
```

- Use pnpm to run scripts, e.g., `pnpm format`.

## Project Structure (FSD)

Feature-Sliced Design (FSD) keeps code modular and scalable.

```
src/
  app/                       Expo Router routes
    _layout.tsx              App providers (Query, Theme, etc.)
    (tabs)/index.tsx         Example route groups
    ...                      Screens and nested routes
  widgets/            # Reusable composite UI blocks
  features/           # Business features (e.g., valuation)
    <feature>/
      ui/
      model/
      api/
      lib/
      config/
      assets/
  entities/           # Core domain entities (user, request, etc.)
  shared/             # Cross-cutting, reusable resources
    ui/               # Design-system primitives (Button, Input, etc.)
    lib/              # Utilities, hooks
    config/           # Theme, env, http client
    assets/           # Images, icons, fonts
    constants/
    types/
app/                  # For Expo Router: routes live here (e.g., app/(tabs)/index.tsx)
```

Notes:

- With Expo Router, route files live in the `app/` folder at the project root or under `src/app` depending on your setup. Keep consistent with your `tsconfig` and Metro config.
- Reusable RN components go in `src/shared/ui`. Feature-specific UI stays in `src/features/<feature>/ui`.

[See full architecture guide.](ARCHITECTURE.MD)

## Aliases

Configure TypeScript paths to simplify imports. Example:

`tsconfig.json`

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/app/*": ["src/app/*"],
      "@/pages/*": ["src/pages/*"],
      "@/widgets/*": ["src/widgets/*"],
      "@/features/*": ["src/features/*"],
      "@/entities/*": ["src/entities/*"],
      "@/shared/*": ["src/shared/*"]
    }
  }
}
```

Then import like:

```ts
import { ValuationForm } from '@/features/valuation/ui/ValuationForm';

import { Button } from '@/shared/ui/Button';
```

Make sure your bundler (Metro) resolves the same aliases if needed. With Expo + TS, the TS paths are typically enough.

## Styling (NativeWind)

- NativeWind brings Tailwind to React Native.
- Classnames live in `className` props (configured in Prettier Tailwind plugin).

Quick setup checklist:

- `nativewind` in dependencies and `tailwindcss` config present.
- A `tailwind.config.js` with RN presets.
- Add `plugins: ['prettier-plugin-tailwindcss']` to Prettier to sort Tailwind classes.

Example `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

## Code Style (Prettier)

Using Prettier + Trivago import sort + Tailwind plugin.

`prettier.config.js`

```js
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  singleQuote: true,
  bracketSameLine: true,
  trailingComma: 'es5',

  importOrder: [
    '^(react|react-native|expo(?:-[a-z-]+)?)(/.*)?$',
    '^@?\\w',
    '^@/app/(.*)$',
    '^@/pages/(.*)$',
    '^@/widgets/(.*)$',
    '^@/features/(.*)$',
    '^@/entities/(.*)$',
    '^@/shared/(.*)$',
    '^@/(.*)$',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: ['typescript', 'jsx'],

  plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'],
  tailwindAttributes: ['className'],
};
```

Run:

```bash
pnpm format
```

Tip: Avoid using ESLint’s import/order or Biome’s organizeImports if Prettier is sorting imports to prevent conflicts.

## Environment Variables

Use Expo’s env system (Expo Router is compatible).

- Public envs: prefix with `EXPO_PUBLIC_` to expose to the client.
- Access via `process.env.EXPO_PUBLIC_<NAME>`.

Example:

```env
EXPO_PUBLIC_API_URL=https://api.example.com
```

Use in code:

```ts
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

## EAS (optional)

If using EAS:

- Add `eas.json` for build profiles.
- You can stay on pnpm: EAS uses the lockfile to pick the package manager. Ensure `pnpm-lock.yaml` exists and remove other lockfiles.

## Troubleshooting

- Metro cache issues:
  ```bash
  pnpm expo start -c
  ```
- iOS build tools not found: Open Xcode once and install command line tools.
- Android licenses:
  ```bash
  sdkmanager --licenses
  ```
- TypeScript path alias errors: ensure `tsconfig.json` paths and file locations match. Restart TypeScript server/editor if needed.
- Prettier not sorting imports: verify the plugin is installed and listed in `prettier.config.js`. Ensure no other tool reorders imports.

## Contributing

- Branch off `main`
- Run `pnpm format` and `pnpm typecheck` before pushing
- Submit PR with a concise description and screenshots if UI-related

## License

MIT
