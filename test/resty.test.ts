import resty, { Controller, Get } from "../src";
import request from "supertest";

describe("resty", () => {
  it("test resty app with @Controller and @Get decorators", async () => {
    @Controller("/")
    class HelloController {
      @Get("/")
      index() {
        return "Hello World";
      }
    }

    const app = resty({
      controllers: [HelloController],
    });

    const response = await request(app).get("/");
    expect(response).toMatchObject({
      status: 200,
      text: "Hello World",
    });
  });
});
