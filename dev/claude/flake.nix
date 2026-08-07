{
  description = "Lyre Claude Code container environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs }:
    let
      supported_systems = [ "aarch64-linux" "x86_64-linux" ];
      for_each_supported_system = nixpkgs.lib.genAttrs supported_systems;

    in
    {
      ## Read by the Dockerfile to point `NIX_PATH` at the locked nixpkgs,
      ## so `nix-shell -p` resolves against the same revision
      nixpkgsPath = nixpkgs.outPath;

      packages = for_each_supported_system (system:
        let
          pkgs = import nixpkgs {
            inherit system;
            config.allowUnfree = true;
          };

        in
        {
          default = pkgs.buildEnv {
            name = "claude_container_environment";

            paths = with pkgs; [
              claude-code
              ## What the Bash sandbox is built on: bubblewrap enforces it,
              ## socat relays the traffic of its proxy
              bubblewrap
              socat

              bashInteractive
              coreutils-full
              findutils
              diffutils
              gnugrep
              gnused
              gnutar
              gawk
              gzip
              less
              file
              tree
              which
              ripgrep
              fd
              jq
              yq-go

              git
              openssh
              cacert
              curl

              python3
              nodejs
              bun
              cargo
              rustc
              clippy
              rustfmt
              cargo-make

              treefmt
              nixpkgs-fmt
              yamlfmt
              beautysh
              prettier
              bashly

              terraform
              github-cli
            ];
          };

          ## Same image, different entry point: the egress gateway the
          ## container reaches the network through
          proxy = pkgs.tinyproxy;
        });
    };
}
