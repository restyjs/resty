import { Controller, Post, Body, Inject, HTTPError } from "@restyjs/core";
import { InjectRepository } from "@restyjs/typeorm";
import { hash, verify } from "@restyjs/argon2";
import { JWTProvider } from "@restyjs/jwt";

import { Repository } from "typeorm";
import { celebrate, Joi } from "celebrate";

import { User } from "../models/User";

@Controller("/auth")
export class AuthController {
  @Inject() jwtProvider!: JWTProvider;
  @InjectRepository(User) private readonly repository: Repository<User>;

  @Post("/login", [
    celebrate({
      body: Joi.object({
        email: Joi.string().trim().email().lowercase().required(),
        password: Joi.string().min(8).max(30).required(),
      }),
    }),
  ])
  async login(@Body() body: any) {
    const record = await this.repository.findOne({
      email: body.email,
    });

    if (!record) {
      throw new HTTPError("User not found!", 404);
    }

    if (!record && !record.password) {
      throw new HTTPError("Invalid Email or Password!", 404);
    }

    if (!record.isActive) {
      throw new HTTPError(
        "Your account is inactive. Please contact your administrator",
        403
      );
    }

    const isPasswordVarified = await verify(record.password, body.password);
    if (isPasswordVarified) {
      const token = await this.jwtProvider.generate({
        id: record.id,
        email: record.email,
      });

      return {
        user: record,
        token: token,
      };
    } else {
      throw new HTTPError("Invalid Email or Password!", 404);
    }
  }

  @Post("/register", [
    celebrate({
      body: Joi.object({
        firstName: Joi.string().min(2).max(254).required(),
        lastName: Joi.string().min(2).max(254).required(),
        email: Joi.string().trim().email().lowercase().required(),
        password: Joi.string().min(8).max(30).required(),
      }),
    }),
  ])
  async register(@Body() body: any) {
    const result = await hash(body.password);
    const record = await this.repository.save({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: result.password,
      salt: result.salt,
    });

    if (!record) {
      throw new HTTPError("User cannot be created", 422);
    }

    Reflect.deleteProperty(record, "password");
    Reflect.deleteProperty(record, "salt");

    const token = await this.jwtProvider.generate({
      id: record.id,
      email: record.email,
    });

    return { user: record, token: token };
  }
}
