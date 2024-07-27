/* eslint-disable no-restricted-globals */

import {calculateNFutureTransactions} from "../Helper/TransactionHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";

export type CalculateNFutureTransactionsWorkerData = {
    getDatabaseRoute: ((route: DatabaseRoutes) => string),
    transactions: TransactionModel[],
    amount: number
}

self.onmessage = (e: MessageEvent<string>) => {
    const parsedData: CalculateNFutureTransactionsWorkerData = JSON.parse(e.data)

    const futureTransactions = calculateNFutureTransactions(parsedData.getDatabaseRoute, parsedData.transactions, parsedData.amount)

    self.postMessage(futureTransactions);
};

export {};