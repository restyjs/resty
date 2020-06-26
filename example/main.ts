import resty, { Controller, Get, Context, Service, Inject } from "../src";

@Service("beanFactory")
class BeanFactory {
  create() {
    console.log("BeanFactory");
  }
}

@Controller("/hello")
class HelloController {
  @Inject() beanFactory!: BeanFactory;

  @Get("/")
  index() {
    // console.log(this.beanFactory);
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
