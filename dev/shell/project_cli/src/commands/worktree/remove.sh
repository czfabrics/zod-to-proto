set -euo pipefail

readonly worktree_name=${args["worktree-name"]}
readonly force=${args["--force"]:-}

readonly worktrees_folder_path="$FLAKE_ROOT/dev/claude/worktrees"
readonly worktree_path="$worktrees_folder_path/$worktree_name"
readonly container_name="$ORGANIZATION_NAME-claude-$worktree_name"

## The proxy is shared by every session, so it is left running here
if docker container inspect "$container_name" > /dev/null 2>&1; then
  log "Removing container $container_name"
  docker container rm --force "$container_name" > /dev/null
else
  log "No container $container_name to remove"
fi

if [[ ! -d "$worktree_path" ]]; then
  log "No worktree $worktree_path to remove"

  git -C "$FLAKE_ROOT" worktree prune

  exit
fi

log "Removing worktree $worktree_path"

## Read before the removal takes the worktree away, and empty when it sits on a
## detached HEAD rather than on a branch
branch_name="$(git -C "$worktree_path" branch --show-current)"
readonly branch_name

if [[ -n "$force" ]]; then
  git -C "$FLAKE_ROOT" worktree remove --force "$worktree_path"
else
  git -C "$FLAKE_ROOT" worktree remove "$worktree_path" \
    || die "Worktree $worktree_path holds changes, pass --force to remove it anyway"
fi

if [[ -z "$branch_name" ]]; then
  log "No branch to remove, $worktree_name was on a detached HEAD"

  exit
fi

log "Removing branch $branch_name"

if [[ -n "$force" ]]; then
  git -C "$FLAKE_ROOT" branch --delete --force "$branch_name"
else
  git -C "$FLAKE_ROOT" branch --delete "$branch_name" \
    || log "Branch $branch_name holds unmerged commits and stays, pass --force to remove it anyway"
fi
