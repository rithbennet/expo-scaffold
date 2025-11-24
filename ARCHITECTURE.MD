Architecture Guide: Expo Router + Feature-Sliced Design (FSD) with TanStack Query


Goals:
- Keep a clean, modular structure inspired by FSD.
- Place TanStack Query correctly: infra in shared/config, entity contracts in entities, compositions in features.
- Make routes-first development smooth with Expo Router.

Directory structure

src/
- app/                       Expo Router routes
  - _layout.tsx              App providers (Query, Theme, etc.)
  - (tabs)/index.tsx         Example route groups
  - ...                      Screens and nested routes
- widgets/                   Reusable composite UI blocks
- features/                  Business features
  - <feature>/
    - ui/                    Screens and feature widgets
    - model/                 Feature hooks, state machines, orchestration
    - api/                   Feature-specific queries/mutations (composed)
    - lib/                   Feature utilities
    - config/                Feature-level config
    - assets/
- entities/                  Core domain entities (user, request, etc.)
  - <entity>/
    - ui/                    Primitive UI tied to an entity (Avatar, Badge)
    - model/                 Domain types, keys, mappers, validation
    - api/                   Entity-level query/mutation functions and thin hooks
    - lib/                   Entity-specific helpers
    - config/                Entity-specific constants/config
    - assets/
- shared/                    Cross-cutting, reusable resources
  - ui/                      Design-system primitives (Button, Input)
  - lib/                     Utilities, hooks (apiClient, storage, form helpers)
  - config/                  Theme, env, http client, TanStack Query client
    - query/                 Query client setup, provider, persistence
  - assets/                  Images, icons, fonts
  - constants/
  - types/

Layer responsibilities

- app (routing)
  - Wrap the app in providers in app/_layout.tsx.
  - Never import business logic directly here; only mount feature UI.

- shared (infrastructure and design system)
  - Own global configuration for TanStack Query (client, provider, persistence).
  - Own apiClient, env, theme, and primitive UI components.
  - Must not depend on features or entities.

- entities (domain models)
  - Own domain types, validation, mappers, and stable query keys.
  - Provide low-level data access: query/mutation functions and optional thin hooks for that entity only.
  - No knowledge of features or routing.

- features (use-cases and flows)
  - Compose entities into workflows.
  - Implement feature-specific queries, cache keys that include feature params, and orchestration (optimistic updates, invalidation).
  - Own feature screens and UI built from widgets and shared/ui.

- widgets (composite UI)
  - Reusable blocks that combine shared/ui primitives with light logic.
  - Should not reach into shared/lib/apiClient; consume data via feature/entity hooks passed as props or composed outside.

TanStack Query placement and rules

- shared/config/query
  - client.ts: createQueryClient with defaults.
  - provider.tsx: QueryClientProvider wrapper and focus/online integration.
  - persist.ts: optional persistence for React Native via AsyncStorage.

- entities/<entity>/model/keys.ts
  - Define stable query keys per entity: entityKeys.all/list/detail(id).

- entities/<entity>/api/queries.ts
  - Export pure queryFn/mutationFn and thin hooks like useEntityQuery(id).
  - Own DTO types, mapping to domain shapes.

- features/<feature>/api/queries.ts
  - Compose multiple entity calls, add pagination/filters, or expose feature-scoped cache keys when the data shape is feature-specific.

- Invalidation logic
  - Co-locate invalidation helpers with keys in entities.
  - Features use these helpers when coordinating multi-entity updates.

Expo Router specifics

- Providers go in app/_layout.tsx so all routes are inside QueryClientProvider.
- Route files import only feature UI/hooks; avoid importing shared/lib/apiClient directly.
- Keep navigation state and URL params in the feature layer (model), not entities.

Scaffolding

1) Query client and provider

src/shared/config/query/client.ts
```ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: true,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

src/shared/config/query/provider.tsx
```tsx
import React from 'react';
import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState } from 'react-native';
import { queryClient } from './client';

function setupReactNativeIntegrations() {
  const appStateSub = AppState.addEventListener('change', state => {
    focusManager.setFocused(state === 'active');
  });
  const netSub = NetInfo.addEventListener(state => {
    onlineManager.setOnline(Boolean(state.isConnected));
  });
  return () => {
    appStateSub.remove();
    netSub();
  };
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  React.useEffect(() => setupReactNativeIntegrations(), []);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
```

Optional persistence (offline caching)

src/shared/config/query/persist.ts
```ts
import { queryClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createAsyncStoragePersistor } from '@tanstack/query-async-storage-persister';

export function enableQueryPersistence() {
  const persistor = createAsyncStoragePersistor({
    storage: AsyncStorage,
    key: 'rq-cache',
    throttleTime: 1000,
  });
  persistQueryClient({
    queryClient,
    persistor,
    maxAge: 24 * 60 * 60 * 1000,
  });
}
```

2) App layout with providers

src/app/_layout.tsx
```tsx
import React from 'react';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/shared/config/query/provider';
// import { enableQueryPersistence } from '@/shared/config/query/persist';

export default function RootLayout() {
  // React.useEffect(() => enableQueryPersistence(), []);
  return (
    <QueryProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryProvider>
  );
}
```

3) Entity example: user

src/entities/user/model/types.ts
```ts
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
};
```

src/entities/user/model/keys.ts
```ts
export const userKeys = {
  all: ['user'] as const,
  list: (params?: { q?: string }) => [...userKeys.all, 'list', params ?? {}] as const,
  detail: (id: string) => [...userKeys.all, 'detail', id] as const,
};
```

src/entities/user/model/mappers.ts
```ts
import type { User } from './types';

