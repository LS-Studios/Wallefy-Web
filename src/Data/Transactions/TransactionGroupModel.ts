import {TransactionModel} from "./TransactionModel";

export class TransactionGroupModel {
    date: string;
    transactions: TransactionModel[];
    isStartOfMonth: boolean = false;

    constructor(date: string, transactions: TransactionModel[], isStartOfMonth: boolean = false) {
        this.date = date;
        this.transactions = transactions;
        this.isStartOfMonth = isStartOfMonth;
    }
}