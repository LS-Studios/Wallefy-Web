export class PriceRange {
    minPrice: number = 0
    maxPrice: number = 0

    constructor(startPrice: number = 0, endPrice: number = 0) {
        this.minPrice = startPrice;
        this.maxPrice = endPrice;
    }
}