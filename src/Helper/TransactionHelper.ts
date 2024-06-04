import {TransactionType} from "../Data/Transactions/TransactionType";
import exp from "constants";
import {TransactionModel} from "../Data/Transactions/TransactionModel";
import {RepetitionHelper} from "./RepetitionHelper";
import {getDateFromStandardString} from "./DateHelper";

export const getTransactionAmount = (transaction: TransactionModel) => {
    switch (transaction.transactionType) {
        case TransactionType.INCOME:
            return transaction.transactionAmount;
        case TransactionType.EXPENSE:
            return transaction.transactionAmount ? -transaction.transactionAmount : null;
    }
}

export const calculateFutureTransactions = (transactions: TransactionModel[], amount: number) => {
    let futureTransactions: TransactionModel[] = [];
    let transactionQueue: TransactionModel[] = [...transactions];

    transactionQueue.sort((a, b) => {
        return getDateFromStandardString(a.date) > getDateFromStandardString(b.date) ? 1 : -1;
    })

    while (futureTransactions.length < amount) {
        if (transactionQueue.length === 0) {
            break;
        }

        let currentTransaction = transactionQueue.shift()!;
        let nextDate = new RepetitionHelper(currentTransaction).calculateNextRepetitionDate();

        if (nextDate === null) continue;

        let nextTransaction = {
            ...currentTransaction,
            date: nextDate
        } as TransactionModel;

        futureTransactions.push(currentTransaction);

        if (nextTransaction.repetition) {
            transactionQueue.push(nextTransaction);
        }

        transactionQueue.sort((a, b) => {
            return getDateFromStandardString(a.date) > getDateFromStandardString(b.date) ? 1 : -1;
        })
    }

    return { nextFutureTransactions:futureTransactions, transactionQueue:transactionQueue };
}