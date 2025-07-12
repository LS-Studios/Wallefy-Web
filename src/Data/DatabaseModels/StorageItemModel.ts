import {DBItem} from "./DBItem";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";

export class StorageItemModel {
    item: DBItem;
    itemType: DatabaseRoutes;

    constructor(item: DBItem, itemType: DatabaseRoutes) {
        this.item = item;
        this.itemType = itemType;
    }
}