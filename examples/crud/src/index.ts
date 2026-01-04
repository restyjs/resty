import "reflect-metadata";
import { resty } from "@restyjs/core";
import { ItemsController } from "./items.controller";

const app = resty({
    controllers: [ItemsController],
    debug: true
});

app.listen(3000, () => {
    console.log("CRUD Server running on http://localhost:3000");
});
