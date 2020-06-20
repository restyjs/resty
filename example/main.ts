import "reflect-metadata";
import resty, {
  Controller,
  Get,
  Request,
  Response,
  NextFunction,
  Post,
  Body,
  Put,
} from "../src";

import { IsString } from "class-validator";

class PostDTO {
  @IsString()
  title!: string;

  @IsString()
  content!: string;
}

@Controller("/")
class HelloController {
  @Get("/")
  index() {
    return "Hello World";
  }

  @Post("/")
  async create(@Body() body: PostDTO) {
    console.log(body);
    return { status: "ok" };
  }

  @Put("/")
  async update(@Body() body: PostDTO) {
    return { status: "ok" };
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
    console.log(res);
    return res.json({ status: "ok" }).status(200);
  }

  @Post("/health")
  postHealth(req: Request, res: Response, next: NextFunction) {
    return res.json({ status: "ok" }).status(200);
  }
}

const app = resty({
  controllers: [HelloController],
});

app.listen(8080);
