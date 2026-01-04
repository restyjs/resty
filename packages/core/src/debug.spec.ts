
import { describe, it, expect, vi, afterEach } from "vitest";
import { resty, Controller, Get, Service } from "./index";
import request from "supertest";

@Service()
@Controller("/debug")
class DebugController {
    @Get("/error")
    error() {
        throw new Error("Something went wrong");
    }
}

describe("Debug Mode", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should output debug logs when debug is enabled", async () => {
        const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => { });

        const app = resty({
            controllers: [DebugController],
            debug: true
        });

        await request(app).get("/debug/error");

        expect(consoleSpy).toHaveBeenCalled();
        // It should log initialization and middleware registration
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("[DEBUG]"));
    });

    it("should NOT output debug logs when debug is disabled", async () => {
        const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => { });

        const app = resty({
            controllers: [DebugController],
            debug: false
        });

        await request(app).get("/debug/error");

        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it("should include stack trace in error response when debug is enabled", async () => {
        const app = resty({
            controllers: [DebugController],
            debug: true
        });

        const response = await request(app).get("/debug/error");

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("stack");
        expect(response.body.message).toBe("Something went wrong");
    });

    it("should NOT include stack trace when debug is disabled", async () => {
        const app = resty({
            controllers: [DebugController],
            debug: false
        });

        const response = await request(app).get("/debug/error");

        expect(response.status).toBe(500);
        expect(response.body).not.toHaveProperty("stack");
        expect(response.body.message).toBe("Something went wrong");
    });
});
