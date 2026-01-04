import { Controller, Post, Get, Body, Req } from "@restyjs/core";
import { JWTProvider, ValidateJWT } from "@restyjs/jwt";
import { Inject, Service } from "typedi";
import { Request } from "express";

@Service()
@Controller("/auth")
export class AuthController {
    @Inject()
    private jwtService: JWTProvider;

    @Post("/login")
    async login(@Body() body: { username: string }) {
        if (!body.username) {
            throw new Error("Username required");
        }

        const payload = { sub: "123", username: body.username, role: "user" };
        // Synchronous sign since jwt.sign is sync in provider (wrapper) or async?
        // JWTProvider.sign is synchronous in source I saw (jwt.sign).
        const token = this.jwtService.sign(payload);

        return {
            access_token: token,
            user: payload
        };
    }

    // @Get(path, [middleware])
    @Get("/profile", [ValidateJWT])
    getProfile(@Req() req: Request) {
        return {
            message: "This is a protected route",
            user: req.token
        };
    }
}
