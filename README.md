# resty.js


[![TypeScript](https://img.shields.io/badge/-TypeScript-brightgreen?style=for-the-badge&logo=typescript)](https://github.com/microsoft/TypeScript)
[![Express](https://img.shields.io/badge/-express.js-blue?style=for-the-badge&logo)](https://github.com/restyjs/resty)
[![async/await](https://img.shields.io/badge/-async%2Fawait-green?style=for-the-badge&logo)](https://github.com/restyjs/resty)



Fast, opinionated, minimalist and testable web framework built on top of express.js and typescript with decorators.


# Table of Contents
* [Installation](#installation)
* [Get started](#get-started)
* [Application](#application)
  - [Create new resty.js app](#new)
  - [Add Route Prefix](#route-prefix)
  - [Use existing express.js app](#existing)
  - [Use existing express router](#existing-router)
* [Controllers](#controllers)
  - [async/await](#async-await)
  - [Get, Post, Put, Delete, Patch](#http-methods)
  - [Context, Request, Response, Next](#context)
* [Middlewares](#middlewares)
  - [Application Middlewares](#app-middlewares)
  - [Controller Middlewares](#controller-middlewares)
  - [Route Middlewares](#controller-middlewares)
  - [Post Middlewares](#post-middlewares)
* [Error Handling](#error-handlers)
  - [Default Error Handler](#default-error-handlers)
  - [Custom Error Handler](#custom-error-handlers)
* [ORM / TypeORM](#typeorm)
  - [Database Connection](#db-connection)
  - [Typeorm Docs](#typeorm-docs)
* [License](#license)


## Installation
Install from the command line:

```sh
npm install @restyjs/core
```

enable following settings in `tsconfig.json`:

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```


## Get started

```typescript
import resty, { Controller, Get, Context } from "@restyjs/core";

@Controller("/hello")
class HelloController {

  @Get("/")
  index() {
    return "Hello World";
  }
}

const app = resty({
  controllers: [HelloController],
});

app.listen(8080);

```


## Application

#### Create new resty.js app

```ts
// returns express application instance
const app = resty({
  controllers: [],
});
```

resty always returns express application instance.

#### Add Route Prefix

```ts
const app = resty({
  routePrefix: "/api",
  controllers: [],
});
```

#### Use existing express.js app

inside resty you can pass your existing express app instance inside `app` parameter.
```ts

const express_app = express()

const app = resty({
  app: express_app,
  controllers: [],
});
```

#### Use existing express router

inside resty you can pass your existing express router inside `router` parameter.

```ts

const router = express.Router()

const app = resty({
  router: router,
  controllers: [],
});
```


## Controllers

#### async/await

```ts
@Controller("/hello")
class HelloController {

  @Get("/register")
  async register(ctx: Context, @Body() input: UserDTO) {
    
    // create record
    const user = await createUser(input);
    
    // return user record
    return ctx.res.json({ user }).status(200);
  }
}
```

#### Get, Post, Put, Delete, Patch

Create a file `HelloController.ts`.

```ts
@Controller("/hello")
class HelloController {
  @Get("/")
  index() {
    return "Hello World";
  }

  @Get("/health")
  health(ctx: Context) {
    return ctx.res.json({ status: "ok" }).status(200);
  }
}
```

```ts
@Controller("/")
export class UserController {
  @Get("/users")
  getAll() {
    return "This action returns all users";
  }

  @Get("/users/:id")
  getOne(@Param("id") id: number) {
    return "This action returns user #" + id;
  }

  @Post("/users")
  post(@Body() user: any) {
    return "Saving user...";
  }

  @Put("/users/:id")
  put(@Param("id") id: number, @Body() user: any) {
    return "Updating a user...";
  }

  @Delete("/users/:id")
  remove(@Param("id") id: number) {
    return "Removing user...";
  }
}
```

#### Context, Request, Response, Next



```ts
  @Get("/health")
  health(ctx: Context) {
    return ctx.res.json({ status: "ok" }).status(200);
  }
```


## Middlewares

#### Application Middlewares

Application lavel middlewares like `helmet`, `cors` or `body-parser`

```ts
import cors from 'cors';
import helmet from 'helmet';

const app = resty({
  routePrefix: "/api",
  controllers: [HelloController],
  middlewares: [cors(), helmet()]
});
```

#### Controller Middlewares

```ts

const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.currentUser) {
    return next(new HTTPError("Error in checking current user", 500));
  }
  if (req.currentUser.role != Role.Admin) {
    return next(new HTTPError("Insufficient permission", 403));
  }
  return next();
};

@Controller("/admin", [isAdmin])
export class AdminController {

  @Get("/")
  async allUsers() {
    const users = await getAllUsers();
    return { users };
  }
}


```

#### Route Middlewares

```ts
const isAdmin = async (req: any, res: any, next: any) => {
  return next();
};

@Controller("/post")
export class AdminController {

  @Get("/", [isAdmin])
  async allUsers() {
    const users = await getAllUsers();
    return { users };
  }
}
```

#### Post Middlewares


```ts

const app = resty({
  routePrefix: "/api",
  controllers: [HelloController],
  postMiddlewares: []
});

// User postMiddlewares or use same old app.use form express.
app.use((req, res, next) => {
  next();
});

```


## Error Handling

resty provides inbuilt `404` and `HTTP` errors and `UnauthorizedError` Handling. if you want to implement your own error handling pass `handleErrors: false` to app config. 



## ORM / TypeORM

install typeorm module
```sh
npm install @restyjs/typeorm
```

#### Database Connection

resty will create database connection directly when provided `Database(options: ConnectionOptions)` inside `providers: []`.

```ts
import resty from "@restyjs/core";
import { Database } from "@restyjs/typeorm";

const app = resty({
  controllers: [],
  providers: [
    Database({
      type: "sqlite",
      database: "example.db",
      entities: [],
    }),
  ],
});
```

#### Typeorm Docs

For more info please refer to [typeorm](https://github.com/typeorm/typeorm) docs regarding database connections parameters and other orm features.




## Author

Satish Babariya, satish.babariya@gmail.com

## License

resty.js is available under the MIT license. See the LICENSE file for more info.
