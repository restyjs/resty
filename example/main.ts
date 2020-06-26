import resty, { Controller, Get, Context, Service, Inject } from "../src";

@Service()
class BeanFactory {
  create() {
    return "BeanFactory";
  }
}

@Controller("/hello")
class HelloController {
  @Inject() beanFactory!: BeanFactory;

  @Get("/")
  index() {
    return "Hello World from " + this.beanFactory.create();
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
