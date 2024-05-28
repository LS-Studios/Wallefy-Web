import {DBItem} from "./DBItem";

export class CategoryModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""

    constructor(name: string) {
        this.name = name
    }
}