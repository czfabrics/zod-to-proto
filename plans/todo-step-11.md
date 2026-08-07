# Step 11 — Install the JS-shape encode/decode overrides

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `Proto3RuntimeCodecResolver` installing `encode`/`decode` wrappers | plan | ✅ Done | camelCase keys, enum names, `$case` oneofs, Long->number, presence rules; scoped to the package namespace |
