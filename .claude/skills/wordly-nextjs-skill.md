---
name: wordly-nextjs-skill
description: >
  Full-stack Next.js skill for the Wordly app. Use this whenever adding pages,
  API routes, auth flows, database models, tRPC procedures, forms, or UI
  components. Covers Next.js 16.2.7 + React 19 + Tailwind v4 + Prisma v7 +
  tRPC v11 + next-auth v5 + Zod v4 + shadcn/ui + ESLint v9 + Prettier v3
  breaking-change patterns.
---

## Stack used

| Layer         | Package(s)                                                                 |
|---------------|----------------------------------------------------------------------------|
| Framework     | `next@16.2.7`, `react@19.2.4`, `typescript@^5`                            |
| Styling       | `tailwindcss@^4`, `shadcn@^4`, `radix-ui@^1.5`, `lucide-react@^1`        |
| State         | `zustand@^5`, `@tanstack/react-query@^5`                                  |
| API           | `@trpc/server@^11`, `@trpc/client@^11`, `@trpc/react-query@^11`, `superjson@^2` |
| Auth          | `next-auth@5.0.0-beta.31`, `@auth/prisma-adapter`, `bcryptjs@^3`, `jose@^6` |
| Database      | `prisma@^7.8`, `@prisma/client@^7.8` (output → `src/generated/prisma`)   |
| Validation    | `zod@^4.4`, `react-hook-form@^7`, `@hookform/resolvers@^5`                |
| Env           | `@t3-oss/env-nextjs@^0.13`                                                |
| Tooling       | `eslint@^9`, `eslint-config-prettier@^10`, `prettier@^3`, `husky@^9`, `lint-staged@^17` |
| Testing       | `vitest@^4`, `@testing-library/react@^16`, `playwright@^1`, `msw@^2`     |

---

## Tooling

### Prettier config (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

Key choices: **no semicolons**, double quotes, trailing commas everywhere, 100-char line width.

### ESLint config (`eslint.config.mjs`)

Uses ESLint v9 flat config format. Key rules enabled:

- `@typescript-eslint/consistent-type-imports` — enforces `import type` for type-only imports
- `@typescript-eslint/no-unused-vars` — errors on unused vars, ignores `_`-prefixed ones
- `no-console` — warns on `console.log`, allows `console.warn`/`error`
- `react/jsx-curly-brace-presence` — removes unnecessary `{"text"}` in JSX
- `eslint-config-prettier` — disables all formatting rules that conflict with Prettier

### Lint-staged (runs on every `git commit`)

Staged file pipeline configured in `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md,yml,yaml}": ["prettier --write"]
}
```

Pre-commit hook runs `lint-staged` then `pnpm test --run`.

### Scripts

```bash
pnpm lint          # check only
pnpm lint:fix      # auto-fix ESLint errors
pnpm format        # prettier --write .
pnpm format:check  # prettier --check . (used in CI)
pnpm typecheck     # tsc --noEmit
```

---

## ⚠️ Breaking changes — read before writing any code

### Next.js 16 — `params` and `searchParams` are now Promises

```tsx
// WRONG — old pattern
export default function Page({ params }: { params: { slug: string } }) {
  return <h1>{params.slug}</h1>
}

// CORRECT — must await
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <h1>{slug}</h1>
}
```

Same applies to `searchParams`:
```tsx
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
}
```

### Tailwind CSS v4 — no `tailwind.config.js`

Config lives in `globals.css` via `@theme`:
```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-primary: oklch(56% 0.22 260);
  --font-sans: "Geist", sans-serif;
}
```

No `darkMode: "class"` toggle — use `@variant dark` in CSS or `dark:` prefix as before.

### Zod v4 — `error` field replaces `message` in `.string()` refinements

```ts
// WRONG (Zod v3)
z.string().min(2, { message: "Too short" })

// CORRECT (Zod v4)
z.string().min(2, { error: "Too short" })

// email() is now a standalone method, not .email()
z.email()   // top-level
z.string().email()  // still works on string schema
```

### Prisma v7 — client output path changed

The client is generated at `src/generated/prisma`, not `node_modules/@prisma/client`.

```ts
// CORRECT import
import { PrismaClient } from "@/generated/prisma"
```

### next-auth v5 — new API surface

```ts
// auth.ts — config is exported directly, not wrapped
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [...],
})

// Getting session in Server Component / Server Action:
const session = await auth()

// Route handler: src/app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST } from "@/lib/auth"
```

### tRPC v11 — `initTRPC` setup and React Query v5 integration

```ts
// No more `.transformer()` chained — pass it in initTRPC
import { initTRPC } from "@trpc/server"
import superjson from "superjson"

const t = initTRPC.context<Context>().create({ transformer: superjson })
export const router = t.router
export const publicProcedure = t.procedure
```

