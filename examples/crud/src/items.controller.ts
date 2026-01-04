import { Controller, Get, Post, Put, Delete, Body, Param } from "@restyjs/core";
import { Service } from "typedi";
import { ItemsService } from "./items.service";
import { Item } from "./item";

@Service()
@Controller("/items")
export class ItemsController {
    constructor(private itemsService: ItemsService) { }

    @Get("/")
    async index() {
        return this.itemsService.findAll();
    }

    @Get("/:id")
    async show(@Param("id") id: string) {
        const item = this.itemsService.findOne(id);
        if (!item) {
            throw new Error(`Item ${id} not found`);
            // In real app, throw NotFoundError (mapped to 404)
        }
        return item;
    }

    @Post("/")
    async create(@Body() body: Omit<Item, "id">) {
        return this.itemsService.create(body);
    }

    @Put("/:id")
    async update(@Param("id") id: string, @Body() body: Partial<Item>) {
        return this.itemsService.update(id, body);
    }

    @Delete("/:id")
    async delete(@Param("id") id: string) {
        return { success: this.itemsService.delete(id) };
    }
}
