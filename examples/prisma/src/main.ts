import resty, {
  NotFoundErrorHandler,
  DefaultErrorHandler,
} from "@restyjs/core";

import { PostController } from "./controllers/PostController";
import { UserController } from "./controllers/UserController";

const app = resty({
  routePrefix: "/api",
  controllers: [UserController, PostController],
  postMiddlewares: [NotFoundErrorHandler, DefaultErrorHandler],
});

app.listen(8080, () => {
  console.log("🚀 Server ready at: http://localhost:8080");
});
