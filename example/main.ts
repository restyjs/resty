import resty, { Controller } from "../src";

@Controller("/")
class HelloController {}

const app = resty({
  controllers: [HelloController],
});

app.listen(8080);
