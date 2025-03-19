# Cursed WebSocket Bridge

A WebSocket bridge server for the Cursed Kit.

## Docker Setup

### Building and Running with Docker

To build and run the application using Docker:

```bash
# Build the Docker image
docker build -t cursed-ws-bridge .

# Run the container with default settings
docker run -p 3030:3030 cursed-ws-bridge

# Run with custom arguments
docker run -p 3030:3030 cursed-ws-bridge --address=0.0.0.0 --port=3030 --send-rate-hz=20.0

# Run with custom logging level
docker run -p 3030:3030 -e RUST_LOG=debug cursed-ws-bridge
```

### Using Docker Compose

We also provide a Docker Compose configuration for easier deployment:

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Environment Variables

- `RUST_LOG`: Controls the logging level (trace, debug, info, warn, error)

### Command-line Arguments

- `--address`, `-a`: WebSocket server address (default: "127.0.0.1")
- `--port`, `-p`: WebSocket server port (default: 3030)
- `--send-rate-hz`, `-s`: Data send rate in Hz (default: 10.0)

## Development

For local development without Docker:

```bash
# Build the application
cargo build --release

# Run with default settings
RUST_LOG=info ./target/release/cursed-ws-bridge

# Run with custom settings
RUST_LOG=debug ./target/release/cursed-ws-bridge --address=0.0.0.0 --port=8080 --send-rate-hz=20.0
``` 