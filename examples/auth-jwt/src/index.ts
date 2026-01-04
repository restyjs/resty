import "reflect-metadata";
import { resty } from "@restyjs/core";
import { JWTConfiguration } from "@restyjs/jwt";
import { AuthController } from "./controllers/AuthController";

const app = resty({
    controllers: [AuthController],
    providers: [
        JWTConfiguration({
            secret: "super-secret-key-change-me",
            signOptions: { expiresIn: "1h" }
        })
    ],
    logger: true,
});

app.listen(3003, () => {
    console.log("Auth Service running on port 3003");
});
