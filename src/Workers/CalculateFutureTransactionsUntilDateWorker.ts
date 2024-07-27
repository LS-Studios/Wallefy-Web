/* eslint-disable no-restricted-globals */

import {calculateFutureTransactionsUntilDate} from "../Helper/TransactionHelper";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";

export type CalculateFutureTransactionsUntilDateWorkerData = {
    getDatabaseRoute: (route: DatabaseRoutes) => string,
    transactions: TransactionModel[],
    date: string,
}

self.onmessage = (e: MessageEvent<string>) => {
    const { getDatabaseRoute, transactions, date }: CalculateFutureTransactionsUntilDateWorkerData = JSON.parse(e.data)

    self.postMessage(calculateFutureTransactionsUntilDate(getDatabaseRoute, transactions, date))
};

export {};