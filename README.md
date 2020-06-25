# resty.js
Fast, opinionated, minimalist and testable web framework built on express.js and typescript.

```sh
npm i @restyjs/core
```

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
