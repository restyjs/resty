import { describe, it, expect } from "vitest";
import * as core from "../src";

describe("@restyjs/core", () => {
    it("should export core utilities", () => {
        expect(core).toBeDefined();
        expect(core.resty).toBeDefined();
        expect(core.Controller).toBeDefined();
        expect(core.Service).toBeDefined();
    });
});
