import { describe, it, expect } from "vitest";
import * as typeorm from "../src";

describe("@restyjs/typeorm", () => {
    it("should export typeorm utilities", () => {
        expect(typeorm).toBeDefined();
    });
});
