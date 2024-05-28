import {TransactionType} from "./Transactions/TransactionType";
import {DateRange} from "./DateRange";
import {PriceRange} from "./PriceRange";

export class FilterModel {
    transactionType: TransactionType | null = null;
    dateRange: DateRange | null = null;
    priceRange: PriceRange | null = null;
    categories: string[] | null = null;
    labels: string[] | null = null;
    transactionPartners: string[] | null = null;
}