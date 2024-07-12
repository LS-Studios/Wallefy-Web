import {TransactionType} from "../EnumTypes/TransactionType";
import {DateRangeModel} from "./DateRangeModel";
import {PriceRangeModel} from "./PriceRangeModel";
import {CurrencyModel} from "./CurrencyModel";

export class FilterModel {
    transactionType: TransactionType | null = null;
    dateRange: DateRangeModel | null = null;
    priceRange: PriceRangeModel | null = null;
    categories: string[] | null = null;
    labels: string[] | null = null;
    transactionPartners: string[] | null = null;
}