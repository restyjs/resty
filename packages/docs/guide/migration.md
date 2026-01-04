# Migration Guide

## v1 -> v2

Resty.js v2 introduces significant improvements in developer experience and modularity.

### Breaking Changes

- **CLI Required for Dev**: We now recommend using `@restyjs/cli` via `resty dev` for development to ensure proper hot-reloading and environment setup.
- **Middleware Options**: CORS, Helmet, and Compression are now configured via `RestyOptions` instead of manual Express middleware usage (though manual usage is still supported).

### upgrading

1. Update packages:
   ```bash
   npm install @restyjs/core@latest
   npm install -D @restyjs/cli@latest
   ```

2. Update `src/index.ts` to use new options if desired:
   ```typescript
   const app = resty({
     // ...
     cors: true,     // New
     helmet: true,   // New
   });
   ```
