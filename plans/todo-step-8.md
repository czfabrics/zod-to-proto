# Step 8 — Test the service resolver

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `proto3_runtime_service_resolver.test.ts` for keys, imports and streaming | plan | ✅ Done | 2 tests: unary + imported response, bidirectional streaming |
| 2 | Fix found while running the suite: expectations updated for the required `IMethod.comment` | plan | ✅ Done | — |
