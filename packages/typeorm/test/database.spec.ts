import resty, { Controller, Get, Configuration } from "@restyjs/core";
import request from "supertest";
import { Database } from "../src";

describe("resty", () => {
  it("test jwt middleware", async () => {
    @Controller("/")
    class HelloController {
      @Get("/", [])
      index() {
        return "Hello World";
      }
    }

    const app = resty({
      controllers: [HelloController],
      providers: [
        Database({
          type: "sqlite",
          database: "test",
          entities: [],
        }),
      ],
    });

    const response = await await request(app).get("/");
    expect(response).toMatchObject({
      status: 200,
      text: "Hello World",
    });
  });
});
