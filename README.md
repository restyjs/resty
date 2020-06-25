<p align="center">  
<img src="./logo.png" width="400" height="400">
<p align="center">A Node.js framework</p>
</p>

### Quick Start

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
