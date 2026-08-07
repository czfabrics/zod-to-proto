---
name: prepare-plan
description: Prepare a detailed integration plan. Explore the codebase and the user's request, then write a structured, highly specific implementation plan to `./plans/plan.md` (overwrites existing content). Use this whenever the user asks to plan, scope, design, or break down a feature, fix, or refactor before coding — even if they don't say the word "plan".
---

# Prepare Plan Skill

Produce a **detailed** implementation plan and write it to `./plans/plan.md`.

A good plan lets another developer (or another model) execute it with zero guessing. Vague plans cause wrong implementations. Your job is to remove every guess: name the exact files, the exact symbols (functions, classes, components), the exact change, and how to confirm it's correct.

> The single most important rule: **never describe a step in one short line.** Every step must fill all the required fields below. A reader must never have to open the codebase to understand *what* to type. If you find yourself writing "update the service", stop — say which file, which function, and what the new code does.

## Workflow

### Phase 1 — Explore before writing (do not skip)

You cannot write a detailed plan from imagination. First gather real facts:

1. Read the user's request and restate the goal in your own words.
2. Open the relevant files. Find the actual function names, class names, route paths, types, and existing patterns. Copy the real names — never invent placeholders like `someFunction`.
3. List every file that will be **created** and every file that will be **modified**, with exact relative paths.
4. Find the existing convention to imitate (how are similar features structured? naming, folder layout, error handling, tests?).
5. Note dependencies between steps (what must exist before what), plus risks and edge cases.
6. Search the in-scope files for existing `TODO_FOR_LLM` comments. Each one is a task that must be completed during execution — fold every one into the plan as (part of) a step, quoting what it asks and naming its `file:line`.

If you cannot find a file or symbol you expected, say so explicitly in the plan rather than guessing.

### Phase 2 — Write the plan

First make sure the folder exists, then write the file:

1. Create the `./plans/` directory if it does not exist.
2. Write the whole plan to `./plans/plan.md` in **one** write call, overwriting any existing content. One complete write is more reliable than many small edits. If the write tool refuses because the file already exists, delete `./plans/plan.md` first, then write it fresh.

Use this exact structure. Fill **every** field — empty or one-word fields are not acceptable.

The block below is the file's content, shown inside a fence **for reference only**. When you write the file, write the content itself — do not include the outer fence, and do not wrap code sketches in their own fences. Write code sketches as plain indented lines instead, so the file contains **no nested code fences** (nested fences are the most common reason the write fails or comes out mangled).

```markdown
# Plan — [Feature / Task Name]

## Context

[3-4 sentences: what we are building, why, and what "done" looks like.]

## Analysis

[Concrete findings from exploring the codebase. Reference REAL paths and symbols, e.g.:
- "Routes are registered in `src/router/index.ts` via the `registerRoute()` helper."
- "Existing services follow the pattern in `src/services/UserService.ts` (class + injected repo)."
- "Auth is handled by the `requireAuth` middleware in `src/middleware/auth.ts`."
List the existing pattern this change should imitate.]

## Files Touched (at a glance)

| # | File | Action | One-line summary |
|---|------|--------|------------------|
| 1 | `src/...` | create | ... |
| 2 | `src/...` | modify | ... |

## Implementation Steps

[One block per step, in execution order. Dependencies first. Each step is ONE file or ONE clearly scoped change. Use the per-step template below for EVERY step — do not collapse it into a single sentence.]

### Step 1 — [short imperative name, e.g. "Add CreateOrder DTO"]

- **File:** `exact/relative/path.ext` (create | modify)
- **What:** [Precisely what changes. Name the function/class/component/type added or edited. e.g. "Add a `CreateOrderDto` class with fields `customerId: string`, `items: OrderItem[]`, `notes?: string`."]
- **How:** [The concrete approach. Mention the pattern to follow and any signature. Include a short code sketch if it removes ambiguity, e.g.:
  ```ts
  export class CreateOrderDto {
    customerId!: string;
    items!: OrderItem[];
  }
  ```]
- **Depends on:** [Step numbers that must be done first, or "none".]
- **Verify (by inspection):** [How to confirm this step is correct by reading the result — the expected observable behavior or what the changed code should look like. Do NOT prescribe a per-step test or build command; execution confirms each step by inspection and runs a single typecheck only at the very end. e.g. "The `archivedAt` column is declared `nullable: true` and defaults to `null`, matching the other `@Column` decorators in this file."]

### Step 2 — [...]

[same fields]

## Points of Attention

- [Specific risk, edge case, or architectural decision. e.g. "The `items` array must be validated as non-empty — see existing validation in `OrderValidator`."]
- [Migration / data concern, backward-compat concern, or anything that could break.]
- [Open question for the user, if any.]

## Final Verification

- [The single typecheck command to run once at the very end, e.g. `npm run build` or `tsc --noEmit`. This is the only command run during execution.]
- [Note that individual steps are confirmed by inspection during execution — no per-step test or build runs.]
```

### Phase 3 — Present and confirm

1. Show the plan to the user.
2. Ask for feedback before running `/execute-plan`.
3. If the user requests changes, update `./plans/plan.md` and show what changed.
4. Once validated, suggest running `/execute-plan` to execute it step by step.

---

## Worked Example (imitate this level of detail)

This is the standard to match. Notice that every step names real files and symbols, and includes a code sketch and a verify-by-inspection step.

