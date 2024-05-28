export class PriceRange {
    startPrice: number = 0
    endPrice: number = 0

    constructor(startPrice: number = 0, endPrice: number = 0) {
        this.startPrice = startPrice;
        this.endPrice = endPrice;
    }
}