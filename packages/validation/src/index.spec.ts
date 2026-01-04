import { describe, it, expect } from "vitest";
import * as validation from "../src";

describe("@restyjs/validation", () => {
    it("should export validation utilities", () => {
        expect(validation).toBeDefined();
    });
});
