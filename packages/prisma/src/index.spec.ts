import { describe, it, expect } from "vitest";
import { PrismaService } from "../src";

describe("@restyjs/prisma", () => {
    it("should be defined", () => {
        expect(PrismaService).toBeDefined();
    });
});
