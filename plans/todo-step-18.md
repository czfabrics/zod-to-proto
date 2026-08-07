# Step 18 — Test the public entry point against real Zod schemas

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `zod_to_runtime.test.ts` round-tripping through a Zod schema | plan | ✅ Done | 3 tests: Zod-accepted round trip, snake/camel parity, `z.int()` stays a number |
