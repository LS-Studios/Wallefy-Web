import {DBItem} from "./DBItem";

export class LabelModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""

    constructor(name: string) {
        this.name = name
    }
}