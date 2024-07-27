/* eslint-disable no-restricted-globals */

import {calculateBalancesAtDateInDateRange} from "../Helper/TransactionHelper";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {DateRangeModel} from "../Data/DataModels/DateRangeModel";

export type CalculateBalancesAtDateInDateRangeWorkerData = {
    currentBalance: number,
    transactionsInRage: TransactionModel[],
    dateRange: DateRangeModel,
    baseCurrency: string,
}

self.onmessage = (e: MessageEvent<string>) => {
    const { currentBalance, transactionsInRage, dateRange, baseCurrency }: CalculateBalancesAtDateInDateRangeWorkerData = JSON.parse(e.data)

    self.postMessage(calculateBalancesAtDateInDateRange(currentBalance, transactionsInRage, dateRange, baseCurrency))
};

export {};