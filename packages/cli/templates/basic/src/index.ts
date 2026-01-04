import "reflect-metadata";
import { resty, Controller, Get } from "@restyjs/core";

@Controller("/")
class AppController {
    @Get("/")
    index() {
        return { message: "Welcome to Resty.js!" };
    }
}

const app = resty({
    controllers: [AppController]
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
