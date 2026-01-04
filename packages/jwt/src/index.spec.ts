import { describe, it, expect } from "vitest";
import * as jwt from "../src";

describe("@restyjs/jwt", () => {
    it("should export jwt utilities", () => {
        expect(jwt.JWTProvider).toBeDefined();
    });
});
