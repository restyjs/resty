
import "reflect-metadata";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MetadataKeys } from "./metadataKeys";
import { Redirect, SetHeader } from "./decorators/Response";
import { File, Files } from "./decorators/File";
import { Controller } from "./decorators/Controller";
import { Get, Post } from "./decorators/HttpMethods";
import { Body } from "./decorators/Body";
import { resty } from "./resty";
import request from "supertest";
import { Container } from "typedi";

describe("Decorators Integration", () => {
    beforeEach(() => {
        Container.reset();
    });

    describe("@Redirect", () => {
        it("should redirect to specified url", async () => {
            @Controller("/redirect")
            class RedirectController {
                @Get("/")
                @Redirect("/target", 301)
                index() {
                    return "Redirecting...";
                }
            }

            const app = resty({
                controllers: [RedirectController],
                debug: true // Enable debug logging
            });

            const response = await request(app).get("/redirect");
            expect(response.status).toBe(301);
            expect(response.header.location).toBe("/target");
        });
    });

    describe("@SetHeader", () => {
        it("should set custom headers", async () => {
            @Controller("/header")
            class HeaderController {
                @Get("/")
                @SetHeader("X-Custom", "Value")
                @SetHeader("X-Another", "Value2")
                index() {
                    return "ok";
                }
            }

            const app = resty({
                controllers: [HeaderController],
            });

            const response = await request(app).get("/header");
            expect(response.header["x-custom"]).toBe("Value");
            expect(response.header["x-another"]).toBe("Value2");
        });
    });

    describe("Validation Integration", () => {
        it("should run validation logic", async () => {
            const ValidationMetadataKey = Symbol.for("resty:validation");

            @Controller("/validation")
            class ValidationController {
                @Post("/")
                create(@Body() body: any) {
                    return body;
                }
            }

            // Manually add validation metadata as if @ValidateBody was used
            const existingMetadata = Reflect.getOwnMetadata(ValidationMetadataKey, ValidationController, "create") || [];
            existingMetadata.push({
                target: "body",
                schema: {
                    safeParseAsync: async (data: any) => {
                        if (data.valid === false) {
                            return { success: false, error: { issues: [{ message: "Invalid data" }] } };
                        }
                        return { success: true, data: { ...data, validated: true } };
                    }
                },
                parameterIndex: 0
            });
            Reflect.defineMetadata(ValidationMetadataKey, existingMetadata, ValidationController, "create");

            const app = resty({
                controllers: [ValidationController]
            });

            // Test success
            const successRes = await request(app).post("/validation").send({ valid: true });
            expect(successRes.status).toBe(200);
            // Wait, Post default status is 201? No, 200 unless @HttpCode used. 
            // In resty.ts: if result matches object, res.json(result).
            // Status code undefined -> 200.
            expect(successRes.body.validated).toBe(true);

            // Test failure
            const failRes = await request(app).post("/validation").send({ valid: false });
            expect(failRes.status).toBe(422); // Validation Failed throws ValidationError (422)
        });
    });

    describe("File Upload Decorators", () => {
        // Mocking file upload without multer middleware is tricky in integration
        // but we can check if metadata is set correctly or use a mock request in unit test
        it("should resolve @File parameter", async () => {
            // Create a simple manual test for the resolveParam logic
            // We can't easily test full express flow without installing multer
            // But we can verify metadata is set
            @Controller("/files")
            class FileController {
                @Post("/upload")
                upload(@File() file: any) {
                    return file;
                }

                @Post("/uploads")
                uploads(@Files() files: any[]) {
                    return files;
                }
            }

            const metadata = Reflect.getMetadata(MetadataKeys.param, FileController, "upload");
            expect(metadata[0].paramType).toBe("file");

            const metadataFiles = Reflect.getMetadata(MetadataKeys.param, FileController, "uploads");
            expect(metadataFiles[0].paramType).toBe("files");
        });
    });
});
