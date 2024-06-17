import {TransactionType} from "../Data/Transactions/TransactionType";
import exp from "constants";
import {TransactionModel} from "../Data/Transactions/TransactionModel";
import {RepetitionHelper} from "./RepetitionHelper";
import {formatDate, formatDateToStandardString} from "./DateHelper";
import {DateRange} from "../Data/DateRange";
import {BalanceAtDateModel} from "../Data/TransactionOverview/BalanceAtDateModel";
import transaction from "../UI/Screens/Transactions/Transaction/Transaction";

export const getTransactionAmount = (transaction: TransactionModel) => {
    switch (transaction.transactionType) {
        case TransactionType.INCOME:
            return transaction.transactionAmount;
        case TransactionType.EXPENSE:
            return transaction.transactionAmount ? -transaction.transactionAmount : null;
    }
}

export const calculateNFutureTransactions = (transactions: TransactionModel[], amount: number) => {
    let futureTransactions: TransactionModel[] = [];
    let transactionQueue: TransactionModel[] = [...transactions];

    transactionQueue.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
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
            return new Date(a.date) > new Date(b.date) ? 1 : -1;
        })
    }

    return { nextFutureTransactions:futureTransactions, transactionQueue:transactionQueue };
}

export const calculateFutureTransactionsUntilDate = (transactions: TransactionModel[], date: string) => {
    let futureTransactions: TransactionModel[] = [];
    let transactionQueue: TransactionModel[] = [...transactions];

    transactionQueue.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
    })

    while (transactionQueue.length > 0) {
        let currentTransaction = transactionQueue.shift()!;
        let nextDate = new RepetitionHelper(currentTransaction).calculateNextRepetitionDate();

        if (nextDate === null) continue;

        let nextTransaction = {
            ...currentTransaction,
            date: nextDate
        } as TransactionModel;

        futureTransactions.push(currentTransaction);

        if (nextTransaction.repetition && new Date(nextTransaction.date) <= new Date(date)) {
            transactionQueue.push(nextTransaction);
        }

        transactionQueue.sort((a, b) => {
            return new Date(a.date) > new Date(b.date) ? 1 : -1;
        })
    }

    return futureTransactions;
}

export const calculateBalancesAtDateInDateRange = (currentBalance: number, transactionsInRange: TransactionModel[], dateRange: DateRange) => {
    let currentDate = new Date();
    let balance = currentBalance;
    let balancesAtDate: BalanceAtDateModel[] = [];

    // //calculate past
    transactionsInRange.filter((transaction) => {
        return transaction.history && new Date(transaction.date) >= new Date(dateRange.startDate)
    }).forEach((transaction) => {
        balance -= getTransactionAmount(transaction)!;
        balancesAtDate.push(
            new BalanceAtDateModel(
                transaction.date,
                balance
            )
        );
    })

    balance = currentBalance;

    //calculate future
    transactionsInRange.filter((transaction) => {
        return !transaction.history
    }).forEach((transaction) => {
        balance += getTransactionAmount(transaction)!;
        balancesAtDate.push(
            new BalanceAtDateModel(
                transaction.date,
                balance
            )
        );
    })

    //fill in missing dates
    balance = currentBalance;

    let startDate = new Date(dateRange.startDate);
    let endDate = new Date(dateRange.endDate);

    for (let date = currentDate; date >= startDate; date.setDate(date.getDate() - 1)) {
        let dateString = formatDateToStandardString(date);

        const balanceAtDate = balancesAtDate.find((balanceAtDate) => balanceAtDate.date === dateString);

        if (!balanceAtDate) {
            balancesAtDate.push(new BalanceAtDateModel(dateString, balance));
        } else {
            balance = balanceAtDate.balance
        }
    }

    balance = currentBalance;

    for (let date = new Date(currentDate.setDate(currentDate.getDate() + 1)); date <= endDate; date.setDate(date.getDate() + 1)) {
        let dateString = formatDateToStandardString(date);

        const balanceAtDate = balancesAtDate.find((balanceAtDate) => balanceAtDate.date === dateString);

        if (!balanceAtDate) {
            balancesAtDate.push(new BalanceAtDateModel(dateString, balance));
        } else {
            balance = balanceAtDate.balance
        }
    }

    balancesAtDate.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
    })

    return balancesAtDate.filter((balanceAtDate) => {
        return new Date(balanceAtDate.date) >= new Date(dateRange.startDate) && new Date(balanceAtDate.date) <= new Date(dateRange.endDate)
    })
}