
Here’s a short prompt you can use:

- Convert the selected Figma frame to React Native using Tailwind (nativewind) and our shared/ui primitives.
- Place code based on scope:
  - Feature screen: src/features/<feature>/ui/<ScreenName>.tsx
  - Reusable widget: src/widgets/<WidgetName>/ui/<WidgetName>.tsx
  - New primitive: src/shared/ui/<PrimitiveName>.tsx
- No data fetching. Accept data via typed props. Use shared/ui and widgets only.
- Use Tailwind classes (no inline styles unless necessary). Match Figma spacing/typography.
- Keep components presentational, memoized, and formatted (Prettier, 80 cols).

Starter snippet:
```tsx
import React from 'react';
import { View, Text, Image } from 'react-native';
import { Button } from '@/shared/ui/Button';

type Props = {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  loading?: boolean;
  onPrimary?: () => void;
};

export const ExampleWidget = React.memo(function ExampleWidget({
  title,
  subtitle,
  imageUrl,
  loading,
  onPrimary,
}: Props) {
  return (
    <View className="rounded-2xl bg-white p-4 dark:bg-zinc-900">
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="h-40 w-full rounded-xl" />
      ) : null}
      <Text className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </Text>
      {subtitle ? (
        <Text className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {subtitle}
        </Text>
      ) : null}
      <Button className="mt-4" label="Continue" loading={loading} onPress={onPrimary} />
    </View>
  );
});
```