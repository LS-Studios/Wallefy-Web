import {TransactionPartnerModel} from "../DatabaseModels/TransactionPartnerModel";

export class BalanceModel {
    transactionPartnerUid: string;
    balance: number;

    constructor(transactionPartnerUid: string, balance: number) {
        this.transactionPartnerUid = transactionPartnerUid;
        this.balance = balance;
    }
}