export function toUser(dto: any): User {
  return {
    id: String(dto.id),
    name: String(dto.name),
    email: String(dto.email),
    avatarUrl: dto.avatar_url ?? undefined,
    createdAt: new Date(dto.created_at).toISOString(),
  };
}
```

src/shared/lib/apiClient.ts
```ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  r => r,
  e => {
    // map/normalize errors if needed
    return Promise.reject(e);
  }
);
```

src/entities/user/api/queries.ts
```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { userKeys } from '../model/keys';
import { toUser } from '../model/mappers';
import type { User } from '../model/types';

async function fetchUser(id: string): Promise<User> {
  const res = await apiClient.get(`/users/${id}`);
  return toUser(res.data);
}

async function updateUser(input: { id: string; patch: Partial<User> }): Promise<User> {
  const res = await apiClient.patch(`/users/${input.id}`, input.patch);
  return toUser(res.data);
}

// Thin hooks are okay at the entity layer if they stay generic.
export function useUserQuery(id: string) {
  return useQuery({ queryKey: userKeys.detail(id), queryFn: () => fetchUser(id) });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUser,
    onSuccess: user => {
      qc.setQueryData(userKeys.detail(user.id), user);
    },
  });
}
```

4) Feature example: profile

src/features/profile/model/useProfile.ts
```ts
import { useUserQuery, useUpdateUser } from '@/entities/user/api/queries';

export function useProfile(id: string) {
  const user = useUserQuery(id);
  const update = useUpdateUser();
  const canEdit = true; // add auth logic later
  return { user, update, canEdit };
}
```

src/features/profile/ui/ProfileScreen.tsx
```tsx
import React from 'react';
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useProfile } from '../model/useProfile';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, update } = useProfile(id);

  if (user.isLoading) return <ActivityIndicator />;
  if (user.isError) return <Text>Error loading profile</Text>;

  return (
    <View>
      <Text>{user.data?.name}</Text>
      <Button
        title="Rename"
        onPress={() => update.mutate({ id, patch: { name: 'New Name' } })}
      />
    </View>
  );
}
```

5) Route file

src/app/profile/[id].tsx
```tsx
export { default } from '@/features/profile/ui/ProfileScreen';
```

Design rules and conventions

- Imports
  - app can import features and shared.
  - features can import entities, widgets, shared.
  - entities can import shared but never features or app.
  - widgets import shared, may accept feature/entity data via props.

- Query keys
  - Keep keys stable and colocated with the entity.
  - Feature-specific lists derive from entity keys but include feature params.

- Data flow
  - UI uses feature hooks.
  - Feature hooks compose entity hooks and local state.
  - Entities expose queryFns/mutationFns and optional thin hooks.
  - shared/config/query owns the QueryClient.

- Error and loading states
  - Prefer handling in feature hooks (map technical errors to user-facing).
  - Keep entity hooks technical and minimal.

- Validation and mapping
  - Validate DTOs at the boundary (entities/api) with zod or io-ts if needed.
  - Map to domain types in entities/model.

- Testing
  - Test entities/api functions as pure async functions.
  - Test feature model hooks with React Query + MSW.

- Offline and refetching
  - Use focusManager and onlineManager in provider.tsx.
  - Enable persistence if your app benefits from offline caching.

- Theming and env
  - Keep theme and env in shared/config.
  - Use EXPO_PUBLIC_... for client-side env variables.

Checklist for adding a new entity

- Create src/entities/<entity>/model/types.ts
- Create src/entities/<entity>/model/keys.ts
- Create src/entities/<entity>/model/mappers.ts
- Create src/entities/<entity>/api/queries.ts with queryFns/mutationFns and optional thin hooks
- Optional: basic UI primitives in src/entities/<entity>/ui

Checklist for adding a new feature

- Create src/features/<feature>/{ui,model,api}
- In model, compose entity hooks into a use<Feature> hook
- In api, add feature-specific queries (filters, pagination)
- In ui, build screen(s) and export from app route file

Common pitfalls

- Putting the QueryClient or apiClient inside entities: keep infra in shared/config.
- Reaching for shared/lib/apiClient from UI: go via entities or feature layer.
- Bloated entity hooks: keep them thin; push orchestration to features.
- Unstable query keys: always centralize keys and reuse.
- Circular imports: enforce layer boundaries with lint rules if possible.

FAQ

- Can entities export hooks?
  - Yes, if they are thin and generic. Complex flows belong to features.

- Where do optimistic updates go?
  - Features, since they orchestrate UX-specific behavior; entities can export minimal invalidation helpers.

- How do I share a composite UI pattern across features?
  - Put it in widgets/. Keep it data-agnostic; pass data via props or render props.

- What about SSR or web?
  - If you target web, add hydration helpers in shared/config/query and consider dehydrating queries per route. For native-only apps, SSR is typically not used.

