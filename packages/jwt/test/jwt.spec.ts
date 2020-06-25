import resty, { Controller, Get, Configuration } from "@restyjs/core";
import request from "supertest";
import * as jwt from "../src";

describe("resty", () => {
  it("test jwt middleware", async () => {
    @Controller("/")
    class HelloController {
      @Get("/", [jwt.ValidateJWT])
      index() {
        return "Hello World";
      }
    }

    const app = resty({
      controllers: [HelloController],
    });

    const token = jwt.sign({ foo: "bar" }, "secret");

    const response = await await request(app)
      .get("/")
      .set("authorization", `Bearer ${token}`);
    expect(response).toMatchObject({
      status: 200,
      text: "Hello World",
    });
  });
});
