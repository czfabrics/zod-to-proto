set -euo pipefail

readonly worktree_name=${args["worktree-name"]}

readonly claude_compose_file_path="$FLAKE_ROOT/dev/claude/compose.yaml"
readonly worktrees_folder_path="$FLAKE_ROOT/dev/claude/worktrees"
readonly worktree_path="$worktrees_folder_path/$worktree_name"
readonly worktree_path_in_container="/home/claude/worktrees/$worktree_name"
readonly container_name="$ORGANIZATION_NAME-claude-$worktree_name"

mkdir -p "$worktrees_folder_path"

## The upstream of whatever branch $FLAKE_ROOT is on, so a fresh worktree
## branches off the same remote branch and tracks it
source_upstream="$(git -C "$FLAKE_ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2> /dev/null || true)"
readonly source_upstream

if [[ -d "$worktree_path" ]]; then
  log "Reusing worktree $worktree_path"
elif git -C "$FLAKE_ROOT" show-ref --verify --quiet "refs/heads/$worktree_name"; then
  git -C "$FLAKE_ROOT" worktree add "$worktree_path" "$worktree_name"
elif [[ -n "$source_upstream" ]]; then
  log "Branching $worktree_name off $source_upstream"
  git -C "$FLAKE_ROOT" worktree add --track -b "$worktree_name" "$worktree_path" "$source_upstream"
else
  git -C "$FLAKE_ROOT" worktree add -b "$worktree_name" "$worktree_path"
fi

current_branch="$(git -C "$worktree_path" branch --show-current)"
readonly current_branch

upstream_ref="$(git -C "$worktree_path" rev-parse --abbrev-ref --symbolic-full-name '@{upstream}' 2> /dev/null || true)"
readonly upstream_ref

upstream_remote="$(git -C "$worktree_path" config "branch.$current_branch.remote" 2> /dev/null || true)"
readonly upstream_remote

if [[ -z "$upstream_ref" ]]; then
  log "Leaving $worktree_name where it is, it tracks no upstream"
elif [[ -n "$(git -C "$worktree_path" status --porcelain)" ]]; then
  log "Leaving $worktree_name where it is, the worktree is not clean"
else
  if [[ -n "$upstream_remote" && "$upstream_remote" != "." ]]; then
    git -C "$worktree_path" fetch "$upstream_remote"
  fi

  ## Left stopped rather than aborted on purpose: `git status` in the worktree
  ## then says what to finish, where an abort would throw the resolution away
  git -C "$worktree_path" rebase "$upstream_ref" \
    || die "Rebase of $worktree_name onto $upstream_ref stopped, finish it in $worktree_path"
fi

## Read by the compose file to mount the git directory the worktrees link to,
## which sits outside the repository whenever it is itself a linked worktree
GIT_COMMON_DIR="$(git -C "$FLAKE_ROOT" rev-parse --path-format=absolute --git-common-dir)"
export GIT_COMMON_DIR

## The container user has no GECOS name, so without these git refuses to
## commit; read once on the host rather than mounting the whole gitconfig in
readonly git_author_name="$(git -C "$FLAKE_ROOT" config --get user.name || true)"
readonly git_author_email="$(git -C "$FLAKE_ROOT" config --get user.email || true)"

docker compose --file "$claude_compose_file_path" up --detach --build proxy

container_state="$(docker container inspect --format '{{.State.Status}}' "$container_name" 2>/dev/null || true)"
readonly container_state

case "$container_state" in
  running)
    log "Attaching to $container_name"
    docker container attach "$container_name"
    exit
    ;;
  exited)
    log "Restarting $container_name"
    docker container start --attach --interactive "$container_name"
    exit
    ;;
  ## `dead`, `created`, `paused`: states a start never recovers from, unlike
  ## the empty one of no container at all, which falls through to the run
  ?*)
    log "Discarding $container_name, unusable while $container_state"
    docker container rm --force "$container_name" > /dev/null
    ;;
esac

docker compose --file "$claude_compose_file_path" \
  run --name "$container_name" --workdir "$worktree_path_in_container" \
  --env CLAUDE_CODE_OAUTH_TOKEN="$CLAUDE_CODE_OAUTH_TOKEN" \
  --env GIT_AUTHOR_NAME="$git_author_name" \
  --env GIT_AUTHOR_EMAIL="$git_author_email" \
  --env GIT_COMMITTER_NAME="$git_author_name" \
  --env GIT_COMMITTER_EMAIL="$git_author_email" \
  claude "${other_args[@]}"
