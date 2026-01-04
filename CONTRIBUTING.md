# Contributing to Resty.js

Thank you for your interest in contributing to Resty.js! We welcome contributions from the community.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/resty.git
    cd resty
    ```
3.  **Install dependencies**:
    ```bash
    pnpm install
    ```
    We use [pnpm](https://pnpm.io/) for package management.

## Development Workflow

This is a monorepo managed by [Turbo](https://turbo.build/).

-   **Build all packages**:
    ```bash
    pnpm build
    ```
-   **Run example app**:
    ```bash
    cd examples/basic
    npm run dev
    ```

## Project Structure

-   `packages/core`: The core framework library.
-   `packages/cli`: The command-line interface (`resty`).
-   `packages/vscode`: VS Code extension.
-   `examples/*`: Example applications.

## Pull Requests

1.  Create a new branch for your feature or fix.
2.  Make your changes.
3.  Run tests (if applicable).
4.  Submit a Pull Request targeting the `main` branch.
5.  Provide a clear description of your changes.

## Code Style

We use Prettier and ESLint. Please ensure your code is formatted before submitting.

```bash
pnpm lint
pnpm format
```

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
