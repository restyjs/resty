import { describe, it, expect } from "vitest";
import * as openapi from "../src";

describe("@restyjs/openapi", () => {
    it("should export openapi utilities", () => {
        expect(openapi).toBeDefined();
    });
});
