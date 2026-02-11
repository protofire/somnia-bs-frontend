# /rollout — Merge Upstream Blockscout Frontend Release

Merge an upstream blockscout/frontend tag into a fork branch via a dedicated rollout branch.

## Usage

```
/rollout <base-branch> <upstream-tag>
```

**Examples:**
```
/rollout testnet v2.0.1
/rollout mainnet v1.38.2
```

**Arguments:**
- `$ARGUMENTS` — expects `<base-branch> <upstream-tag>` (e.g., `testnet v2.0.1`)
- `<base-branch>` — the fork branch to upgrade (e.g., `testnet`, `mainnet`)
- `<upstream-tag>` — the upstream blockscout/frontend release tag (e.g., `v2.0.1`)

## Workflow

### Phase 1: Setup

1. Parse arguments from `$ARGUMENTS` — extract `<base-branch>` and `<upstream-tag>`
2. Validate that `<base-branch>` exists at origin: `git branch -r | grep origin/<base-branch>`
3. Ensure upstream remote exists, add if missing:
   ```
   git remote add upstream git@github.com:blockscout/frontend.git 2>/dev/null
   ```
4. Fetch upstream tags: `git fetch upstream --tags`
5. Validate that `<upstream-tag>` exists: `git tag -l <upstream-tag>`
6. If tag not found, abort with error

### Phase 2: Branch Creation

7. Derive rollout branch name: `<base-branch>-rollout-<tag-without-v>` (e.g., `testnet-rollout-2.0.1`)
8. Create rollout branch from origin base: `git checkout -b <rollout-branch> origin/<base-branch>`
9. **CRITICAL**: Immediately fix tracking to avoid pushing to base branch:
   ```
   git branch --unset-upstream
   ```
10. Verify branch starts at correct commit

### Phase 3: Pre-Merge Analysis

11. Find the merge base (current upstream version the fork is based on):
    ```
    git merge-base <rollout-branch> <upstream-tag>
    ```
    Then determine the old upstream tag at the merge base:
    ```
    git describe --tags --abbrev=0 <merge-base>
    ```
    Store the result as `<old-tag>` — this is the version the fork is currently based on.
12. Count upstream commits to merge: `git log --oneline <merge-base>..<upstream-tag> | wc -l`
13. Count custom Protofire commits: `git log --oneline <merge-base>..<rollout-branch> --author="protofire\|leoni.mella\|zhiltsov.nick" | wc -l`
14. List all custom commits for reference
15. Check for post-tag hotfixes: `git tag -l '<tag-major>.<tag-minor>.*' --sort=-v:refname`
16. **Present analysis to user** — show scope and ask to proceed

> STOP: Wait for user confirmation before merging.

### Phase 4: Release Change Analysis

Analyze what changed between `<old-tag>` and `<upstream-tag>` at the application level — new env vars, deprecated config, breaking changes, dependency updates. This ensures the team knows what infrastructure/config changes to prepare before deployment.

**Step 1: ENV variable diff**

17. Diff the ENVs documentation to detect new/changed/deprecated variables:
    ```
    git diff <old-tag>..<upstream-tag> -- docs/ENVS.md
    ```
18. Scan diff for new environment variable entries, changed defaults, and deprecated variables
19. Cross-reference with `configs/app/` to see how new variables are consumed:
    ```
    git diff <old-tag>..<upstream-tag> -- configs/app/
    ```

**Step 2: Package and build dependency diff**

20. Diff package.json for dependency changes:
    ```
    git diff <old-tag>..<upstream-tag> -- package.json
    ```
21. Detect: new dependencies, removed dependencies, major version bumps
22. Diff build files:
    ```
    git diff <old-tag>..<upstream-tag> -- Dockerfile next.config.js tsconfig.json
    ```
23. Detect: Node.js version changes, new build ARGs, webpack/next config changes

**Step 3: Breaking UI/API changes**

24. Diff theme and toolkit for breaking Chakra UI changes:
    ```
    git diff <old-tag>..<upstream-tag> -- toolkit/theme/ toolkit/chakra/
    ```
25. Diff API layer for resource/endpoint changes:
    ```
    git diff <old-tag>..<upstream-tag> -- lib/api/resources.ts lib/api/services/
    ```
26. Diff middleware and CSP policies:
    ```
    git diff <old-tag>..<upstream-tag> -- middleware.ts nextjs/csp/
    ```

**Step 4: Generate report**

