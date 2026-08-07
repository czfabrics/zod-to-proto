# Step 16 — Point `zodToProto` at the extracted helper

- **Plan:** `Proto3RuntimeResolver`: Proto3 definition into a `@grpc/grpc-js` runtime
- **State:** ✅ Done

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Modify `zod_to_proto.ts` to call `getFullUsageSettings()` and drop orphan imports | plan | ✅ Done | inline literal replaced; 4 orphan imports removed |
