# cusred-kit
React-rendered egui UI

## [Demo](https://victoryforphil.github.io/cursed-kit/)

# Cursed Kit

## Using the Moon Build System

### Installation

To install the Moon CLI:

```bash
# Using npm
npm install -g @moonrepo/cli

# Using Homebrew
brew install moonrepo/tap/moon
```

### Common Commands

- `moon run dev` - Run all services in development mode
- `moon run build` - Build all components
- `moon run docker-build` - Build all Docker images
- `moon run docker-up` - Start all services via Docker
- `moon run docker-dev` - Start services in development mode via Docker
- `moon run docker-down` - Stop all Docker services

### Project-Specific Commands

#### Rust Bridge Server
- `moon run bridge-check` - Run cargo check
- `moon run bridge-build` - Build the bridge server
- `moon run bridge-test` - Run tests for the bridge server
- `moon run bridge-run` - Run the bridge server locally

#### React Web Client
- `moon run web-install` - Install dependencies
- `moon run web-dev` - Start the web client in development mode
- `moon run web-build` - Build the web client
- `moon run web-lint` - Run linting

## Components

The `cursed-ws` project consists of:

- `cursed-ws-bridge`: A WebSocket bridge server written in Rust
- `cursed-ws-web`: A React-based web client for the Cursed Kit WebSocket bridge
