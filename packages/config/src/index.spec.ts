import { describe, it, expect } from "vitest";
import * as config from "../src";

describe("@restyjs/config", () => {
    it("should export config utilities", () => {
        expect(config).toBeDefined();
        expect(config.Configuration).toBeDefined();
    });
});
