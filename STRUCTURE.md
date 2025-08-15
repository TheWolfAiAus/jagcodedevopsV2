# Project structure (Expo + expo-router)

app/ - file-based routes used by expo-router. Keep route files here (`_layout`, `+not-found`, `(tabs)/`, etc.)

src/ - application code

- components/ - UI components (ThemedText, ThemedView, etc.)
- hooks/ - React hooks (useColorScheme, useThemeColor)
- models/ - data models and DTOs
- routes/ - JS route helpers / server API wrappers
- middleware/ - middleware utilities
- index.ts - root barrel for imports using `@/...`

assets/ - fonts and images

scripts/ - helper scripts (reset-project.js)

package.json, tsconfig.json, metro.config.js - project configs

Imports should use the alias `@` from `metro.config.js`/`tsconfig.json`, e.g.:

```ts
import { ThemedText } from '@/components';
import { useColorScheme } from '@/hooks';
```

Notes:

- I added barrel files under `src/*/index.ts` to make imports consistent and to prepare for production builds.
- If you want me to move or rename large folders (e.g., `Supabase DB`), request it explicitly so I can update imports safely.
