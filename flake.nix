{
  description = "ZodToProto project";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-26.05";
    nixpkgs-unstable.url = "github:NixOS/nixpkgs/nixpkgs-unstable";

    flake-parts.url = "github:hercules-ci/flake-parts";
    flake-root.url = "github:srid/flake-root";

    treefmt-nix = {
      url = "github:numtide/treefmt-nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = inputs @ { nixpkgs, nixpkgs-unstable, flake-parts, flake-root, treefmt-nix, self, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "aarch64-darwin" "x86_64-darwin" ];
      imports = [
        flake-root.flakeModule
        treefmt-nix.flakeModule
      ];

      perSystem = { system, pkgs, lib, config, ... }: {
        devShells = {
          default = import ./dev/shell/shell.nix { inherit system nixpkgs-unstable pkgs lib config self; };
        };

        treefmt.config = import ./treefmt.nix { inherit pkgs config; };
      };
    };
}
