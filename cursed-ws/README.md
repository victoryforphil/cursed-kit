# Cursed WebSocket

A WebSocket-based system for the Cursed Kit.

## Components

- **cursed-ws-bridge**: A Rust-based WebSocket bridge server
- **cursed-ws-web**: A React-based web client

## Docker Setup

### Production

To run the complete system in production mode:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

The web client will be available at http://localhost (port 80).
The WebSocket bridge will be available at ws://localhost:3030/spam.

### Development

For development with hot reloading:

```bash
# Start the development environment
docker-compose -f docker-compose.dev.yml up

# Stop the development environment
docker-compose -f docker-compose.dev.yml down
```

The development web client will be available at http://localhost:5173.
The WebSocket bridge will be available at ws://localhost:3030/spam.

## Environment Variables

The following environment variables can be set to customize the services:

- `RUST_LOG`: Controls the logging level for the bridge (trace, debug, info, warn, error)

## Command-line Arguments

The bridge service accepts the following command-line arguments:

- `--address`, `-a`: WebSocket server address (default: "127.0.0.1")
- `--port`, `-p`: WebSocket server port (default: 3030)
- `--send-rate-hz`, `-s`: Data send rate in Hz (default: 10.0)

## Manual Setup

See the README files in each component directory for instructions on how to run the services manually without Docker. 