# resty.js


Fast, opinionated, minimalist and testable web framework built on top of express.js and typescript with decorators.


- [Installation](#installation)
- [Get started](#get-started)
- [License](#license)


## Installation
Install from the command line:

```sh
npm install @restyjs/core
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

## Author

Satish Babariya, satish.babariya@gmail.com

## License

resty.js is available under the MIT license. See the LICENSE file for more info.
