import {CurrencyModel} from "./CurrencyModel";

export class CurrencyValueModel {
    transactionAmount: number | null;
    currency: CurrencyModel

    constructor(transactionAmount: number | null, currency: CurrencyModel) {
        this.transactionAmount = transactionAmount;
        this.currency = currency;
    }
}