import resty, {
  Controller,
  Get,
  Request,
  Response,
  NextFunction,
} from "../src";
import { response, json } from "express";

@Controller("/")
class HelloController {
  @Get("/")
  index() {
    return "Hello World";
  }

  @Get("/rest")
  async rest(req: Request, res: Response, next: NextFunction) {
    return "Hello rest";
  }

  @Get("/error")
  error() {
    throw Error("throw error");
  }

  @Get("/health")
  health(req: Request, res: Response, next: NextFunction) {
    return res.json({ status: "ok" }).status(200);
  }
}

const app = resty({
  controllers: [HelloController],
});

app.listen(8080);
