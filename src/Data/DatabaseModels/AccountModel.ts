import {AccountVisibilityType} from "../EnumTypes/AccountVisibilityType";
import {DBItem} from "./DBItem";
import {AccountType} from "../EnumTypes/AccountType";

export class AccountModel implements DBItem {
    uid: string;
    userId: string;
    name: string;
    balance: number;
    currencyCode: string;
    type: AccountType;
    visibility: AccountVisibilityType;
    userIds: string[] | null;

    constructor(name?: string, balance?: number, type?: AccountType, visibility?: AccountVisibilityType) {
        this.uid = "";
        this.userId = "";
        this.name = name || "";
        this.balance = balance || 0;
        this.currencyCode = "EUR";
        this.type = type || AccountType.DEFAULT;
        this.visibility = visibility || AccountVisibilityType.PRIVATE;
        this.userIds = null;
    }
}