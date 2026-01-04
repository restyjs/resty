import { describe, it, expect } from "vitest";
import * as argon2 from "../src";

describe("@restyjs/argon2", () => {
    it("should export argon2 utilities", () => {
        expect(argon2.hash).toBeDefined();
    });
});
