import {
  Controller,
  Post,
  Body,
  Context,
  Param,
  Put,
  Delete,
  Get,
  Query,
} from "@restyjs/core";
import { PrismaClient } from "@prisma/client";

@Controller("/post")
export class PostController {
  prisma = new PrismaClient();

  @Get("/")
  async findMany() {
    const posts = await this.prisma.post.findMany({
      where: { published: true },
      include: { author: true },
    });
    return { posts };
  }

  @Post("/")
  async create(@Body() body: any) {
    const { title, content, authorEmail } = body;
    const post = await this.prisma.post.create({
      data: {
        title,
        content,
        published: false,
        author: { connect: { email: authorEmail } },
      },
    });
    return { post };
  }

  @Delete("/:id")
  async delete(@Param("id") id: number) {
    const post = await this.prisma.post.delete({
      where: {
        id: id,
      },
    });
    return { post };
  }

  @Put("/publish/:id")
  async publish(@Param("id") id: number) {
    const post = await this.prisma.post.update({
      where: { id: id },
      data: { published: true },
    });
    return { post };
  }

  @Get("/filter")
  async search(@Query("searchString") searchString: string) {
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchString,
            },
          },
          {
            content: {
              contains: searchString,
            },
          },
        ],
      },
    });
    return { posts };
  }

  @Get("/:id")
  async find(@Param("id") id: number) {
    const post = await this.prisma.post.findOne({
      where: {
        id: id,
      },
    });
    return { post };
  }
}
