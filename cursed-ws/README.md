# Cursed WebSocket (cursed-ws)

![Docker Image](https://img.shields.io/badge/docker-ready-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

Cursed WebSocket (`cursed-ws`) is a real-time WebSocket-based system designed for the Cursed Kit. It consists of a Rust-based WebSocket bridge server and a React-based web client, enabling efficient and scalable bidirectional communication.

## Table of Contents

- [Components](#components)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
  - [Docker Setup](#docker-setup)
    - [Production](#production)
    - [Development](#development)
  - [Manual Setup](#manual-setup)
    - [Cursed WS Bridge](#cursed-ws-bridge)
    - [Cursed WS Web Client](#cursed-ws-web-client)
- [Usage](#usage)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Command-line Arguments](#command-line-arguments)
- [Development](#development)
  - [Backend Development](#backend-development)
  - [Frontend Development](#frontend-development)
- [Contributing](#contributing)
- [License](#license)

## Components

Cursed WebSocket comprises two main components:

1. **cursed-ws-bridge**: A Rust-based WebSocket bridge server that handles real-time data communication.
2. **cursed-ws-web**: A React-based web client providing a user interface for interacting with the WebSocket bridge.

## Features

- **Real-Time Communication**: Enables efficient bidirectional data streaming between clients and the server.
- **Docker Support**: Simplifies deployment and environment management using Docker and Docker Compose.
- **Hot Reloading**: Facilitates rapid development with hot reloading capabilities for both frontend and backend.
- **Scalable Architecture**: Designed to handle multiple concurrent WebSocket connections seamlessly.
- **Customizable Configuration**: Allows fine-tuning of server parameters via environment variables and command-line arguments.

## Architecture

The system architecture is divided into two primary services:

- **cursed-ws-bridge**: Acts as the backend service, managing WebSocket connections, data processing, and communication with other services or databases as necessary.
  
- **cursed-ws-web**: Serves as the frontend application, providing users with a responsive and interactive interface to interact with the WebSocket bridge.

![Architecture Diagram](https://via.placeholder.com/800x400?text=Architecture+Diagram)

*(Replace the placeholder image with an actual architecture diagram if available.)*

## Installation

### Docker Setup

Using Docker and Docker Compose is the recommended approach for deploying `cursed-ws`.

#### Production

To build and run the complete system in production mode:

1. **Navigate to the Project Root**:

    ```bash
    cd cursed-ws
    ```

2. **Build and Start All Services**:

    ```bash
    docker-compose up -d
    ```

3. **View Logs**:

    ```bash
    docker-compose logs -f
    ```

4. **Stop All Services**:

    ```bash
    docker-compose down
    ```

**Access Points**:

- **Web Client**: [http://localhost](http://localhost) (Port 80)
- **WebSocket Bridge**: `ws://localhost:3030/spam`

#### Development

For a development environment with hot reloading:

1. **Navigate to the Project Root**:

    ```bash
    cd cursed-ws
    ```

2. **Start the Development Environment**:

    ```bash
    docker-compose -f docker-compose.dev.yml up
    ```

3. **Stop the Development Environment**:

    ```bash
    docker-compose -f docker-compose.dev.yml down
    ```

**Access Points**:

- **Web Client**: [http://localhost:5173](http://localhost:5173) (Port 5173)
- **WebSocket Bridge**: `ws://localhost:3030/spam`

### Manual Setup

If you prefer not to use Docker, you can set up each component manually.

#### Cursed WS Bridge

1. **Prerequisites**:

    - [Rust](https://www.rust-lang.org/tools/install) (version 1.60 or later)
    - [Cargo](https://doc.rust-lang.org/cargo/getting-started/installation.html) (comes with Rust)

2. **Navigate to the Bridge Directory**:

    ```bash
    cd cursed-ws/cursed-ws-bridge
    ```

3. **Build the Application**:

    ```bash
    cargo build --release
    ```

4. **Run the Server**:

    ```bash
    RUST_LOG=info ./target/release/cursed-ws-bridge
    ```

    **With Custom Arguments**:

    ```bash
    ./target/release/cursed-ws-bridge --address=0.0.0.0 --port=8080 --send-rate-hz=20.0
    ```

#### Cursed WS Web Client

1. **Prerequisites**:

    - [Bun](https://bun.sh/) (recommended) or [Node.js](https://nodejs.org/) with [npm](https://www.npmjs.com/)
    - [Git](https://git-scm.com/) for cloning the repository

2. **Navigate to the Web Client Directory**:

    ```bash
    cd cursed-ws/cursed-ws-web
    ```

3. **Install Dependencies**:

    Using Bun:

    ```bash
    bun install
    ```

    Using npm:

    ```bash
    npm install
    ```

4. **Run the Development Server**:

    Using Bun:

    ```bash
    bun run dev
    ```

    Using npm:

    ```bash
    npm run dev
    ```

5. **Build for Production**:

    Using Bun:

    ```bash
    bun run build
    ```

    Using npm:

    ```bash
    npm run build
    ```

    The production build will be available in the `dist` directory.

6. **Serve the Production Build**:

    You can serve the production build using a static file server like NGINX. Refer to the Docker Setup for production deployment.

## Usage

Once both the bridge server and web client are running, navigate to the web client URL to interact with the Cursed Kit.

- **Web Client URL**: [http://localhost:5173](http://localhost:5173)
  
  - **Table View**: `http://localhost:5173/zipline/table`
  - **Plots View**: `http://localhost:5173/zipline/plots`
  - **Debug View**: `http://localhost:5173/zipline/debug`
  - **Settings Panel**: `http://localhost:5173/zipline/settings`

### WebSocket Connection

The WebSocket bridge listens on `ws://localhost:3030/spam`. The web client connects to this endpoint to facilitate real-time data communication.

## Configuration

### Environment Variables

Configure the WebSocket bridge server using the following environment variables:

- **`RUST_LOG`**: Sets the logging level for the bridge. Options include `trace`, `debug`, `info`, `warn`, `error`.

### Command-line Arguments

Customize the WebSocket bridge server with these command-line options:

- **`--address`, `-a`**: Sets the WebSocket server address.
  - **Default**: `127.0.0.1`
- **`--port`, `-p`**: Sets the WebSocket server port.
  - **Default**: `3030`
- **`--send-rate-hz`, `-s`**: Specifies the data sending rate in Hz.
  - **Default**: `10.0`

#### Example

```bash
./target/release/cursed-ws-bridge --address=0.0.0.0 --port=8080 --send-rate-hz=20.0
```

## Development

### Backend Development

For backend (bridge server) development:

1. **Navigate to the Bridge Directory**:

    ```bash
    cd cursed-ws/cursed-ws-bridge
    ```

2. **Run the Development Server**:

    ```bash
    cargo run
    ```

3. **Hot Reloading**:

    Any changes to the Rust code will require rebuilding the server. Consider using tools like `cargo watch` for automated recompilation:

    ```bash
    cargo install cargo-watch
    cargo watch -x run
    ```

### Frontend Development

For frontend (web client) development:

1. **Navigate to the Web Client Directory**:

    ```bash
    cd cursed-ws/cursed-ws-web
    ```

2. **Run the Development Server**:

    Using Bun:

    ```bash
    bun run dev
    ```

    Using npm:

    ```bash
    npm run dev
    ```

3. **Hot Reloading**:

    The development server supports hot reloading. Any changes to the React components or styles will automatically reflect in the browser without a full page refresh.

## Contributing

Contributions are welcome! To contribute:

1. **Fork the Repository**:

    Click the "Fork" button on the repository's GitHub page.

2. **Clone Your Fork**:

    ```bash
    git clone https://github.com/your-username/cursed-ws.git
    cd cursed-ws
    ```

3. **Create a Feature Branch**:

    ```bash
    git checkout -b feature/your-feature-name
    ```

4. **Commit Your Changes**:

    ```bash
    git commit -m "Add your feature or fix"
    ```

5. **Push to Your Fork**:

    ```bash
    git push origin feature/your-feature-name
    ```

6. **Create a Pull Request**:

    Navigate to your fork on GitHub and click "Compare & pull request".

Please ensure your code adheres to the project's coding standards and includes appropriate tests where applicable.

## License

This project is licensed under the [MIT License](LICENSE).
