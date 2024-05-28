import {DBItem} from "./DBItem";

export class TransactionPartnerModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""
    isUser: boolean = false

    constructor(name: string, isUser: boolean) {
        this.name = name
        this.isUser = isUser
    }
}