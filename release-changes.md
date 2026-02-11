# Release Changes: Upstream v2.1.1 → v2.6.2 Merge

## Branch
- **Source**: `testnet-rollout-2.6.2`
- **Target**: `testnet`
- **Upstream tag**: `v2.6.2` (292 commits)

## Major Dependency Upgrades
| Package | Before | After |
|---------|--------|-------|
| react | 18.3.1 | 19.1.4 |
| react-dom | 18.3.1 | 19.1.4 |
| next | 15.2.3 | 15.5.10 |
| typescript | 5.4.2 | 5.9.2 |
| viem | 2.23.14 | 2.41.2 |
| wagmi | 2.14.15 | 2.19.5 |
| @reown/appkit | 1.7.0 | 1.7.20 |
| valibot | 0.38.0 | 1.2.0 |
| eslint | 9.14.0 | 9.39.2 |
| @playwright/test | 1.49.0 | 1.57.0 |

## Breaking Changes
- **React 19**: Upgraded from React 18 to React 19
- **Jest → Vitest**: Testing framework migrated from Jest to Vitest
- **Node.js**: Minimum version now >=22.14.0 (was 22.11.0)
- **valibot**: Major version bump (0.x → 1.x)

## New Features (Upstream)
- Multichain aggregator support
- Flashblocks support
- ZetaChain cross-chain transactions
- Clusters universal name service
- User operations (ERC-4337) enhancements
- MegaETH support
- Address 3rd party widgets
- Hot contracts feature
- Navigation promo banners
- Homepage highlights config
- Color theme overrides
- Puzzle game badge claim
- Essential dApps feature
- Interop messages
- Specify ad banner support
- Marketplace titles customization

## New API Services
- `clusters` - Clusters API
- `multichainAggregator` - Multichain aggregator API
- `multichainStats` - Multichain stats API
- `userOps` - User operations API
- `zetachain` - ZetaChain cross-chain API
- `external` - External APIs (gas_hawk, safe)

## Env Validator Refactoring
The `deploy/tools/envs-validator/schema.ts` was refactored upstream into modular schemas:
- `schemas/apis.ts`
- `schemas/chain.ts`
- `schemas/meta.ts`
- `schemas/ui/` (homepage, navigation, footer, misc, views)
- `schemas/features/` (ads, beacon, bridged tokens, defi, marketplace, rollup, etc.)
- `schemas/services.ts`

## Fork Customizations Preserved
All 23 fork-specific customizations were preserved:

### Branding
- ✅ Logo assets (`public/assets/logo/`)
- ✅ OG image (`public/static/og_somnia.png`)
- ✅ Logo placeholder SVG (`icons/networks/logo-placeholder.svg`)
- ✅ Chart watermark with custom viewBox (`toolkit/components/charts/parts/ChartWatermark.tsx`)

### Footer
- ✅ Custom Somnia footer with somnia.network link
- ✅ Somnia Discord and Twitter links
- ✅ Removed upstream Blockscout branding links

### CI/CD
- ✅ Custom `build-push.yml` workflow
- ✅ Disabled upstream workflows (removed `.disabled` files that upstream deleted)

### Features
- ✅ EVM version labels for Solidity contract verification
- ✅ Custom block explorer URL parameter (`NEXT_PUBLIC_BLOCK_EXPLORER_URL`)
- ✅ Charts display fix (upstream also fixed, accepted upstream version)

## Conflicts Resolved (12 files)
| File | Resolution |
|------|------------|
| `configs/app/app.ts` | Kept both fork's `blockExplorerUrl` and upstream's `isPrivateMode` |
| `deploy/tools/envs-validator/schema.ts` | Accepted upstream modular refactor, kept `NEXT_PUBLIC_BLOCK_EXPLORER_URL` |
| `docs/ENVS.md` | Accepted upstream (table of contents update) |
| `lib/metadata/templates/title.ts` | Accepted upstream (dapp entity name feature) |
| `lib/web3/useAddChain.tsx` | Kept fork's `blockExplorerUrl`, used upstream's `chainConfig` pattern |
| `package.json` | Accepted upstream dependency versions |
| `toolkit/components/charts/parts/ChartWatermark.tsx` | Kept fork's viewBox, accepted upstream props/structure |
| `ui/snippets/footer/Footer.tsx` | Kept fork's Somnia footer |
| `ui/stats/ChartsWidgetsList.tsx` | Accepted upstream (removed fork's debug console.logs) |
| `ui/contractVerification/fields/ContractVerificationFieldEvmVersion.tsx` | Auto-merged (kept fork's EVM labels) |
| `.github/workflows/sync-envs-docs.yml.disabled` | Removed (deleted upstream) |
| `.github/workflows/upload-source-maps.yml.disabled` | Removed (deleted upstream) |
| `yarn.lock` | Regenerated via `yarn install` |

## Verification

- ✅ `yarn lint:tsc` — TypeScript compilation passes
- ✅ `yarn lint:eslint` — ESLint passes (0 errors, 7 pre-existing warnings in `.pw.tsx` files)
- ✅ No conflict markers remaining
- ✅ All fork customizations verified
- ✅ Pre-commit hooks passed

## Docker Build Verification

Full Docker build and smoke test passed via `scripts/test-build.sh`:

- ✅ **Docker image built** — 3-stage build (deps → builder → runner) completed successfully
- ✅ **Next.js 15.5.10 production build** — compiled in ~101s with only 2 known upstream warnings (MetaMask async-storage, es-toolkit Edge Runtime)
- ✅ **All deploy tools built** — envs-validator, feature-reporter, multichain-config-generator, essential-dapps-chains-config-generator, llms-txt-generator
- ✅ **209 icons generated** in SVG sprite
- ✅ **Container started** and serving on port 3099
- ✅ **GET /api/healthz → 200**
- ✅ **GET /api/config → 200**
- ✅ **GET / → 200**
- ✅ **Container stable** — no crash during smoke test

Build warnings (all pre-existing upstream, not introduced by merge):
- `@metamask/sdk`: Can't resolve `@react-native-async-storage/async-storage` (known MetaMask SDK issue)
- `es-toolkit/predicate/isNode.mjs`: Node.js API used in Edge Runtime (known es-toolkit issue)

## Status: READY FOR PR

All verification steps passed. The `testnet-rollout-2.6.2` branch is ready for PR to `testnet`.
