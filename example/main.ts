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
  Context,
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
    return { body: body };
  }

  @Put("/")
  async update(@Body() body: PostDTO) {
    return { body: body };
  }

  @Get("/rest")
  async rest() {
    return "Hello rest";
  }

  @Get("/error")
  error() {
    throw new Error("sample error");
  }

  @Get("/health")
  health(ctx: Context) {
    return ctx.res.json({ status: "ok" }).status(200);
  }

  @Post("/health")
  postHealth(ctx: Context) {
    return ctx.res.json({ status: "ok" }).status(200);
  }
}

const app = resty({
  controllers: [HelloController],
});

// Error Hendler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500);
  res.json({
    error: err.message ? err.message : err,
  });
});

app.listen(8080);
