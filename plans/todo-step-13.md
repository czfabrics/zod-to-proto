# Step 13 — Add the orchestrating `Proto3RuntimeResolver`

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `Proto3RuntimeResolver` producing grpc-js service definitions | plan | ✅ Done | prefix -> descriptor -> common imports -> resolveAll -> install -> grpc-js definitions |
| 2 | Fix found while running the suite: `Root.fromJSON` resolves eagerly, so commons are registered before `addJSON` | plan | ✅ Done | — |
