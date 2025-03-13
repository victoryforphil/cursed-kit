#!/bin/bash

# Simple development script to run all components
# Run with: ./dev.sh or moon run dev

# Get the absolute path to the repository root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BRIDGE_DIR="${REPO_ROOT}/cursed-ws/cursed-ws-bridge"
WEB_DIR="${REPO_ROOT}/cursed-ws/cursed-ws-web"

# Colors for output formatting
BLUE="\033[0;34m"      # Blue for general messages
BRIDGE_COLOR="\033[0;36m" # Cyan for bridge
WEB_COLOR="\033[0;32m"    # Green for web
RESET="\033[0m"           # Reset color

# Check if directories exist
if [ ! -d "$BRIDGE_DIR" ]; then
  echo -e "${BLUE}Error: Bridge directory not found: $BRIDGE_DIR${RESET}"
  exit 1
fi

if [ ! -d "$WEB_DIR" ]; then
  echo -e "${BLUE}Error: Web directory not found: $WEB_DIR${RESET}"
  exit 1
fi

# Function to run a command with colored output
run_with_prefix() {
  local cmd="$1"
  local dir="$2"
  local prefix="$3"
  local color="$4"
  
  cd "$dir" || exit 1
  echo -e "${color}[$prefix] Starting in $(pwd)${RESET}"
  
  # Run the command and capture its output with a prefix
  $cmd 2>&1 | while IFS= read -r line; do
    echo -e "${color}[$prefix]${RESET} $line"
  done &
  
  # Return to the original directory
  cd "$REPO_ROOT" > /dev/null
  
  # Return the PID
  echo $!
}

echo -e "${BLUE}Starting development environment...${RESET}"

# Start the Rust bridge server
BRIDGE_PID=$(run_with_prefix "cargo run" "$BRIDGE_DIR" "bridge" "$BRIDGE_COLOR")

# Start the web client
WEB_PID=$(run_with_prefix "bun run dev" "$WEB_DIR" "web" "$WEB_COLOR")

# Handle termination
cleanup() {
  echo -e "\n${BLUE}Shutting down all services...${RESET}"
  kill $BRIDGE_PID $WEB_PID 2>/dev/null
  exit 0
}

# Register the cleanup function
trap cleanup INT TERM

echo -e "\n${BLUE}Development environment started!${RESET}"
echo -e "${BLUE}- Bridge server: http://localhost:3030/spam${RESET}"
echo -e "${BLUE}- Web client: http://localhost:5173${RESET}"
echo -e "\n${BLUE}Press Ctrl+C to stop all services.${RESET}\n"

# Wait for all background processes
wait 