import { describe, it, expect } from "vitest";
import * as rateLimit from "../src";

describe("@restyjs/rate-limit", () => {
    it("should export rateLimit middleware", () => {
        expect(rateLimit.rateLimit).toBeDefined();
    });
});
