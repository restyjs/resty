import { describe, it, expect } from "vitest";
import * as testing from "../src";

describe("@restyjs/testing", () => {
    it("should export testing utilities", () => {
        expect(testing).toBeDefined();
        // Verify some expected exports
        // expect(testing.createMock).toBeDefined();
    });
});
