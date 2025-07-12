import {getDefaultCurrency} from "../../Helper/CurrencyHelper";

export class CurrencyModel {
    currencyCode: string
    baseCurrencyCode: string
    currencyRate: number

    constructor(currencyCode: string, baseCurrencyCode: string | null | undefined, currencyRate: number) {
        this.currencyCode = currencyCode
        this.baseCurrencyCode = baseCurrencyCode || getDefaultCurrency(null).currencyCode
        this.currencyRate = currencyRate
    }
}