import resty, { Controller, Get, Context } from "../src";

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
  providers: [],
});

app.listen(8080);
