import resty, {
  NotFoundErrorHandler,
  DefaultErrorHandler,
} from "@restyjs/core";
import { JWTConfiguration } from "@restyjs/jwt";
import { Database } from "@restyjs/typeorm";

import { errors } from "celebrate";

import { AuthController } from "./controllers/AuthController";
import { User } from "./models/User";

const app = resty({
  routePrefix: "/api",
  controllers: [AuthController],
  providers: [
    JWTConfiguration("secret"),
    Database({
      type: "sqlite",
      database: "example.db",
      synchronize: true,
      entities: [User],
    }),
  ],
  postMiddlewares: [errors(), NotFoundErrorHandler, DefaultErrorHandler],
});

app.listen(8080, () => {
  console.log("server is listening on port 8080");
});
