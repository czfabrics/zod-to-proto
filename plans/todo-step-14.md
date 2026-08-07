# Step 14 — Test the orchestrating resolver

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `proto3_runtime_resolver.test.ts` for definition shape and round-trip | plan | ✅ Done | 5 tests: definition shape, request round trip, Empty resolves, streaming, unbundled import throws |
| 2 | Fix found while running the suite: `Empty` stays a protobufjs message (outside the package namespace); asserted via spread | plan | ✅ Done | — |
