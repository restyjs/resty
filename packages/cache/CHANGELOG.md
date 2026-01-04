# @restyjs/cache

## 3.0.0

### Major Changes

- # Release v2.0.0

  ## Core Framework
  - Major architecture overhaul.
  - Enhanced Decorator support with `@Redirect`, `@SetHeader`, `@File`, `@Files`.
  - Integrated `Zod` validation with `@ValidateBody`, `@ValidateQuery`, `@ValidateParams`.
  - Improved Error Handling and Default 404 handler.
  - Secure default settings (UID generation, body limits).

  ## New Packages
  - **@restyjs/cli**: New CLI for project scaffolding and management.
  - **@restyjs/openapi**: Automated OpenAPI 3.1 spec generation and Swagger UI.
  - **@restyjs/validation**: Dedicated validation package using Zod.
  - **@restyjs/cache**: In-memory and Redis caching middleware.
  - **@restyjs/rate-limit**: Rate limiting middleware with flexible backends.
  - **@restyjs/testing**: Testing utilities for Resty applications.
  - **@restyjs/prisma**: Prisma ORM integration.
  - **@restyjs/typeorm**: TypeORM integration.
  - **@restyjs/argon2**: Utilities for password hashing.
  - **@restyjs/jwt**: Utilities for JWT authentication.

### Patch Changes

- Updated dependencies
  - @restyjs/core@2.0.0
