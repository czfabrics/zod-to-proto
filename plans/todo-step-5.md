# Step 5 — Resolve a message or enum into a protobufjs type descriptor

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Create `Proto3RuntimeMessageResolver` assembling `fields` and `oneofs` | plan | ✅ Done | enum `values`; message `fields` + optional `oneofs` |
