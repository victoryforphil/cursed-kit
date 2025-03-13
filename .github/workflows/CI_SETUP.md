# CI/CD Setup for cursed-kit

This document explains how to set up the GitHub Actions CI/CD pipeline for building Docker images and publishing them to GitHub Container Registry (GHCR), as well as building native binaries for multiple platforms.

## Setting up GitHub Container Registry (GHCR)

### Step 1: Enable GitHub Container Registry

1. Go to your GitHub repository settings
2. Navigate to "Packages" in the sidebar
3. Ensure that GitHub Container Registry is enabled
4. Make sure the repository visibility is set to "Public" if you want the packages to be publicly accessible

### Step 2: Configure Repository Permissions

1. Go to your GitHub repository settings
2. Navigate to "Actions" > "General" in the sidebar
3. Under "Workflow permissions", select "Read and write permissions"
4. Save the changes

### Step 3: Set up Authentication

For GitHub Actions workflows, GitHub automatically creates a `GITHUB_TOKEN` secret that can be used for authentication. No additional setup is required unless you're building outside of GitHub Actions.

For local development and pushing to GHCR:

1. Create a Personal Access Token (PAT) with `packages:read` and `packages:write` scopes
2. Log in to the GitHub Container Registry:
   ```bash
   echo $PAT | docker login ghcr.io -u USERNAME --password-stdin
   ```

## Publishing Docker Images

The CI workflow will automatically:

1. Build the Docker images for both `cursed-ws-bridge` and `cursed-ws-web`
2. Push the images to GitHub Container Registry with appropriate tags

The images will be available at:
- `ghcr.io/your-username/cursed-kit/cursed-ws-bridge`
- `ghcr.io/your-username/cursed-kit/cursed-ws-web`

## Building Native Binaries

The CI workflow will automatically:

1. Build the Rust binary for cursed-ws-bridge for the following platforms:
   - Linux x86_64 (`x86_64-unknown-linux-gnu`)
   - Linux ARM64 (`aarch64-unknown-linux-gnu`)
   - macOS Universal (both x86_64 and ARM64)
   - Windows x86_64 (`x86_64-pc-windows-msvc`)

2. Upload the artifacts to GitHub Actions

3. If a tag is pushed (e.g., `v1.0.0`), a GitHub Release will be created with all binaries attached

## Using the Docker Images

To pull and run the images from GHCR:

```bash
# Pull the images
docker pull ghcr.io/your-username/cursed-kit/cursed-ws-bridge:latest
docker pull ghcr.io/your-username/cursed-kit/cursed-ws-web:latest

# Run with Docker Compose
docker-compose up
```

## Using the Native Binaries

The binaries will be available as GitHub Release assets whenever a new tag is pushed.

You can download them manually from the Releases page or use the GitHub API to download them programmatically.

## Troubleshooting

### Common Issues with GHCR

1. **Permission denied when pushing to GHCR**
   - Ensure your PAT has the necessary permissions (`packages:read` and `packages:write`)
   - Make sure the repository has "Packages" permissions enabled

2. **Images not showing up as public**
   - Go to the package on GitHub, click on "Package settings", and set the visibility to "Public"

3. **Workflow failing due to authentication issues**
   - Check that the repository permissions allow workflows to write to packages
   - Verify that the `GITHUB_TOKEN` has the necessary permissions

### Common Issues with Binary Builds

1. **Cross-compilation failures**
   - Check that the necessary cross-compilation tools are installed in the workflow
   - Verify that the Rust targets are correctly specified

2. **Artifacts not appearing in release**
   - Check that the paths in the `softprops/action-gh-release` step are correct
   - Verify that the artifacts were successfully uploaded in previous steps

## Additional Customization

You can modify the workflow files to customize the build process:

- `.github/workflows/docker-publish.yml`: Docker image building and publishing
- `.github/workflows/build-binaries.yml`: Building native binaries for multiple platforms 