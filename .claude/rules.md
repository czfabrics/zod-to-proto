# Rules

Add new rules below as their own subsection — this file is already imported from
`CLAUDE.md`, so nothing else needs to change for a new rule to take effect.

## Comments

- **Write no comments by default.** The code is expected to document itself: a well-named
  function, variable, or class is enough. Never add a comment that restates what the code
  already says, nor JSDoc/docblocks on top of a self-explanatory member.
- **The only accepted exceptions** are things a reader cannot deduce from the code itself:
  a side effect, a non-obvious external constraint, a deliberate workaround. One short
  line each, and one line only — a constraint that needs a paragraph to state is
  documentation, so write it in `docs/` and let the comment name that file if it must
  point somewhere.
- **Why a change was made goes in the commit message, never in a comment.** Justifying an
  edit, recalling what the code used to do, or arguing for a decision reads as an exception
  above, but it is not one: the history already carries it, and the comment is stale noise
  the moment the next change lands.
- Don't remove existing comments as a drive-by; this rule governs the comments you write.

## Nix packages

- **A missing package is brought in with `nix-shell -p`, and with nothing else.** Not
  `nix profile install`, not `nix-env -i`, not `nix-channel --add`, not `nix shell` against
  a registry: each of those either escapes the revision the repository pins or drags in a
  channel nobody asked for.
- Use it inline — `nix-shell -p <package> --run '<command>'` — so nothing outlives the
  command that needed it. Nothing prompts for it, and `--run` carries a command no
  permission rule ever reads, so this rule is the only check there is: say what you
  are about to run and why, rather than retrying it in another shape.
- **A package needed on every run belongs in `dev/claude/flake.nix`**, not in a
  `nix-shell` invocation repeated by hand.
- **Never refresh a pin.** `nix flake update`, `nix flake lock`, and editing a `flake.lock`
  are the operator's call, exactly like `terraform apply`.

## Documentation

- **A change is unfinished while the documentation still describes the old behaviour.**
  Before calling any task done, look for what you just invalidated — a step, a path, a
  port, a command, a prerequisite, an ordering — and correct it in the same commit.
- **Search rather than recall.** Grep the value you changed across the documentation
  instead of trusting your memory of where it appears; a stale port in a setup guide costs
  a debugging session that the code itself would never have caused.
- New behaviour reachable by hand needs its steps written down, in the guide a reader
  already follows, not in a new document beside it. A `docs/` file explains a step, it
  never stands in for one.

## README and `docs/`

- **`README.md` is what a reader runs the repository with, not what explains it.** A
  section holds the commands, the arguments they take, the files involved, and the traps
  that bite on a first run — nothing past that. Wrap at 80 columns.
- **Rationale is not part of that.** Why a mount is shaped the way it is, what the
  rejected alternative would have cost, how a mechanism works underneath: none of it
  helps the reader typing the command, and all of it buries what would. It goes in
  `docs/`.
- **Cut rather than smooth.** A sentence that restates its neighbour, qualifies a case
  nobody meets, or argues a decision already made is noise, and rephrasing it keeps the
  noise. Adding a paragraph to a section is a reason to check whether the section still
  earns the ones it has.
- **Depth lives in `docs/<subject>.md`, linked once from the section it belongs to.** One
  file per subject, named after it in snake_case, written when an explanation outgrows
  the README and not before. Length is free there — that is what the split buys.

## Commits

- **One concern per commit.** A new command, a change to how an existing one behaves and a
  rename are three commits however small each is: a commit is what gets reverted, bisected
  and read back months later, and a mixed one leaves the reader to separate what the author
  did not.
- **A rename or a move is its own commit, with nothing else in it.** Git then reports it as
  a rename rather than a rewrite, and the commit that changes behaviour stays a diff worth
  reading.
- **Documentation travels with the change it describes, in that same commit.** The
  `Documentation` rule above is not an exception to this one, it is what makes a commit
  whole.
- **Order them so every commit leaves the repository working.** A rename landing after the
  commit that already used the new path, or a command registered before the file that runs
  it, is a history nobody can bisect.
