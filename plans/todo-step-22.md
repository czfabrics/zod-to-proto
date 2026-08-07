# Step 22 — Document the runtime conversion table

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Add a `### Runtime` section to `.docs/5-compatibility.md` | plan | ✅ Done | `### Runtime` conversion table with the 64-bit caveat |
| 2 | Fix found while running the suite: also documents that well-known types keep their protobufjs representation | plan | ✅ Done | — |
