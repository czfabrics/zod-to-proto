# Step 1 — Register the `#proto3_runtime/*` path alias

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Add `#proto3_runtime/*` -> `./src/proto3_runtime/*` to `tsconfig.alias.json` paths | plan | ✅ Done | alias added between `#proto3_processor` and `#usage` |
