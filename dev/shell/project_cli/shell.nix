{ pkgs, config, self }:

let
    project_cli_path = "${self}/dev/shell/project_cli";

    project_cli = pkgs.stdenv.mkDerivation {
      name = "project_cli";
      src = "${project_cli_path}";

      nativeBuildInputs = with pkgs; [
        bashly
      ];

      packages = with pkgs; [
        bashly
        ## Used to generate random id for
        ## temporary folder
        openssl
      ];

      buildPhase = ''
        bashly add completions
        bashly build --upgrade

        mkdir -p $out/bin
        mv project $out/bin/project
        ln -s project $out/bin/prj
      '';
    };

in pkgs.mkShellNoCC {
  inputsFrom = [
    config.flake-root.devShell
  ];

  shellHook = ''
    eval "$(${project_cli}/bin/project completions)"
    complete -F _project_completions prj

    export ORGANIZATION_NAME="zod-to-proto"

    ## Read by `project worktree feature`, so a token minted once with
    ## `claude setup-token` survives without exporting it by hand every session
    claude_oauth_token_env_file="$FLAKE_ROOT/.env.local"

    if [[ ! -f "$claude_oauth_token_env_file" ]]; then
      echo "# CLAUDE_CODE_OAUTH_TOKEN=" > "$claude_oauth_token_env_file"
    fi

    set -a
    source "$claude_oauth_token_env_file"
    set +a

    unset claude_oauth_token_env_file
  '';

  packages = [
    project_cli
  ];
}
