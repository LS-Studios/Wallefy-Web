import {DBItem} from "../../DatabaseModels/DBItem";

export class BalanceAtDateModel {
    date: string;
    balance: number;

    constructor(date: string, balance: number) {
        this.date = date;
        this.balance = balance;
    }
}