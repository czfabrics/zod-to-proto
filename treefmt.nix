{ pkgs, config, ... }:

{
  inherit (config.flake-root) projectRootFile;

  programs.nixpkgs-fmt.enable = true;
  programs.terraform.enable = true;
  programs.prettier.enable = true;
  ## This one compiles faster
  programs.prettier.package = pkgs.rubyPackages_3_4.prettier;
  programs.beautysh.enable = true;
  programs.yamlfmt.enable = true;

  package = pkgs.treefmt;
}
