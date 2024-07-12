import {DBItem} from "./DBItem";

export class TransactionPartnerModel implements DBItem {
    uid: string = ""
    accountId: string = ""
    name: string = ""
    isUser: boolean = false

    constructor(accountId: string, name: string, isUser: boolean) {
        this.accountId = accountId
        this.name = name
        this.isUser = isUser
    }
}