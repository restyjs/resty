# Changelog

All notable changes to this project will be documented in this file.

## [2.0.0] - 2026-01-04

### Added
- **@restyjs/core**:
  - Added built-in **CORS**, **Helmet**, and **Compression** middleware support via `RestyOptions`.
  - Added **Graceful Shutdown** capability.
  - Added **Context-aware Request ID** generation.
  - Integrated `typedi` for robust Dependency Injection.
  - Added `hooks` (onRequest, onResponse, onError) for global interceptors.
- **@restyjs/cli**:
  - New package for development tooling.
  - `resty dev`: Hot-reloading development server using `chokidar` and `tsx`.
  - Smart debug mode handling (`RESTY_DEBUG`).
- **@restyjs/vscode**:
  - New VS Code extension with snippets for Controllers, Services, and common patterns.
- **Documentation**:
  - New VitePress-based documentation site in `packages/docs`.
  - Comprehensive `README.md` rewrite.
  - Migration guide for v1 to v2.

### Changed
- Refactored Core to use `Application` class pattern.
- Improved Error Handling and Logging.
- Updated `examples/basic` and `examples/crud` to demonstrate new features.

### Fixed
- Fixed decorator metadata issues by recommending `ts-node` for development.
- Resolved build system (Turbo/Tsup) configuration for multi-package workspace.
