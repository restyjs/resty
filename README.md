# Resty.js

> A modern, lightweight, and type-safe framework for building server-side applications with Node.js and TypeScript.

Resty.js provides a robust set of decorators and tools to build scalable APIs quickly. It integrates seamlessly with Express.js while offering a superior developer experience with Dependency Injection, declarative routing, and built-in production best practices.

## Features

- **Type-Safe**: Built with TypeScript for TypeScript.
- **Declarative Routing**: Use decorators like `@Controller`, `@Get`, `@Post` to define your API.
- **Dependency Injection**: Built-in DI container powered by `typedi`.
- **Developer Experience**:
  - 🚀 **CLI**: `resty dev` for instant hot-reloading.
  - 🛠 **VS Code Extension**: Snippets for faster coding.
  - 📦 **Modular**: Core is lightweight; optional packages for CLI, specific integrations.
- **Production Ready**:
  - Security headers (Helmet)
  - CORS support
  - Compression
  - Graceful Shutdown
  - Context-aware Request ID

## Installation

```bash
npm install @restyjs/core reflect-metadata
npm install -D @restyjs/cli typescript
```

## Quick Start

Create a `src/index.ts` file:

```typescript
import "reflect-metadata";
import { resty, Controller, Get } from "@restyjs/core";

@Controller("/hello")
class HelloController {
  @Get("/")
  index() {
    return { message: "Hello World" };
  }
}

const app = resty({
  controllers: [HelloController],
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
```

Run it with hot reload:

```bash
npx resty dev
```

## Documentation

Visit our [Documentation Site](https://restyjs.com) (coming soon) or browse `packages/docs`.

## Examples

Check out the [examples](./examples) directory:
- [Basic](./examples/basic): Minimal setup.
- [CRUD](./examples/crud): Full CRUD with Service layer and Dependency Injection.

## License

MIT