27. Save report to `.specs/features/<rollout-branch>/release-changes.md` with these sections:
    - **New ENV Variables** — table with: variable name, default value, description, required/optional
    - **Deprecated ENV Variables** — table with: variable name, replacement, version deprecated
    - **Dependency Changes** — new, removed, and major version bumps in package.json
    - **Build Changes** — Node.js version, Dockerfile ARGs, Next.js config changes
    - **Breaking API Changes** — new/changed API resources, endpoint changes
    - **Theme/UI Changes** — Chakra theme updates, toolkit component changes
    - **Action Items** — checklist of things to do before deployment (e.g., set env vars, update Docker image, rebuild node_modules)

28. **Present the release change report to user** and wait for acknowledgment before proceeding to merge.

> STOP: Wait for user acknowledgment of release changes before merging.

### Phase 5: Merge

29. Start merge without auto-commit: `git merge <upstream-tag> --no-commit`
30. If no conflicts, proceed to Phase 7
31. If conflicts, proceed to Phase 6

### Phase 6: Conflict Resolution

32. List all conflicting files: `git diff --name-only --diff-filter=U`
33. Categorize each conflict:

**Auto-resolve (keep fork version) when:**
- File was modified by a Protofire team member on the fork branch
- Upstream change is a non-breaking refactor, style change, or dependency bump
- CI/CD workflow files (`.github/workflows/`) — keep fork's custom workflows
- Brand/theme files (logos, colors, custom icons) — keep fork customizations

**Escalate to user when:**
- Both sides have significant logic changes in the same component
- Upstream change is a security fix
- Structural changes (new module system, renamed components, changed hook signatures)
- Breaking API resource changes in `lib/api/resources.ts`
- Package.json conflicts (need careful dependency resolution)
- `next.config.js` or `middleware.ts` changes

**Protofire team identification — check commit author email:**
- `*@protofire.io`
- `leoni.mella@gmail.com`
- `zhiltsov.nick@gmail.com`

34. For each conflict, show the user what was decided and why
35. After all conflicts resolved, verify no conflict markers remain:
    ```
    grep -rl "<<<<<<" pages/ ui/ lib/ configs/ 2>/dev/null
    ```

### Phase 7: Verification

36. Verify all Protofire custom changes are preserved in key files:
    - Use an Explore agent to check each file modified by Protofire commits
    - Key areas to verify: custom branding (icons/, public/), theme overrides (toolkit/theme/), custom components, `.github/workflows/build-push.yml`, `.env` configs
    - Report which customizations are present/missing
37. **Present verification report to user**

### Phase 8: Build Verification

38. Run TypeScript type check:
    ```
    yarn lint:tsc
    ```
39. Run ESLint:
    ```
    yarn lint:eslint
    ```
40. If type check or lint **fails**:
    - Show the failure output to the user
    - Attempt to fix obvious issues (import paths, missing types)
    - Ask whether to proceed or investigate further
41. Optionally, run Docker build if Docker is available:
    ```
    yarn build:docker
    ```
42. If build **passes**, report success and proceed to summary

> NOTE: Full Docker build requires Docker. If unavailable, `yarn lint:tsc` is the minimum verification.

### Phase 9: Commit & Push

43. Create merge commit:
    ```
    git commit -m "feat: merge upstream blockscout/frontend <upstream-tag> into <base-branch> fork"
    ```
44. Push rollout branch (NOT the base branch):
    ```
    git push -u origin <rollout-branch>
    ```
45. **NEVER push to `<base-branch>` directly**

### Phase 10: Summary

46. Print final report:
    - Rollout branch name and remote URL
    - Upstream commits merged (count)
    - Conflicts resolved (count and summary)
    - Custom changes verified (list)
    - Release changes summary (new env vars count, deprecated vars count, dependency changes count)
    - Link to release-changes.md
    - Build verification result (PASS/FAIL/SKIPPED)
    - Next steps: PR to base branch

## Safety Rules

- **NEVER** push to the base branch (`testnet`, `mainnet`, `main`)
- **NEVER** use `--force` push
- **ALWAYS** create a separate rollout branch
- **ALWAYS** unset upstream tracking immediately after branch creation
- **ALWAYS** verify Protofire custom changes are preserved before committing
- **ALWAYS** review release changes (env vars, dependencies) before merging

## Output

```
.specs/features/<rollout-branch>/
└── release-changes.md    # Release change analysis (env vars, deps, breaking changes)
```

## Key Differences from Backend Rollout

- No database migrations to analyze (frontend-only)
- ENV changes tracked via `docs/ENVS.md` (not `config/runtime.exs`)
- Build verification uses `yarn lint:tsc` + `yarn lint:eslint` (not Elixir compilation)
- Docker build uses single image (not separate API/Indexer images)
- Additional focus on Chakra UI theme/toolkit breaking changes
- Additional focus on API resource type changes in `lib/api/resources.ts`
