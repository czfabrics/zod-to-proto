---
name: execute-plan
description: Execute the current plan step by step with strict control. Reads `./plans/plan.md`, creates one todo file per step under `./plans/` (e.g. `todo-step-1.md`) that holds a task table for that step, then asks confirmation before each step, implements one step at a time, completes every `TODO_FOR_LLM` task found in the code, and keeps each step's task table in sync. No per-step tests or typechecks — a single typecheck runs only at the very end. Use this whenever the user wants to start implementing, carry out, or run a prepared plan.
---

# Execute Plan Skill

Drive the implementation of `./plans/plan.md` **one step at a time**, with confirmation before each step and a per-step todo file whose **task table** is kept live.

A **step** is one block from the plan's `## Implementation Steps` (one file / one scoped change). A **task** is a single unit of work inside that step — either the planned change itself, or one `TODO_FOR_LLM` comment found in the touched file(s). Each step's todo file lists its tasks in a table.

Two non-negotiable behaviors define this skill:

1. **One step, then stop and confirm.** Never run two steps without the user's go-ahead between them.
2. **`TODO_FOR_LLM` comments are tasks you MUST complete.** They are work items left in the code on purpose. When you touch a file, find every `TODO_FOR_LLM` comment in it, do exactly what it says, then delete the comment. A `TODO_FOR_LLM` left in the code is unfinished work — never ship one.

## The TODO_FOR_LLM task marker (read this first)

A `TODO_FOR_LLM` comment is an instruction for *you* to act on. Format you will encounter:

```
<comment-syntax> TODO_FOR_LLM: <the task to perform>
```

Examples:

```ts
// TODO_FOR_LLM: validate that `items` is non-empty and reject with a 400 otherwise
```
```py
# TODO_FOR_LLM: compute the real tax from `region` using the rates in config/tax.yaml
```
```jsx
{/* TODO_FOR_LLM: replace this hard-coded label with t('order.archived') */}
```

**How to handle each one:**

1. **Read it as a required task** — it tells you precisely what to implement at that spot. It becomes a row in the step's task table.
2. **Do exactly what it asks**, following the surrounding code's conventions. Don't reinterpret or skip it.
3. **Confirm by inspection** the change does what the comment intended — read the resulting code. Do NOT run tests or a build for this; a single typecheck happens once at the very end (Phase 3).
4. **Delete the comment** once the task is fully done, and set its table row to `✅ Done`. The absence of the comment is the signal that the task is complete.

**If you cannot complete a `TODO_FOR_LLM`** (missing info, blocked by another step, genuinely ambiguous): do NOT delete it and do NOT guess. Leave it in place, set its row to `⚠️ Blocked` (or `❌ Failed`) with the reason in the **Notes** column, and ask the user how to proceed.

**Never write a new `TODO_FOR_LLM`.** These comments are inbound tasks for you to finish — adding your own would look like more work to do. If you need to flag something, tell the user in chat instead.

## Workflow

### Phase 1 — Initialize the per-step todo files

1. Read `./plans/plan.md`. Extract every step from the **`## Implementation Steps`** section (the per-step blocks). If the plan only has a **`## Files Touched`** or **`## Implementation Order`** table, use that instead.
2. **Clear stale todos.** Delete any existing `./plans/todo-step-*.md` (and any legacy `./plans/todo.md`) — they may belong to a previous plan. Create `./plans/` if it does not exist.
3. **Create one file per step**, named `./plans/todo-step-<N>.md` (the `<N>` matches the step number in the plan). Each file has a header and a **task table**. Seed the table with the planned change as task #1 (Source = `plan`). If the plan already quotes `TODO_FOR_LLM` tasks for this step (with `file:line`), add a row for each now; otherwise they get added when you open the file in Phase 2. Use this exact structure:

```markdown
# Step <N> — <Step Name>

- **Plan:** <Plan Name>
- **State:** ⏳ Pending

## Tasks

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | <the planned change, one line from the plan's What/How> | plan | ⏳ Pending | — |
| 2 | <TODO_FOR_LLM text, if already known> | `file:line` | ⏳ Pending | — |
```

Column meanings:
- **#** — task number within the step.
- **Task** — what to do (the planned change, or the `TODO_FOR_LLM` instruction).
- **Source** — `plan` for the planned change, or `` `file:line` `` for a `TODO_FOR_LLM`.
- **State** — `⏳ Pending` / `🔄 Ongoing` / `✅ Done` / `⚠️ Blocked` / `❌ Failed`.
- **Notes** — short result or, for a blocked/failed task, the reason.

The header **State** is the step's overall state, rolled up from its tasks: `✅ Done` only when every task is `✅ Done`; `⚠️ Blocked` / `❌ Failed` if any task is.

### Phase 2 — Execute step by step

Repeat for each step **in order**:

1. **Announce** — show the step number, name, file(s), and what you're about to do.
2. **Confirm and wait** — ask the user to approve this step. **Do not proceed until they reply.** Never batch.
3. **Mark Ongoing** — set the header **State** to `🔄 Ongoing` in `./plans/todo-step-<N>.md`.
4. **Find the tasks** — open the target file(s) and list every `TODO_FOR_LLM` comment present. For each one not already in the table, add a row (Source = `` `file:line` ``). The table now holds the planned task plus every `TODO_FOR_LLM` task for this step.
5. **Implement** — make the planned change AND complete each `TODO_FOR_LLM` task exactly as written, following existing conventions. As you finish each task, set its row State to `✅ Done`; delete each `TODO_FOR_LLM` comment as its task is finished.
6. **Confirm by inspection (no tests)** — re-read the changed code and each handled `TODO_FOR_LLM` to confirm it does what was intended. **Do not run tests, builds, or typechecks here** — a single typecheck runs once at the end (Phase 3). Report what you changed.
7. **Update the table:**
   - All tasks done, all `TODO_FOR_LLM` completed and removed → every row `✅ Done`, header **State** = `✅ Done`.
   - A task could not be completed → set that row `⚠️ Blocked` (leave its `TODO_FOR_LLM` comment in place) with the reason in **Notes**, header **State** = `⚠️ Blocked`. Ask whether to continue or stop.
   - The step failed → set the failing row(s) `❌ Failed` with the error in **Notes**, header **State** = `❌ Failed`. Ask whether to continue or stop.

