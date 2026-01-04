import { Service } from "typedi";
import { Item } from "./item";

@Service()
export class ItemsService {
    private items: Item[] = [];

    findAll(): Item[] {
        return this.items;
    }

    findOne(id: string): Item | undefined {
        return this.items.find((item) => item.id === id);
    }

    create(item: Omit<Item, "id">): Item {
        const newItem: Item = {
            id: Math.random().toString(36).substring(7),
            ...item,
        };
        this.items.push(newItem);
        return newItem;
    }

    update(id: string, item: Partial<Item>): Item | undefined {
        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) return undefined;

        this.items[index] = { ...this.items[index], ...item };
        return this.items[index];
    }

    delete(id: string): boolean {
        const index = this.items.findIndex((i) => i.id === id);
        if (index === -1) return false;

        this.items.splice(index, 1);
        return true;
    }
}
