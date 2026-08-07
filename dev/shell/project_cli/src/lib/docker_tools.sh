build_docker_image() {
  local absolute_dockerfile_folder="$1"
  local absolute_folder_context="$2"
  local dockerfile_name="$3"
  local image_platform="$4"
  local image_name="$5"
  local extra_args="$6"

  local dockerfile_path="$absolute_dockerfile_folder/$dockerfile_name.Dockerfile"

  # TODO: ajouter Docker au au mkDerive
  docker image build \
    --file $dockerfile_path \
    --tag $image_name \
    --platform $image_platform \
    $extra_args \
    $absolute_folder_context
}

run_docker_nix_image() {
  local image_name="$1"
  local container_name="$2"
  local extra_args="$3"

  readonly nfg_nixos_store_volume="$container_name-nix-store"
  readonly nfg_nixos_var_volume="$container_name-nix-var"
  readonly nfg_tmp_volume="$container_name-tmp"

  # Useful to avoid error: `No space left on device` when building large iso
  docker volume create $nfg_nixos_store_volume
  docker volume create $nfg_nixos_var_volume
  docker volume create $nfg_tmp_volume

  docker container run \
    --name $container_name \
    --volume "$nfg_nixos_store_volume:/nix/store" \
    --volume "$nfg_nixos_var_volume:/nix/var" \
    --volume "$nfg_tmp_volume:/tmp" \
    $extra_args \
    $image_name
}

build_iso_from_flake() {
  local absolute_flake_path="$1"
  local builder_container_name="$2"
  local builder_image_name="$3"
  local nix_configuration_name="$4"
  local output_path="$5"

  run_docker_nix_image \
    "$builder_image_name" \
    "$builder_container_name" \
    "--volume $output_path:/data/iso
    --volume $absolute_flake_path:/data/sources
    --env FLAKE_ATTRIBUTE=nixosConfigurations.$nix_configuration_name.config.system.build.isoImage
    --rm"
}
