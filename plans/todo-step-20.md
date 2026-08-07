# Step 20 — Update the generated barrel

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Add barrel entries for new non-test files, drop `./src/test` | plan | ✅ Done | regenerated via `bun run prepare:index`; no `*.test.ts` entries |
