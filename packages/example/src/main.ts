import resty, { Controller, Get, Context } from "@restyjs/core";

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
    controllers: [HelloController],
    routePrefix: '/api'
});

app.listen(8080);