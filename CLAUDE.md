# MindTab

Chrome extension & web app for goal tracking and micro journaling. Available at [mindtab.in](https://mindtab.in).

## Tech Stack

- **Framework**: Next.js 14 (App Router) with React 18
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **State**: Zustand (client) + React Query via tRPC
- **API**: tRPC 11 (type-safe RPC)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth.js with Google OAuth
- **Rich Text**: TipTap editor
- **Package Manager**: pnpm

## Project Structure

```
src/
├── app/                    # Next.js pages & route components
│   ├── _components/        # Feature components (goals/, habits/, projects/, journals)
│   ├── api/                # API routes (auth, trpc, bookmarks, reading-lists)
│   └── users/[user]/       # Public profile pages
├── server/
│   ├── api/routers/        # tRPC routers (goals, habits, journals, projects, etc.)
│   ├── api/dtos/           # Zod schemas for validation
│   ├── db/schema.ts        # Drizzle ORM schema
│   └── auth.ts             # NextAuth config
├── components/
│   ├── ui/                 # shadcn/ui components
│   └── text-editor/        # TipTap editor components
├── trpc/                   # tRPC client setup
├── lib/
│   ├── store.ts            # Zustand store
│   └── utils.ts            # Utilities
└── styles/                 # CSS files
```

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Production build
pnpm lint         # Lint with Biome (staged files)
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run migrations
pnpm db:generate  # Generate migrations
pnpm db:studio    # Open Drizzle Studio
```

## Key Conventions

- Dark mode forced by default
- All data is user-scoped (tied to userId)
- Soft deletion pattern (deletedAt timestamps)
- Path alias: `~/` maps to `src/`
- SuperJSON for tRPC serialization
- Biome for linting, Prettier for formatting
