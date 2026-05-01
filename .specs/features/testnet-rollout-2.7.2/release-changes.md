# Release Changes: v2.6.0 → v2.7.2

**Rollout branch:** `testnet-rollout-2.7.2`
**Upstream range:** `v2.6.0` → `v2.7.2` (83 commits)
**Generated:** 2026-04-16

---

## New ENV Variables

| Variable | Type | Description | Required | Default | Version |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_ACCOUNT_AUTH_PROVIDER` | `auth0 \| dynamic` | Auth provider for user authentication | - | `auth0` | v2.7.0+ |
| `NEXT_PUBLIC_ACCOUNT_DYNAMIC_ENVIRONMENT_ID` | `string` | Dynamic project environment ID | Required if provider is `dynamic` | - | v2.7.0+ |
| `NEXT_PUBLIC_ACCOUNT_API_KEYS_BUTTON` | `boolean \| string` | Enable/disable "Add API key" button, or a URL to link it | - | `true` | v2.7.0+ |
| `NEXT_PUBLIC_API_KEYS_ALERT_MESSAGE` | `string` | Custom alert on the API keys page (HTML allowed) | - | - | v2.7.0+ |
| `NEXT_PUBLIC_API_DOCS_ALERT_MESSAGE` | `string` | Custom alert on the API documentation page (HTML allowed) | - | - | v2.7.0+ |
| `NEXT_PUBLIC_CROSS_CHAIN_TXS_ENABLED` | `boolean` | Enable cross-chain transaction tracking feature | Required for feature | - | v2.7.0+ |
| `NEXT_PUBLIC_INTERCHAIN_INDEXER_API_HOST` | `string` | Interchain indexer API service host URL | Required for feature | - | v2.7.0+ |
| `NEXT_PUBLIC_NAME_SERVICE_PROTOCOLS` | `Array<string>` | Protocol IDs used by the chain for BENS name service | - | `['ens']` | v2.7.0+ |
| `NEXT_PUBLIC_ROLLUP_LAYER_NUMBER` | `number` | Layer number of the rollup (for rollup chains only) | - | `2` | v2.7.0+ |

---

## Deprecated / Removed ENV Variables

| Variable | Replacement | Notes |
|---|---|---|
| `NEXT_PUBLIC_SAVE_ON_GAS_ENABLED` | _(none)_ | GasHawk feature fully removed |
| `NEXT_PUBLIC_ROLLUP_L1_BASE_URL` | `NEXT_PUBLIC_ROLLUP_PARENT_CHAIN` | Was deprecated in v1.38.0; now fully removed from code |
| `NEXT_PUBLIC_API_SPEC_URL` | _(none)_ | Swagger URL is now hardcoded; variable has no effect |

---

## Dependency Changes

### New Dependencies
| Package | Version | Reason |
|---|---|---|
| `@blockscout/interchain-indexer-types` | `0.0.10` | New cross-chain (interchain indexer) API types |
| `@dynamic-labs/ethereum` | `4.74.1` | Dynamic auth provider wallet support |
| `@dynamic-labs/sdk-react-core` | `4.74.1` | Dynamic auth provider React SDK |
| `@dynamic-labs/wagmi-connector` | `4.74.1` | Dynamic auth provider Wagmi connector |
| `d3-sankey` | `^0.12.3` | Sankey diagram visualization |
| `cspell` | `9.6.4` | Spell-checking (dev linting) |
| `license-report` | `6.8.1` | License audit (dev) |
| `license-report-check` | `0.1.2` | License compliance checker (dev) |

### Updated Dependencies (notable)
| Package | From | To | Notes |
|---|---|---|---|
| `@chakra-ui/react` | `3.15.0` | `3.33.0` | **Major update** — theme/component breaking changes |
| `@chakra-ui/cli` | `3.30.0` | `3.33.0` | Match Chakra version |
| `@blockscout/multichain-aggregator-types` | `1.6.3-alpha.3` | `2.1.2` | **Major bump** — new API endpoints |
| `@blockscout/tac-operation-lifecycle-types` | `0.0.1-alpha.6` | `1.1.0` | Stable release |
| `next` | `15.5.9` | `15.5.10` | Patch update (fork already at 15.5.10) |

### Removed Dependencies
| Package | Reason |
|---|---|
| `eslint-plugin-no-cyrillic-string` | Removed upstream lint rule |

### Security Overrides Added
```json
"viem/**/@noble/hashes": "1.8.0",
"@walletconnect/ethereum-provider/**/@reown/appkit/**/@noble/hashes": "1.8.0"
```

---

## Build Changes

### Dockerfile
- **Build memory doubled**: `NODE_OPTIONS --max-old-space-size` `4096` → `8192`
  - CI/CD runners need ≥8 GB RAM for the build step

### next.config.js
- **Source maps disabled**: `productionBrowserSourceMaps: true` → `false`
  - If Rollbar or Sentry relies on browser source maps for stack trace symbolication, this needs attention
- **Added `topLevelAwait` experiment**: enables top-level `await` in webpack; sets `output.environment.asyncFunction = true`

### tsconfig.json
- **TypeScript compile target**: `es6` → `es2017`
  - Enables native async/await (required for top-level await support)

### New Scripts
```bash
yarn lint:cspell          # Spell check
yarn lint:license:check   # License compliance audit
```

---

## Breaking API Changes

### BENS Name Service — Breaking URL Change
All BENS endpoints have removed the `:chainId` path parameter. This is a **backend-side** API change:

| Endpoint | Old Path | New Path |
|---|---|---|
| `addresses_lookup` | `/api/v1/:chainId/addresses:lookup` | `/api/v1/addresses:lookup` |
| `address_domain` | `/api/v1/:chainId/addresses/:address` | `/api/v1/addresses/:address` |
| `domain_info` | `/api/v1/:chainId/domains/:name` | `/api/v1/domains/:name` |
| `domain_events` | `/api/v1/:chainId/domains/:name/events` | `/api/v1/domains/:name/events` |
| `domains_lookup` | `/api/v1/:chainId/domains:lookup` | `/api/v1/domains:lookup` |
| `domain_protocols` | `/api/v1/:chainId/protocols` | `/api/v1/protocols` (renamed to `protocols`) |

> **Action required:** If BENS is enabled, the backend BENS service must support these new paths. The resource key `bens:domain_protocols` is now `bens:protocols`.

### New API Service: Interchain Indexer
New `interchainIndexer` service in `lib/api/services/interchainIndexer.ts` with endpoints:
- `messages`, `message`, `tx_messages`, `address_messages`
- `transfers`, `tx_transfers`, `address_transfers`
- `stats_daily`, `stats_common`

### New General API Endpoints
- `general:config_backend` — `/api/v2/config/backend`
- `general:tx_fhe_operations` — `/api/v2/transactions/:hash/fhe-operations`
- `general:auth_dynamic` — `/api/account/v2/authenticate_via_dynamic`

### Multichain Aggregator — New Endpoints
- `address_domains`, `address_portfolio`, `domain_protocols`, `search_check_redirect`, `chain_metrics`

---

## Theme / UI Changes

### Chakra Theme — New Semantic Tokens
- `button.primary.text` — white text on primary buttons (light + dark)
- `scrollbar.selection.bg` — text selection highlight color (`#E3CFE7` light / `#754B7D` dark)
- `input.bg.DEFAULT` — changed from `white/black` to `bg.primary` (uses theme background)