---

## Project setup

```bash
# Install deps
pnpm install

# Generate Prisma client (required after schema changes)
pnpm prisma generate

# Run dev server
pnpm dev

# Push schema to DB (dev only, no migration file)
pnpm prisma db push

# Create a migration
pnpm prisma migrate dev --name <name>

# Open Prisma Studio
pnpm prisma studio

# Add a shadcn component
pnpm dlx shadcn@latest add <component>

# Run tests (also runs on pre-commit via Husky)
pnpm test

# Lint + format
pnpm lint:fix
pnpm format
```

---

## File structure

Wordly uses **subdomain routing**: `admin.wordly.com` → middleware rewrites to `/admin/*` internally. One Next.js app, two domains.

```
wordly/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── middleware.ts              # admin.wordly.com → rewrites to /admin/*
│   ├── app/
│   │   ├── layout.tsx             # root layout (fonts, providers)
│   │   ├── globals.css
│   │   ├── (main)/                # wordly.com — route group, no URL prefix
│   │   │   ├── layout.tsx         # public header/footer
│   │   │   ├── page.tsx           # / → all words
│   │   │   └── words/[slug]/
│   │   │       └── page.tsx       # /words/[slug] → word detail
│   │   ├── admin/                 # admin.wordly.com (reached via middleware rewrite)
│   │   │   ├── layout.tsx         # admin shell + auth guard
│   │   │   ├── page.tsx           # admin.wordly.com/ → word manager
│   │   │   ├── login/
│   │   │   │   └── page.tsx       # admin.wordly.com/login
│   │   │   └── words/new/
│   │   │       └── page.tsx       # admin.wordly.com/words/new
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── trpc/[trpc]/route.ts
│   ├── components/
│   │   ├── ui/                    # shadcn primitives (button, input, etc.)
│   │   ├── words/                 # word-card.tsx, word-list.tsx, word-search.tsx
│   │   └── admin/                 # word-form.tsx, admin-header.tsx
│   ├── server/                    # server-only — never import in client components
│   │   ├── db/
│   │   │   └── word.queries.ts    # raw prisma calls (used by RSC + tRPC)
│   │   └── routers/
│   │       ├── word.router.ts     # public: list, bySlug
│   │       └── admin.router.ts    # protected: createWord, updateWord, deleteWord
│   ├── lib/
│   │   ├── auth.ts                # next-auth config
│   │   ├── prisma.ts              # singleton PrismaClient
│   │   ├── env.ts                 # @t3-oss/env-nextjs schema
│   │   ├── utils.ts               # cn()
│   │   └── trpc/
│   │       ├── server.ts          # initTRPC + publicProcedure + adminProcedure
│   │       ├── context.ts         # createContext (session + prisma)
│   │       ├── root.ts            # appRouter merging all sub-routers
│   │       └── client.ts          # createTRPCReact (client components only)
│   ├── hooks/
│   │   └── use-debounce.ts
│   ├── types/
│   │   └── word.ts                # Zod schemas + inferred TS types
│   └── generated/
│       └── prisma/                # Prisma client output (auto-generated, never edit)
├── .env                           # DATABASE_URL
├── .env.local                     # NEXTAUTH_SECRET, OAuth keys (gitignored)
├── .prettierrc
├── .prettierignore
├── components.json                # shadcn/ui config (style: radix-nova)
├── prisma.config.ts
├── next.config.ts
├── tsconfig.json                  # path alias: @/* → ./src/*
└── eslint.config.mjs
```

### Subdomain middleware pattern

```ts
// src/middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") ?? ""
  const isAdminSubdomain = hostname.startsWith("admin.")

  if (isAdminSubdomain) {
    const url = request.nextUrl.clone()
    const path = url.pathname === "/" ? "" : url.pathname
    url.pathname = `/admin${path}`
    return NextResponse.rewrite(url)
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
}
```

**Dev**: access admin at `localhost:3000/admin` directly (no subdomain needed).  
**Prod**: `admin.wordly.com/*` transparently rewrites to `/admin/*`.

---

## Key patterns

### Prisma singleton

```ts
// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["query"] })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Environment variables with @t3-oss/env-nextjs

```ts
// src/lib/env.ts
import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
})
```

### tRPC — router + context + HTTP handler

```ts
// src/lib/trpc/context.ts
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch"

export async function createContext(_opts: FetchCreateContextFnOptions) {
  const session = await auth()
  return { session, prisma }
}

export type Context = Awaited<ReturnType<typeof createContext>>
```

```ts
// src/lib/trpc/router.ts
import { initTRPC, TRPCError } from "@trpc/server"
import superjson from "superjson"
import { z } from "zod"
import { type Context } from "./context"

