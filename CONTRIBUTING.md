# Contributing to Resty.js

Thank you for your interest in contributing to Resty.js! This document provides guidelines and information for contributors.

## Development Setup

### Prerequisites

- Node.js 20 or later
- pnpm 9 or later

### Getting Started

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/resty.git
   cd resty
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build all packages**

   ```bash
   pnpm build
   ```

4. **Run tests**

   ```bash
   pnpm test
   ```

## Project Structure

```
resty/
├── packages/
│   ├── core/           # Core framework
│   ├── openapi/        # OpenAPI/Swagger integration
│   ├── validation/     # Zod validation
│   ├── testing/        # Testing utilities
│   ├── jwt/            # JWT authentication
│   ├── typeorm/        # TypeORM integration
│   ├── config/         # Configuration provider
│   └── argon2/         # Password hashing
├── examples/           # Example applications
└── docs/               # Documentation
```

## Development Workflow

### Making Changes

1. Create a new branch for your feature/fix:

   ```bash
   git checkout -b feature/my-feature
   ```

2. Make your changes

3. Add a changeset for your changes:

   ```bash
   pnpm changeset
   ```

4. Run tests and linting:

   ```bash
   pnpm test
   pnpm lint
   pnpm typecheck
   ```

5. Commit your changes with a descriptive message

6. Push and create a Pull Request

### Commit Messages

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test changes

Example: `feat(core): add @Cookie decorator`

### Code Style

- Use TypeScript for all code
- Follow existing code patterns
- Add JSDoc comments for public APIs
- Write tests for new features

## Adding New Packages

1. Create a new directory in `packages/`
2. Copy the structure from an existing package
3. Update `package.json` with your package details
4. Add the package to the root `pnpm-workspace.yaml` if needed
5. Build and test

## Reporting Issues

When reporting issues, please include:

- Node.js and pnpm versions
- Operating system
- Steps to reproduce
- Expected vs actual behavior
- Relevant code snippets

## Questions?

Feel free to open a discussion or issue if you have questions!

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
