import {AccountVisibility} from "./AccountVisibility";
import {DBItem} from "../DBItem";

export class AccountModel implements DBItem {
    uid: string;
    userId: string;
    name: string;
    balance: number | null;
    currencyCode: string;
    visibility: AccountVisibility;
    userIds: string[] | null;

    constructor(name?: string, balance?: number | null, visibility?: AccountVisibility) {
        this.uid = "";
        this.userId = "";
        this.name = name || "";
        this.balance = balance || null;
        this.currencyCode = "EUR";
        this.visibility = visibility || AccountVisibility.PRIVATE;
        this.userIds = null;
    }
}