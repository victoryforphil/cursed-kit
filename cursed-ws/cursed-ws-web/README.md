# Cursed WebSocket Web Client

A web client for the Cursed Kit WebSocket bridge.

## Development

### Local Development

To start the development server locally:

```bash
# Install dependencies
bun install

# Start the development server
bun run dev
```

The development server will be available at http://localhost:5173.

### Docker Development

For development with Docker, we provide a special Docker Compose configuration:

```bash
# Start the development environment
cd ../  # Go to the cursed-ws directory
docker-compose -f docker-compose.dev.yml up
```

This will start both the WebSocket bridge server and a development version of the web client with hot reloading.
The development server will be available at http://localhost:5173.

## Production

### Building for Production

To build the application for production:

```bash
# Install dependencies
bun install

# Build the application
bun run build
```

The built application will be in the `dist` directory.

### Docker Production

We provide a Docker setup for production:

```bash
# Build and start the production containers
cd ../  # Go to the cursed-ws directory
docker-compose up -d
```

This will start both the WebSocket bridge server and the web client in production mode.
The web client will be available at http://localhost (port 80).

## Environment Variables

The following environment variables can be set to customize the application:

- `NODE_ENV`: Set to `development` or `production` (default: `production` in Docker)

## Connecting to the WebSocket Bridge

The web client connects to the WebSocket bridge at `/spam`. In development mode, it connects to `ws://localhost:3030/spam`.
