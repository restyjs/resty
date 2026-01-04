# resty.js

<div align="center">

[![npm version](https://img.shields.io/npm/v/@restyjs/core.svg?style=flat-square)](https://www.npmjs.com/package/@restyjs/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![CI](https://img.shields.io/github/actions/workflow/status/restyjs/resty/ci.yml?branch=master&style=flat-square)](https://github.com/restyjs/resty/actions)

**Fast, opinionated, minimalist and testable web framework built on Express.js with TypeScript decorators.**

[Getting Started](#getting-started) • [Documentation](#documentation) • [Packages](#packages) • [Examples](#examples)

</div>

---

## Features

- 🚀 **Express-powered** - Built on the battle-tested Express.js ecosystem
- 🎯 **Decorator-based** - Clean, declarative routing with TypeScript decorators
- 📝 **Type-safe** - Full TypeScript support with excellent IDE integration
- 🔌 **Modular** - Pick only the packages you need
- 📖 **OpenAPI Ready** - Auto-generate API documentation with Swagger UI
- ✅ **Validation** - Built-in request validation with Zod
- 🧪 **Testable** - First-class testing utilities included
- 💉 **Dependency Injection** - Powered by TypeDI

## Getting Started

### Installation

```bash
npm install @restyjs/core express
# or
pnpm add @restyjs/core express
# or
yarn add @restyjs/core express
```

Enable decorators in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

### Quick Start

```typescript
import resty, { Controller, Get, Post, Body, Param } from "@restyjs/core";

@Controller("/users")
class UserController {
  @Get("/")
  list() {
    return [{ id: 1, name: "John" }];
  }

  @Get("/:id")
  getOne(@Param("id") id: string) {
    return { id, name: "John" };
  }

  @Post("/")
  create(@Body() data: { name: string }) {
    return { id: 2, ...data };
  }
}

const app = resty({
  controllers: [UserController],
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
```

## Documentation

### Controllers

Controllers handle incoming requests and return responses:

```typescript
@Controller("/api/posts")
class PostController {
  @Get("/")
  async list() {
    return await PostService.findAll();
  }

  @Post("/")
  @HttpCode(201)
  async create(@Body() data: CreatePostDto) {
    return await PostService.create(data);
  }

  @Delete("/:id")
  async remove(@Param("id") id: string) {
    await PostService.delete(id);
  }
}
```

### Decorators

#### Parameter Decorators

| Decorator | Description |
|-----------|-------------|
| `@Body()` | Request body |
| `@Param(name)` | URL parameter |
| `@Query(name)` | Query string parameter |
| `@Header(name)` | Request header |
| `@Cookie(name)` | Cookie value |
| `@Req()` | Express Request object |
| `@Res()` | Express Response object |

#### Method Decorators

| Decorator | Description |
|-----------|-------------|
| `@Get(path)` | Handle GET requests |
| `@Post(path)` | Handle POST requests |
| `@Put(path)` | Handle PUT requests |
| `@Patch(path)` | Handle PATCH requests |
| `@Delete(path)` | Handle DELETE requests |
| `@HttpCode(code)` | Set response status code |
| `@SetHeader(name, value)` | Set response header |

### Middleware

```typescript
import cors from "cors";
import helmet from "helmet";

const app = resty({
  controllers: [UserController],
  middlewares: [cors(), helmet()],  // Before route handlers
  postMiddlewares: [NotFoundErrorHandler, DefaultErrorHandler],  // After
});
```

Controller and route-level middleware:

```typescript
const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

@Controller("/admin", [authMiddleware])
class AdminController {
  @Get("/stats", [rateLimitMiddleware])
  getStats() {
    return { users: 100 };
  }
}
```

### Error Handling

Built-in error classes for common HTTP errors:

```typescript
import {
  HTTPError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ValidationError,
} from "@restyjs/core";

@Get("/users/:id")
async getUser(@Param("id") id: string) {
  const user = await UserService.findById(id);
  if (!user) {
    throw new NotFoundError(`User ${id} not found`);
  }
  return user;
}
```

### Validation with Zod

```typescript
import { z } from "zod";
import { validate } from "@restyjs/validation";

const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

@Post("/users", [validate({ body: CreateUserSchema })])
create(@Body() data: z.infer<typeof CreateUserSchema>) {
  // data is fully typed and validated!
  return UserService.create(data);
}
```

### OpenAPI Documentation

```typescript
import { SwaggerUI } from "@restyjs/openapi";

const app = resty({
  controllers: [UserController],
});

// Serve Swagger UI at /docs
app.use(...SwaggerUI("/docs", {
  title: "My API",
  version: "1.0.0",
  description: "API documentation",
}));
```

### Database Integration

#### TypeORM

```typescript
import { Database, InjectRepository } from "@restyjs/typeorm";
import { Repository } from "typeorm";

@Controller("/users")
class UserController {
  @InjectRepository(User)
  private userRepo: Repository<User>;

  @Get("/")
  async list() {
    return this.userRepo.find();
  }
}

const app = resty({
  controllers: [UserController],
  providers: [
    Database({
      type: "postgres",
      host: "localhost",
      database: "mydb",
      entities: [User],
    }),
  ],
});
```

### JWT Authentication

```typescript
import { JWTConfiguration, JWTProvider, ValidateJWT } from "@restyjs/jwt";

@Controller("/auth")
class AuthController {
  @Inject() jwt: JWTProvider;

  @Post("/login")
  async login(@Body() credentials: LoginDto) {
    const user = await this.authenticate(credentials);
    const token = this.jwt.sign({ id: user.id });
    return { token };
  }
}

@Controller("/protected", [ValidateJWT])
class ProtectedController {
  @Get("/me")
  getMe(@Req() req: Request) {
    return req.token; // Decoded JWT payload
  }
}

const app = resty({
  controllers: [AuthController, ProtectedController],
  providers: [
    JWTConfiguration({ secret: process.env.JWT_SECRET! }),
  ],
});
```

## Packages

| Package | Description |
|---------|-------------|
| [@restyjs/core](./packages/core) | Core framework with routing and decorators |
| [@restyjs/openapi](./packages/openapi) | OpenAPI 3.1 spec generation + Swagger UI |
| [@restyjs/validation](./packages/validation) | Request validation with Zod |
| [@restyjs/testing](./packages/testing) | Testing utilities with supertest |
| [@restyjs/jwt](./packages/jwt) | JWT authentication |
| [@restyjs/typeorm](./packages/typeorm) | TypeORM database integration |
| [@restyjs/config](./packages/config) | Environment configuration with dotenv |
| [@restyjs/argon2](./packages/argon2) | Password hashing with Argon2 |

## Examples

See the [examples](./examples) directory for complete working examples:

- **Basic** - Simple CRUD API
- **Auth** - JWT authentication flow
- **OpenAPI** - Full API documentation

## Migration from v1

### Breaking Changes

1. **Node.js 20+** is now required
2. **TypeORM 0.3.x** - Uses `DataSource` instead of `Connection`
3. **ESM Support** - Packages now support both ESM and CommonJS

### Migration Steps

```typescript
// Before (v1)
import { Database } from "@restyjs/typeorm";
import { Connection, getConnection } from "typeorm";

// After (v2)
import { Database, InjectDataSource } from "@restyjs/typeorm";
import { DataSource } from "typeorm";
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](./CONTRIBUTING.md) for details.

```bash
# Clone the repo
git clone https://github.com/restyjs/resty.git
cd resty

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## Author

**Satish Babariya** - [satish.babariya@gmail.com](mailto:satish.babariya@gmail.com)

## License

MIT © [Satish Babariya](https://github.com/satishbabariya)
