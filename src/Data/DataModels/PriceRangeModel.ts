export class PriceRangeModel {
    minPrice: number = 0
    maxPrice: number = 0
    currency: string = "EUR"

    constructor(startPrice: number = 0, endPrice: number = 0, currency: string = "EUR") {
        this.minPrice = startPrice;
        this.maxPrice = endPrice;
        this.currency = currency;
    }
}