log() {
  echo -e "\033[35m$@\033[0m"
}

read_input() {
  local text="$1"
  local -n result="$2"

  local formatted_text=$(log "$text")

  read -p "$formatted_text" result
}

die() {
  echo -e "\033[35m$@\033[0m" >&2

  exit 1
}
