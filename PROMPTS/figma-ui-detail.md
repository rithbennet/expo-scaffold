- Convert the selected Figma frame into React Native using Tailwind (nativewind) and our reusable components.
- Follow our folder structure and naming:
  - Place primitive building blocks in src/shared/ui as reusable components (Button, Input, Text, Card, Icon).
  - Place composite, design-agnostic blocks in src/widgets/<WidgetName>/ui.
  - If this UI belongs to a specific feature screen, create it under src/features/<feature>/ui/<ScreenName>.tsx and expose a model hook in src/features/<feature>/model if any state is needed.
  - Do not import shared/lib/apiClient or data here; accept data via props. Use only shared/ui primitives and widgets.
- Styling:
  - Use Tailwind classes (nativewind) only; no inline styles unless absolutely necessary.
  - Extract repeated style patterns into shared/ui primitives or widget-level components.
  - Respect spacing scale, radii, and colors from the theme tokens. Map Figma styles to Tailwind classes.
- Props and types:
  - Make components controlled and accessible. Define TypeScript props in the same file or in types.ts adjacent if reused.
  - Do not fetch data; accept props like loading, error, onPress, value.
- Files to produce:
  - If feature screen: src/features/<feature>/ui/<ScreenName>.tsx
  - If reusable widget: src/widgets/<WidgetName>/ui/<WidgetName>.tsx
  - If new primitive: src/shared/ui/<PrimitiveName>.tsx
  - Add index.ts files to re-export where appropriate.
- Code quality:
  - Use React.memo for pure presentational components.
  - Keep functions under 80 characters per line and format with Prettier.
  - No unused code, no TODOs left.

Starter template (paste and adapt):
```tsx
import React from 'react';
import { View, Text, Image, Pressable } from 'react-native';
import { cn } from '@/shared/lib/cn'; // optional className merge helper
// import primitives
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';

type Props = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  loading?: boolean;
  onPrimary?: () => void;
  onSecondary?: () => void;
};

export const ExampleWidget = React.memo(function ExampleWidget({
  title,
  subtitle,
  imageUrl,
  loading,
  onPrimary,
  onSecondary,
}: Props) {
  return (
    <View className="w-full rounded-2xl bg-white p-4 shadow-sm dark:bg-zinc-900">
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          className="h-40 w-full rounded-xl"
          resizeMode="cover"
        />
      ) : null}

      <View className="mt-4">
        <Text className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View className="mt-4 flex-row gap-3">
        <Button
          label="Primary"
          loading={loading}
          onPress={onPrimary}
          className="flex-1"
        />
        <Button
          variant="secondary"
          label="Secondary"
          disabled={loading}
          onPress={onSecondary}
          className="flex-1"
        />
      </View>
    </View>
  );
});
```

Checklist before submitting:
- Uses shared/ui primitives; no direct API calls.
- Tailwind classes only; matches Figma spacing/typography.
- Component placed in the correct layer (feature ui vs widget vs shared ui).
- Props cover all dynamic content; no hardcoded text except placeholders.
- File and export names match the component name.