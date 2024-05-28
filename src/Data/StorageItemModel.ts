import {DBItem} from "./DBItem";

export class StorageItemModel<T extends DBItem> {
    item: T;
    name: string;

    constructor(item: T, name: string) {
        this.item = item;
        this.name = name;
    }
}