### Component API Changes

#### `Select` — `renderLabel` signature changed
```ts
// Before
renderLabel?: () => React.ReactNode;

// After
renderLabel?: (place: 'item' | 'value-text') => React.ReactNode;
```
**Affects any fork component that uses custom `renderLabel` in Select items.**

New `Select` props: `contentHeader`, `itemFilter`, `afterElement` (per item).

#### `Button` — Loading state simplified
- Custom spinner overlay removed; now uses Chakra's native `loading` prop
- `loadingText` prop removed from `ButtonProps`
- `data-loading` attribute removed; `loading` passed to `ChakraButton` directly

#### `CollapsibleList` — Type changes
```ts
// Before
text?: [string, string];

// After
text?: [React.ReactNode, React.ReactNode];
```
New `defaultExpanded?: boolean` prop.

#### `LinkOverlay` — New props
- `loading?: boolean` — disables href and shows skeleton while loading
- `noIcon?: boolean` — suppress external icon
- `iconColor?: string` — customize external icon color

---

## CSP / Middleware Changes

### Removed CSP Policies
- `gasHawk.ts` — deleted (GasHawk feature removed)
- `walletConnect.ts` — deleted (replaced by connector-type-aware policy)

### New CSP Policies
- `blockchainInteraction.ts` — replaces walletConnect; handles both `reown` (WalletConnect) and `dynamic` connectors with correct `connect-src`, `font-src`, `style-src`, `img-src`
- `nftHtmlEmbed.ts` — permissive policy for `/nft-html-embed.html` only (NFT preview sandbox)
- `ad.ts` — added Sevio (`*.adx.ws`) to `connect-src`, `script-src`, `img-src`

