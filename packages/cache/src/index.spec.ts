import { describe, it, expect } from "vitest";
import * as cache from "../src";

describe("@restyjs/cache", () => {
    it("should export cache middleware", () => {
        expect(cache.cache).toBeDefined();
    });
});
