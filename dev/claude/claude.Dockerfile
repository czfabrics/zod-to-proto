FROM nixos/nix:2.31.2

## An id of its own, never the host user's: the container writes to a bind
## mount, and sharing the uid would hand it whatever else that user owns
ARG CLAUDE_UID=2394
ARG CLAUDE_GID=2394

## `/home/claude/config/.claude` is created here so the `claude_state` volume mounted
## over it inherits an ownership the unprivileged user can write to. Of the
## store, only the directory itself and `/nix/var` are handed over: the paths
## already inside it stay root owned and read only, which is also why no step
## below collects garbage
RUN printf 'experimental-features = nix-command flakes\n' >> /etc/nix/nix.conf \
  && printf 'claude:x:%s:\n' "$CLAUDE_GID" >> /etc/group \
  && printf 'claude:x:%s:%s:Claude Code:/home/claude:/bin/bash\n' "$CLAUDE_UID" "$CLAUDE_GID" >> /etc/passwd \
  && ln -sf "$(command -v bash)" /bin/bash \
  && mkdir -p /home/claude/config/.claude /etc/claude \
  && chown "$CLAUDE_UID:$CLAUDE_GID" /nix /nix/store \
  && chown -R "$CLAUDE_UID:$CLAUDE_GID" /nix/var /home/claude /etc/claude

COPY --chown=$CLAUDE_UID:$CLAUDE_GID flake.nix flake.lock /etc/claude/

USER claude

ENV HOME=/home/claude
ENV SHELL=/bin/bash
## `nix` itself stays the one from the base image, which is what `nix-shell -p`
## runs; the flake only provides the environment on top of it
ENV PATH=/home/claude/environment/bin:/nix/var/nix/profiles/default/bin:/usr/bin:/bin
ENV NIXPKGS_ALLOW_UNFREE=1

## `PATH` and `NIX_PATH` cannot hold a store hash that moves with the package
## set, so each gets a stable symlink: the out link for the environment, the
## indirect root for the nixpkgs `nix-shell -p` resolves against, which is also
## what keeps `-p` on the locked revision instead of a channel. An out link only
## ever names a build output, hence the second command for what is an input.
## The proxy stays off `PATH`, only its own service execs it by absolute path
RUN nix build --out-link /home/claude/environment 'path:/etc/claude' \
  && nix-store --realise --indirect --add-root /etc/claude/nixpkgs \
    "$(nix eval --raw 'path:/etc/claude#nixpkgsPath')" \
  && nix build --out-link /home/claude/proxy 'path:/etc/claude#proxy'

ENV NIX_PATH=nixpkgs=/etc/claude/nixpkgs

## Copied rather than mounted, and after the build above so editing them costs
## no rebuild of the environment: baking them in is what lets `up` notice a
## changed allowlist and recreate the long lived proxy, which a bind mount it
## reads once at startup would not. Left root owned, so the proxy only reads them
COPY tinyproxy.conf proxy-allowlist /etc/tinyproxy/

## Managed settings outrank every other source, which is the point: a worktree
## cannot switch the sandbox off, only add to what it already denies. Left root
## owned, so the session reads them and never writes them
COPY managed-settings.json /etc/claude-code/

## The worktrees are bind mounted from the host, so their owner never
## matches the container user
RUN git config --global --add safe.directory '*'

RUN mkdir -p /home/claude/config \
  && printf '%s\n' '{"hasCompletedOnboarding":true,"projects":{"/workspace":{"hasTrustDialogAccepted":true}}}' \
    > /home/claude/config/.claude.json

ENTRYPOINT ["claude"]