### Middleware
- Added `poorReputationTokens` middleware call in `middleware.ts`

### CSP Logic
- `opSuperchain` → `multichain` check in `generateCspPolicy.ts`
- NFT embed path gets its own CSP response

---

## Feature Renames / Removals

| Old Name | New Name / Status |
|---|---|
| `configs/app/features/opSuperchain.ts` | Renamed to `configs/app/features/multichain.ts` |
| `features.opSuperchain` (in app config) | `features.multichain` |
| `features.saveOnGas` | **Removed** |
| `external.gas_hawk_saving_potential` (API resource) | **Removed** |

---

## Action Items

- [ ] **Run `yarn install`** after merge — major Chakra UI bump (3.15 → 3.33) + new packages
- [ ] **Check build memory** — Dockerfile now needs ≥8 GB RAM; verify CI runner capacity
- [ ] **Review source maps**: `productionBrowserSourceMaps` is now `false`; if Rollbar/Sentry needs source maps for symbolication, evaluate alternative upload strategy
- [ ] **Remove unused ENV vars** from `.env.local` / deployment config:
  - `NEXT_PUBLIC_SAVE_ON_GAS_ENABLED`
  - `NEXT_PUBLIC_ROLLUP_L1_BASE_URL` (if set)
  - `NEXT_PUBLIC_API_SPEC_URL` (if set)
- [ ] **BENS (name service)**: If enabled, verify backend BENS service supports new URL paths (no chainId param). Update any direct API calls using `bens:domain_protocols` → `bens:protocols`
- [ ] **Account auth**: Default is `auth0` — no env change needed unless migrating to Dynamic. If migrating, set `NEXT_PUBLIC_ACCOUNT_AUTH_PROVIDER=dynamic` + `NEXT_PUBLIC_ACCOUNT_DYNAMIC_ENVIRONMENT_ID`
- [ ] **Cross-chain feature**: Off by default. Enable with `NEXT_PUBLIC_CROSS_CHAIN_TXS_ENABLED=true` + `NEXT_PUBLIC_INTERCHAIN_INDEXER_API_HOST` only if Somnia has an interchain indexer
- [ ] **Select `renderLabel` usage**: Grep fork code for `renderLabel` in Select items and update function signature to accept `place` argument
- [ ] **`opSuperchain` references**: Grep fork code for `opSuperchain` and update to `multichain`
- [ ] **Review `poorReputationTokens` middleware** — new middleware added; verify behavior is acceptable for Somnia