```markdown
# Plan — Add "archive order" endpoint

## Context

We need an endpoint that lets staff archive an order so it disappears from the
active list but is kept for audit. Done = `POST /orders/:id/archive` flips an
`archivedAt` timestamp and the order stops appearing in `GET /orders`.

## Analysis

- Routes live in `src/router/orders.ts`, registered with `router.post(path, handler)`.
- Order logic is in `src/services/OrderService.ts` (class with injected `OrderRepository`).
- The Order entity is `src/entities/Order.ts`; it has no archive field yet.
- Listing happens in `OrderService.listActive()`, which currently returns all orders.
- Existing endpoints follow controller → service → repository; imitate that.

## Files Touched (at a glance)

| # | File | Action | One-line summary |
|---|------|--------|------------------|
| 1 | `src/entities/Order.ts` | modify | Add nullable `archivedAt` column |
| 2 | `src/services/OrderService.ts` | modify | Add `archive(id)`, filter `listActive()` |
| 3 | `src/router/orders.ts` | modify | Register `POST /orders/:id/archive` |

## Implementation Steps

### Step 1 — Add archivedAt column to Order

- **File:** `src/entities/Order.ts` (modify)
- **What:** Add a nullable `archivedAt: Date | null` column, defaulting to `null`.
- **How:** Mirror the existing `@Column` decorators in this file:
  ```ts
  @Column({ type: 'timestamp', nullable: true })
  archivedAt: Date | null = null;
  ```
- **Depends on:** none
- **Verify (by inspection):** The column is declared `nullable: true` and defaults to `null`, matching the other `@Column` decorators in this file.

### Step 2 — Add archive() and filter listActive()

- **File:** `src/services/OrderService.ts` (modify)
- **What:** Add `async archive(id: string): Promise<void>` that loads the order, sets
  `archivedAt = new Date()`, and saves it. Change `listActive()` to exclude rows where
  `archivedAt` is not null.
- **How:**
  ```ts
  async archive(id: string) {
    const order = await this.repo.findOneByOrThrow({ id });
    order.archivedAt = new Date();
    await this.repo.save(order);
  }
  ```
  In `listActive()`, add `where: { archivedAt: IsNull() }`.
- **Depends on:** Step 1
- **Verify (by inspection):** `archive()` loads, stamps `archivedAt`, then saves; `listActive()`'s query includes `where: { archivedAt: IsNull() }`.

### Step 3 — Register the route

- **File:** `src/router/orders.ts` (modify)
- **What:** Add `router.post('/orders/:id/archive', handler)` calling `orderService.archive(req.params.id)` and returning `204`.
- **How:** Follow the existing handler shape in this file; wrap in the same `requireAuth` middleware used by other write routes.
- **Depends on:** Step 2
- **Verify (by inspection):** The route is registered with `requireAuth`, calls `orderService.archive(req.params.id)`, and returns `204`, matching the other write routes in this file.

## Points of Attention

- `archivedAt` is nullable to avoid a backfill; existing rows stay active.
- If other queries also list orders (search, exports), they may need the same filter — flag for the user.

## Final Verification

- Run the typecheck once at the very end: `npm run build` (or `tsc --noEmit`); it must pass with no errors.
- Individual steps are confirmed by inspection during execution — no per-step test or build runs.
```

---

## Rules

- **Explore first.** Use real file paths and real symbol names from the codebase. Never invent placeholders.
- **Fill every field of every step.** No step may be a single line. If a field doesn't apply, write "none" — never leave it blank or vague.
- **One step = one file or one clearly scoped change.** Keep steps atomic.
- **Order by dependency.** Anything a later step needs must come earlier; record it in **Depends on**.
- **Say *what*, not just *why*.** "Add a `notes` field" — not "improve the order model". Include a short code sketch whenever it removes ambiguity.
- **Always give a Verify (by inspection) step.** Every step states how to confirm it's correct by reading the result — the expected observable behavior or what the changed code should look like. Do NOT prescribe per-step test or build commands; execution confirms by inspection and runs a single typecheck only at the very end.
- **End with a Final Verification section** naming the one typecheck command (e.g. `npm run build` or `tsc --noEmit`) that runs once at the end.
- **Write the file in one pass.** Create `./plans/` if missing, then write the full `./plans/plan.md` in a single overwrite. Use indented lines for code sketches — never nested fenced blocks — so the write stays reliable.
- **Schedule existing `TODO_FOR_LLM` tasks.** Any `TODO_FOR_LLM` comment in the in-scope code is required work; the plan must include completing it. Don't invent new ones — this skill only plans.
- **Always overwrite** `./plans/plan.md` — never append.
- **Never start implementing.** This skill only plans. Execution happens via `/execute-plan`.

## Self-check before presenting

Before showing the plan, verify each item. If any answer is "no", fix the plan first.

- [ ] Does every step name an exact file path?
- [ ] Does every step name the real function/class/component/type being touched?
- [ ] Does every step have a **How** with concrete detail (and a code sketch where useful)?
- [ ] Does every step have a **Verify (by inspection)** that names an observable behavior or expected code, with no per-step command?
- [ ] Is there a **Final Verification** section naming the single end-of-run typecheck command?
- [ ] Are steps ordered so dependencies come first?
- [ ] Could someone execute this without opening the codebase to figure out what to do?
- [ ] Did I overwrite (not append to) `./plans/plan.md`?