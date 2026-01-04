import "reflect-metadata";
import { Service } from "typedi";
import { resty, Controller, Get, requestTimingHook } from "@restyjs/core";

@Service()
@Controller("/")
class HelloController {
    @Get("/")
    index() {
        return { message: "Hello Observability" };
    }
}

const app = resty({
    controllers: [HelloController],
    hooks: {
        onResponse: [requestTimingHook()]
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
