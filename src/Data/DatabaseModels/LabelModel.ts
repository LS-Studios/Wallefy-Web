import {DBItem} from "./DBItem";

export class LabelModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""

    constructor(accountId: string, name: string) {
        this.accountId = accountId
        this.name = name
    }
}