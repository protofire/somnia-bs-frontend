# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Blockscout frontend** fork (Somnia blockchain explorer) — a Next.js Pages Router application with 60+ routes for exploring blocks, transactions, addresses, tokens, and contracts. It uses Chakra UI v3, TanStack React Query, and TypeScript in strict mode.

## Commands

```bash
yarn dev                          # Start dev server (requires .env.local)
yarn dev:preset <name>            # Start with a preset config from configs/envs/
yarn build                        # Next.js production build
yarn lint:eslint                  # Run ESLint
yarn lint:eslint:fix              # Run ESLint with auto-fix
yarn lint:tsc                     # TypeScript type checking
yarn test:jest                    # Run Jest tests
yarn test:jest:watch              # Run Jest in watch mode
yarn test:pw                      # Run Playwright visual tests
yarn test:pw:local                # Run Playwright tests locally
```

**Node requirement:** v22.11.0 with npm 10.9.0. Uses Yarn as package manager.

## Architecture

### Pages Router (not App Router)
All routes live in `pages/`. Each page follows this pattern:
```tsx
const Page: NextPage = (props: Props) => (
  <PageNextJs pathname="/tx/[hash]" query={props.query}>
    <Transaction/>
  </PageNextJs>
);
export { base as getServerSideProps } from 'nextjs/getServerSideProps';
```
Page components are in `ui/pages/`, shared components in `ui/shared/`.

### Data Fetching
- **TanStack React Query** via `useApiQuery(resource, { pathParams, queryParams, queryOptions })` — the primary data fetching hook
- API resources are typed in `lib/api/resources.ts` with format `'service:endpoint'` (e.g., `'general:address'`)
- Service definitions in `lib/api/services/` (general, stats, rewards, bens, admin, etc.)
- WebSocket real-time updates via `lib/socket/` and `useSocketMessage()` hook
- SSR data via `getServerSideProps` (shared base in `nextjs/getServerSideProps.ts`)

### State Management
No Redux/Zustand. Uses React Context (`lib/contexts/`) + React Query for server state. Key contexts: AppContext, SettingsContext, MarketplaceContext, RewardsContext.

### Provider Stack (in `pages/_app.tsx`)
ChakraProvider → RollbarProvider → AppErrorBoundary → Web3ModalProvider → AppContextProvider → QueryClientProvider → GrowthBookProvider → ScrollDirectionProvider → SocketProvider → RewardsContextProvider → MarketplaceContextProvider → SettingsContextProvider

### Layout System
Per-page layouts via `Page.getLayout` pattern. Default layout: `ui/shared/layout/Layout.tsx` with Root > Container > NavBar > MainArea (SideBar + MainColumn) > Footer.

## Key Conventions

### Import Restrictions (enforced by ESLint)
- **dayjs**: Use `lib/date/dayjs.ts` instead of importing dayjs directly
- **Chakra components**: Many Chakra components (Button, Link, Dialog, Menu, Select, Table, Tooltip, Skeleton, etc.) must be imported from `toolkit/` wrappers, not from `@chakra-ui/react`
- **next/link**: Use `toolkit/chakra/link` instead
- **Icons**: Never import from `icons/*` directly or `@chakra-ui/icons`; use SVG icons from the `icons/` folder
- **@metamask/providers**: Must be lazy-loaded or use `useProvider` hook

### ENV Variables
- Browser-exposed vars need `NEXT_PUBLIC_` prefix
- All ENVs documented in `docs/ENVS.md` (required for runtime)
- App config lives in `configs/app/index.ts` — never use ENV vars directly in app code
- Preset configs in `configs/envs/` for different networks
- New URL-type vars must be added to CSP in `nextjs/csp/policies/app.ts`

### Testing
- Playwright visual tests use `.pw.tsx` suffix and live alongside components
- Jest for unit tests
- Use `render()` fixture from `playwright/lib` module (not `playwright/TestApp`)

### File Organization
- `ui/pages/` — full-page components matching routes
- `ui/shared/` — reusable components
- `ui/<feature>/` — feature-scoped components (address, token, tx, block, etc.)
- `lib/api/` — API layer (resources, hooks, services)
- `lib/hooks/` — custom React hooks
- `lib/contexts/` — React context providers
- `types/api/` — API response types, `types/client/` — client types, `types/views/` — view types
- `toolkit/` — Chakra UI theme customization and component wrappers
