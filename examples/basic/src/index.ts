import "reflect-metadata";
import { resty, Controller, Get } from "@restyjs/core";

@Controller("/")
class HelloController {
    @Get("/")
    index() {
        return { message: "Hello from Resty CLI!" };
    }
}

const app = resty({
    controllers: [HelloController],
    debug: true,
    cors: true,
    helmet: true,
    compression: true
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
