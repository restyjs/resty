import "reflect-metadata";
import { resty, Controller, Get } from "@restyjs/core";

@Controller("/")
class HelloController {
    @Get("/")
    index() {
        return "Hello from Resty CLI!";
    }
}

const app = resty({
    controllers: [HelloController]
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
