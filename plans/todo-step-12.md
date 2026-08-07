# Step 12 — Test the codec resolver

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `proto3_runtime_codec_resolver.test.ts` for round-trip and wire compatibility | plan | ✅ Done | 6 tests: round trip, omitted optional, defaults, map keys, wire compat, nested override |
| 2 | Fix found while running the suite: wire-compat assertion normalises longs via `toObject(..., { longs: Number })` | plan | ✅ Done | — |
