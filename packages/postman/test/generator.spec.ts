import { describe, it, expect } from "vitest";
import { Controller, Get, Post, Body, Param, Query } from "@restyjs/core";
import { generatePostmanCollection } from "../src";

@Controller("/users")
class UserController {
    @Get("/")
    async list(@Query("page") page: number) {
        return { page };
    }

    @Get("/:id")
    async get(@Param("id") id: string) {
        return { id };
    }

    @Post("/")
    async create(@Body() data: any) {
        return data;
    }
}

describe("PostmanGenerator", () => {
    it("should generate a collection from controllers", () => {
        const collection = generatePostmanCollection({
            name: "Test API",
            baseUrl: "http://localhost:3000",
            controllers: [UserController],
        }) as any;

        expect(collection.info.name).toBe("Test API");
        expect(collection.item).toHaveLength(1); // One folder for UserController

        const userFolder = collection.item[0];
        expect(userFolder.name).toBe("UserController");
        expect(userFolder.item).toHaveLength(3); // 3 routes

        // Check List route
        const listRoute = userFolder.item.find((i: any) => i.name === "GET /users");
        expect(listRoute).toBeDefined();
        expect(listRoute.request.method).toBe("GET");
        // Verify properties of the URL object
        expect(listRoute.request.url.host).toEqual(["{{baseUrl}}"]);
        expect(listRoute.request.url.path).toEqual(["users"]);

        // Check Get route
        const getRoute = userFolder.item.find((i: any) => i.name === "GET /users/:id");
        expect(getRoute).toBeDefined();
        expect(getRoute.request.method).toBe("GET");
        expect(getRoute.request.url.host).toEqual(["{{baseUrl}}"]);
        expect(getRoute.request.url.path).toEqual(["users", ":id"]);

        // Check Create route
        const createRoute = userFolder.item.find((i: any) => i.name === "POST /users");
        expect(createRoute).toBeDefined();
        expect(createRoute.request.method).toBe("POST");
        expect(createRoute.request.url.host).toEqual(["{{baseUrl}}"]);
        expect(createRoute.request.url.path).toEqual(["users"]);
    });
});
