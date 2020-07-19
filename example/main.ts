import resty, {
  Controller,
  Get,
  Context,
  Service,
  Inject,
  Body,
  Post,
  DefaultErrorHandler,
  NotFoundErrorHandler,
} from "../src";

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

  @Post("/body")
  bodyTest(@Body() body: any) {
    return body;
  }
}

const app = resty({
  routePrefix: "/api",
  controllers: [HelloController],
  postMiddlewares: [NotFoundErrorHandler, DefaultErrorHandler],
});

app.listen(8080);
