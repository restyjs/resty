import resty, { Controller, Get, Context } from "@restyjs/core";
import { Database } from "@restyjs/typeorm";

import cors from "cors";
import helmet from "helmet";

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

const app = resty({
  routePrefix: "/api",
  controllers: [HelloController],
  middlewares: [cors(), helmet()],
  providers: [
    Database({
      type: "sqlite",
      database: "example",
      synchronize: true,
      logging: true,
      entities: [],
    }),
  ],
});

app.listen(8080);
