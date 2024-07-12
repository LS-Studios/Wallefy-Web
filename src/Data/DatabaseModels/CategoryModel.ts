import {DBItem} from "./DBItem";

export class CategoryModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""

    constructor(accountId: string, name: string) {
        this.accountId = accountId
        this.name = name
    }
}