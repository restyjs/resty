import {
  Controller,
  Post,
  Body,
  Context,
  Param,
  Put,
  Delete,
} from "@restyjs/core";
import { PrismaClient } from "@prisma/client";

@Controller("/user")
export class UserController {
  prisma = new PrismaClient();

  @Post("/")
  async post(@Body() body: any) {
    const { name, email } = body;
    const result = await this.prisma.user.create({
      data: {
        email: email,
        name: name,
      },
    });
    return result;
  }
}
