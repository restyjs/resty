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
  Param,
  Query,
  ValidationError,
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

  @Get("/search")
  search(@Query("name") name: string, @Query("email") email: string) {
    return {
      name,
      email,
    };
  }

  @Post("/")
  async create(ctx: Context, @Body() body: PostDTO) {
    return { body: body };
  }

  @Put("/")
  async update(@Body() body: PostDTO, ctx: Context) {
    return ctx.res.json({ body: body }).status(200);
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

  @Get("/:id")
  getByID(@Param("id") id: string) {
    return {
      id: id,
    };
  }
}

const app = resty({
  controllers: [HelloController],
});

// 404 Hanler
app.use((req, res, next) => {
  const error: Error = new Error("Not Found");
  next(error);
});

// Error Hendler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    if (err instanceof ValidationError) {
      res.status(400);
      res.json({
        message: err.message,
        errors: err.errors,
      });
      return;
    }

    res.status(500);
    res.json({
      error: err.message ? err.message : err,
    });
  }
});

app.listen(8080);