const t = initTRPC.context<Context>().create({ transformer: superjson })

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) throw new TRPCError({ code: "UNAUTHORIZED" })
  return next({ ctx: { ...ctx, session: ctx.session } })
})

export const router = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(isAuthed)

export const appRouter = router({
  // example procedure
  word: router({
    list: protectedProcedure.query(({ ctx }) =>
      ctx.prisma.word.findMany({ where: { userId: ctx.session.user.id } })
    ),
    create: protectedProcedure
      .input(z.object({ text: z.string().min(1) }))
      .mutation(({ ctx, input }) =>
        ctx.prisma.word.create({
          data: { text: input.text, userId: ctx.session.user.id },
        })
      ),
  }),
})

export type AppRouter = typeof appRouter
```

```ts
// src/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from "@trpc/server/adapters/fetch"
import { appRouter } from "@/lib/trpc/router"
import { createContext } from "@/lib/trpc/context"

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext,
  })

export { handler as GET, handler as POST }
```

```ts
// src/lib/trpc/client.ts  — use in Client Components
"use client"
import { createTRPCReact } from "@trpc/react-query"
import type { AppRouter } from "./router"

export const trpc = createTRPCReact<AppRouter>()
```

### Form with react-hook-form + Zod v4 + Server Action

```tsx
// src/components/word-form.tsx
"use client"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"

const schema = z.object({
  word: z.string().min(1, { error: "Word is required" }),
})
type FormValues = z.infer<typeof schema>

export function WordForm({ onSubmit }: { onSubmit: (v: FormValues) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2">
      <input {...register("word")} className="border rounded px-2 py-1" />
      {errors.word && <p className="text-red-500 text-sm">{errors.word.message}</p>}
      <Button type="submit">Add</Button>
    </form>
  )
}
```

### Auth — protecting a Server Component page

```tsx
// src/app/(protected)/dashboard/page.tsx
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <div>Welcome, {session.user.name}</div>
}
```

### Dynamic route page — params is a Promise

```tsx
// src/app/words/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function WordPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const word = await prisma.word.findUnique({ where: { id } })
  if (!word) notFound()
  return <h1>{word.text}</h1>
}
```

### Zustand store

```ts
// src/lib/store/word-store.ts
import { create } from "zustand"

interface WordStore {
  filter: string
  setFilter: (f: string) => void
}

export const useWordStore = create<WordStore>((set) => ({
  filter: "",
  setFilter: (filter) => set({ filter }),
}))
```

### shadcn/ui — using the cn() helper and variants

```tsx
// All shadcn components are in src/components/ui/
// Import cn from src/lib/utils.ts
import { cn } from "@/lib/utils"

// Use like this:
<div className={cn("base-class", isActive && "active-class", className)} />
```

---

## Environment variables

```bash
# .env  (checked in — non-secret base URL only)
DATABASE_URL="prisma+postgres://..."

# .env.local  (gitignored — secrets)
NEXTAUTH_SECRET="generate with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# OAuth (optional)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## Common tasks

### Add a Prisma model

1. Edit `prisma/schema.prisma`
2. `pnpm prisma migrate dev --name add_word`
3. `pnpm prisma generate` (updates `src/generated/prisma`)
4. Import from `@/generated/prisma`

### Add a new tRPC procedure

1. Add to `src/lib/trpc/router.ts` under the relevant sub-router
2. Use `protectedProcedure` for auth-gated endpoints, `publicProcedure` otherwise
3. Call from a Client Component: `trpc.word.list.useQuery()`
4. Call from a Server Component: use the Prisma client directly (no need for tRPC)

### Add a new page (App Router)

- `src/app/<route>/page.tsx` — Server Component by default
- Add `"use client"` only if you need `useState`, `useEffect`, or event handlers
- `params` must be typed as `Promise<{...}>` and awaited

### Add a shadcn/ui component

```bash
pnpm dlx shadcn@latest add dialog
# Output: src/components/ui/dialog.tsx
```

### Protect a route with middleware

```ts
// src/middleware.ts
export { auth as middleware } from "@/lib/auth"

export const config = {
  matcher: ["/dashboard/:path*", "/words/:path*"],
}
```

### Run tests

```bash
pnpm test              # vitest watch mode
pnpm test --run        # single run (used in pre-commit hook)
npx playwright test    # e2e
```

### Fix linting / formatting

```bash
pnpm lint:fix    # auto-fix ESLint errors across all files
pnpm format      # run Prettier on all files
pnpm typecheck   # TypeScript type check without emitting
```

### Add an environment variable

1. Add to `.env.local`
2. Add schema entry in `src/lib/env.ts`
3. Server vars: no prefix. Public vars: `NEXT_PUBLIC_` prefix.
