## Equivalent to the final bin of this CLI
readonly current_path=$(realpath $0)

## Made all available functions in the bin of the CLI
## available in the `send_completions` function
echo $"source \"$current_path\""

## This function is generated at build time
send_completions