### Phase 3 — Final typecheck & completion

When all steps are done or execution stops:

1. **Run a single typecheck** of the whole project now — and only now — e.g. `npm run build`, `tsc --noEmit`, or the project's equivalent. Report the exact command and its result. If it fails, surface the errors and ask how to proceed; don't claim success you didn't check.
2. List every `./plans/todo-step-*.md` with its header **State**.
3. Summarize in chat: which steps are `✅ Done`, which are `⚠️ Blocked` or `❌ Failed`, and how many `TODO_FOR_LLM` tasks were completed in total (count `✅ Done` rows whose Source is a `file:line`).
4. Collect every unresolved `TODO_FOR_LLM` — table rows still `⚠️ Blocked` / `❌ Failed` with a `file:line` Source — and list each with its `file:line` and the **Notes** reason. If there are none, state explicitly that no `TODO_FOR_LLM` comments remain in the touched files.

---

## Worked Example (match this level of control and detail)

````markdown
**Step 2 of 3 — Add archive() and filter listActive()**
File: `src/services/OrderService.ts`
What: add `archive(id)`, exclude archived rows from `listActive()`.

Shall I proceed with step 2? (yes / skip / stop)

> [user: yes]

[./plans/todo-step-2.md → header State = 🔄 Ongoing]

Opened OrderService.ts. Task table for this step:

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Add `archive(id)`, filter `listActive()` on `IsNull()` | plan | 🔄 Ongoing | — |
| 2 | Emit `OrderArchived` after saving (see EventBus in `create()`) | `OrderService.ts:41` | ⏳ Pending | — |

Implemented the planned change AND the TODO_FOR_LLM task:

```ts
async archive(id: string) {
  const order = await this.repo.findOneByOrThrow({ id });
  order.archivedAt = new Date();
  await this.repo.save(order);
  this.eventBus.publish(new OrderArchived(order.id));   // done: TODO_FOR_LLM removed
}

async listActive() {
  return this.repo.find({ where: { archivedAt: IsNull() } });
}
```

Confirmed by inspection: `archive()` saves then publishes `OrderArchived` (mirrors `create()`); `listActive()` now filters on `IsNull()`. No tests run — typecheck deferred to the end.

[./plans/todo-step-2.md updated]

| # | Task | Source | State | Notes |
|---|------|--------|-------|-------|
| 1 | Add `archive(id)`, filter `listActive()` on `IsNull()` | plan | ✅ Done | — |
| 2 | Emit `OrderArchived` after saving | `OrderService.ts:41` | ✅ Done | comment removed |

[header State = ✅ Done]

Ready for step 3? (yes / skip / stop)
````

---

## Rules

- **Reset the per-step todos at the start** — delete old `./plans/todo-step-*.md` (and any legacy `./plans/todo.md`), then create one file per step, each with a Pending task table. Never reuse a previous plan's files.
- **Keep one task table per step file** — the planned change is task #1 (Source `plan`); each `TODO_FOR_LLM` in the touched file(s) is its own row (Source `file:line`).
- **Confirm before every step and wait** — never skip the confirmation, never run two steps back to back.
- **Complete every `TODO_FOR_LLM` task** in the files you touch, exactly as written, then delete the comment and set its row `✅ Done`. Don't skip, reinterpret, or guess.
- **Never write a new `TODO_FOR_LLM`** — they are inbound tasks, not gap markers. Flag concerns to the user in chat.
- **One step = one scoped change**, exactly as the plan defines it. Don't merge or reorder steps.
- **Keep each step's table in sync in real time** — update row and header States immediately before starting and right after finishing each task/step.
- **No per-step verification.** Don't run tests, builds, or typechecks between steps — confirm each change by inspection only. Run a single typecheck at the very end (Phase 3) and report its real result.
- **On a blocked or failed task**, leave any unfinished `TODO_FOR_LLM` in place, mark its row with the reason in Notes, report the cause, and ask whether to continue or stop.
- **Don't silently improve the plan** — if a step is wrong or impossible, stop and tell the user.

## Self-check before finishing each step

- [ ] Did I ask for confirmation and wait before implementing?
- [ ] Did I set the header **State** to `🔄 Ongoing` before, and the correct final State after?
- [ ] Does the table have a row for the planned change AND for every `TODO_FOR_LLM` in the touched file(s)?
- [ ] Did I complete every task and set each finished row to `✅ Done`?
- [ ] Did I delete each `TODO_FOR_LLM` comment whose task I finished — and leave only the ones I couldn't?
- [ ] Did I confirm by inspection only, and NOT run per-step tests/typechecks?
- [ ] Are any unfinished tasks marked `⚠️ Blocked` / `❌ Failed` with a reason in **Notes**?
- [ ] Is `./plans/todo-step-<N>.md` accurate right now?

## Self-check before finishing the whole run (Phase 3)

- [ ] Did I run exactly one final typecheck and report the command + result?
- [ ] Does every step file have a final header State (no leftover `🔄 Ongoing`)?
- [ ] Did I list all unresolved `TODO_FOR_LLM` (blocked/failed rows) with `file:line` + reason, or state that none remain?