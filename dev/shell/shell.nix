{ system, nixpkgs-unstable, pkgs, lib, config, self }:

let
    unfree_unstable_pkgs = import nixpkgs-unstable {
      inherit system;
      config.allowUnfree = true;
    };

    project_cli_shell = import ./project_cli/shell.nix {
        inherit pkgs config self;
    };

in pkgs.mkShellNoCC {
  inputsFrom = [
    ## Provides $FLAKE_ROOT in dev shell
    config.flake-root.devShell
    config.treefmt.build.devShell
    project_cli_shell
  ];

  shellHook = ''
                export NIX_CONFIG="experimental-features = nix-command flakes"

                echo "
    ███████╗██╗  ██╗███████╗██╗     ██╗
    ██╔════╝██║  ██║██╔════╝██║     ██║
    ███████╗███████║█████╗  ██║     ██║
    ╚════██║██╔══██║██╔══╝  ██║     ██║
    ███████║██║  ██║███████╗███████╗███████╗
    ╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝
                "
  '';

  packages = with pkgs; [
    git
    coreutils
    bashly
    curl
  ];
}
