import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {RepetitionHelper} from "./RepetitionHelper";
import {formatDateToStandardString} from "./DateHelper";
import {DateRangeModel} from "../Data/DataModels/DateRangeModel";
import {BalanceAtDateModel} from "../Data/DataModels/Chart/BalanceAtDateModel";
import {getTransactionAmount} from "./CurrencyHelper";
import {DatabaseRoutes} from "./DatabaseRoutes";
import {TransactionGroupModel} from "../Data/DataModels/TransactionGroupModel";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {DebtGroupModel} from "../Data/DataModels/DebtGroupModel";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import {RepetitionModel} from "../Data/DataModels/Reptition/RepetitionModel";
import {ExecutionType} from "../Data/EnumTypes/ExecutionType";
import {getActiveDatabaseHelper} from "./Database/ActiveDBHelper";

export const calculateNFutureTransactions = (getDatabaseRoute: (databaseRoute: DatabaseRoutes) => string, transactions: TransactionModel[], amount: number) => {
    const clonedTransactions: TransactionModel[] = structuredClone(transactions)

    let futureTransactions: TransactionModel[] = [];
    let transactionQueue: TransactionModel[] = [...clonedTransactions];

    transactionQueue.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
    })

    while (futureTransactions.length < amount) {
        if (transactionQueue.length === 0) {
            break;
        }

        let currentTransaction = transactionQueue.shift()!;
        let nextDate = new RepetitionHelper(currentTransaction).calculateNextRepetitionDate(getDatabaseRoute);

        if (nextDate === null) continue;

        let nextTransaction = {
            ...currentTransaction,
            date: nextDate
        } as TransactionModel;

        futureTransactions.push({
            ...currentTransaction,
            future: true
        } as TransactionModel);

        if (nextTransaction.repetition) {
            transactionQueue.push(nextTransaction);
        }

        transactionQueue.sort((a, b) => {
            return new Date(a.date) > new Date(b.date) ? 1 : -1;
        })
    }

    return futureTransactions;
}

export const calculateFutureTransactionsUntilDate = (getDatabaseRoute: (databaseRoute: DatabaseRoutes) => string, transactions: TransactionModel[], date: string) => {
    const clonedTransactions: TransactionModel[] = structuredClone(transactions)

    let futureTransactions: TransactionModel[] = [];
    let transactionQueue: TransactionModel[] = [
        ...clonedTransactions.filter((transaction) => new Date(transaction.date) <= new Date(date))
    ];

    transactionQueue.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
    })

    while (transactionQueue.length > 0) {
        let currentTransaction = transactionQueue.shift()!;
        let nextDate = new RepetitionHelper(currentTransaction).calculateNextRepetitionDate(getDatabaseRoute);

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

export const calculateBalancesAtDateInDateRange = (currentBalance: number, transactionsInRange: TransactionModel[], dateRange: DateRangeModel, baseCurrency: string | null | undefined) => {
    let currentDate = new Date();
    let balance = currentBalance;
    let balancesAtDateMap: { [key: string]: number } = {};

    //calculate past
    transactionsInRange.filter((transaction) => {
        return transaction.history
    }).forEach((transaction) => {
        balance -= getTransactionAmount(transaction, baseCurrency)!;
        balancesAtDateMap[transaction.date] = balance
    })

    balance = currentBalance;

    //calculate future
    transactionsInRange.filter((transaction) => {
        return !transaction.history
    }).forEach((transaction) => {
        balance += getTransactionAmount(transaction, baseCurrency)!;
        balancesAtDateMap[transaction.date] = balance
    })

    //fill in missing dates
    balance = currentBalance;

    let startDate = new Date(dateRange.startDate);
    let endDate = new Date(dateRange.endDate);

    //For past
    for (let date = currentDate; date >= startDate; date.setDate(date.getDate() - 1)) {
        let dateString = formatDateToStandardString(date);

        const balanceAtDate = Object.keys(balancesAtDateMap).find((key) => key === dateString);

        if (!balanceAtDate) {
            balancesAtDateMap[dateString] = balance;
        } else {
            balance = balancesAtDateMap[dateString]
        }
    }

    balance = currentBalance;

    //For future
    for (let date = new Date(currentDate.setDate(currentDate.getDate() + 1)); date <= endDate; date.setDate(date.getDate() + 1)) {
        let dateString = formatDateToStandardString(date);

        const balanceAtDate = Object.keys(balancesAtDateMap).find((key) => key === dateString);

        if (!balanceAtDate) {
            balancesAtDateMap[dateString] = balance;
        } else {
            balance = balancesAtDateMap[dateString]
        }
    }

    const balancesAtDate = Object.keys(balancesAtDateMap).map((key) => {
        return new BalanceAtDateModel(key, balancesAtDateMap[key]);
    })

    balancesAtDate.sort((a, b) => {
        return new Date(a.date) > new Date(b.date) ? 1 : -1;
    })

    return balancesAtDate.filter((balanceAtDate) => {
        return new Date(balanceAtDate.date) >= new Date(dateRange.startDate) && new Date(balanceAtDate.date) <= new Date(dateRange.endDate)
    })
}

export const groupTransactions = (
    transactions: (TransactionModel | DebtModel)[],
    createNewGroupMode: (date: string, subTransactions: (TransactionModel | DebtModel)[]) => (TransactionGroupModel | DebtGroupModel),
    sortTransactions: (transactions: (TransactionModel | DebtModel)[]) => void,
    showStartOfMonth: boolean = true
) => {
    const groups: (TransactionGroupModel | DebtGroupModel)[] = [];

    let date = transactions[0].date;
    let subTransactions = [transactions[0]];

    transactions.forEach((debt, index) => {
        if (index === 0) return;

        if (debt.date === date) {
            subTransactions.push(debt);
        } else {
            subTransactions.sort((a, b) => {
                return a.name > b.name ? 1 : -1;
            })
            groups.push(createNewGroupMode(date, subTransactions))
            date = debt.date;
            subTransactions = [debt]
        }
    });

    sortTransactions(transactions)
    groups.push(createNewGroupMode(date, subTransactions));

    let previousMonth: number | null = null;
    let previousYear: number | null = null;

    return showStartOfMonth ? groups.map(group => {
        const dateObj = new Date(group.date);
        const currentMonth = dateObj.getMonth();
        const currentYear = dateObj.getFullYear();

        const isStartOfMonth = previousMonth !== currentMonth || previousYear !== currentYear;

        previousMonth = currentMonth;
        previousYear = currentYear;

        return {
            ...group,
            isStartOfMonth: isStartOfMonth
        }
    }) : groups;
}

export const executePastTransactions = (
    transactions: TransactionModel[],
    currentAccount: AccountModel,
    updateAccountBalance: (amount: number) => void,
    getDatabaseRoute: (databaseRoute: DatabaseRoutes) => string
) => {
    return new Promise<void>((resolve) => {
        const promises: Promise<void>[] = [];

        transactions.filter((transaction) => {
            return new Date(transaction.date) < new Date() && !transaction.future && !transaction.history
        }).forEach((transaction) => {
            promises.push(executeTransaction(transaction, currentAccount, updateAccountBalance, getDatabaseRoute))
        })

        Promise.all(promises).then(() => {
            resolve()
        })
    })
}

export const executeTransaction = (
    transaction: TransactionModel,
    currentAccount: AccountModel,
    updateAccountBalance: (amount: number) => void,
    getDatabaseRoute: (databaseRoute: DatabaseRoutes) => string
) => {
    return new Promise<void>((resolve, reject) => {
        updateAccountBalance(currentAccount.balance + getTransactionAmount(transaction, currentAccount.currencyCode)!);

        if (transaction.history) {
            //Duplicate transaction to current date
            getActiveDatabaseHelper().addDBItem(
                getDatabaseRoute(DatabaseRoutes.HISTORY_TRANSACTIONS),
                {
                    ...transaction,
                    uid: "",
                    repetition: new RepetitionModel(
                        ExecutionType.PAST
                    ),
                    date: formatDateToStandardString(new Date()),
                    history: true
                }
            ).then(() => {
                resolve()
            })
        } else {
            const newTransactions = []
            let previousDate = transaction.date;
            let nextDate = new RepetitionHelper(transaction).calculateNextRepetitionDate(getDatabaseRoute);

            while (nextDate && new Date(nextDate) <= new Date()) {
                newTransactions.push({
                    ...transaction,
                    uid: "",
                    repetition: new RepetitionModel(
                        ExecutionType.PAST
                    ),
                    date: nextDate,
                    history: true
                })
                previousDate = nextDate;
                nextDate = new RepetitionHelper(transaction).calculateNextRepetitionDate(getDatabaseRoute);
            }

            newTransactions.forEach((newTransaction) => {
                getActiveDatabaseHelper().addDBItem(
                    getDatabaseRoute(DatabaseRoutes.HISTORY_TRANSACTIONS),
                    newTransaction
                )
            })

            if (!nextDate && new Date(previousDate) <= new Date()) {
                getActiveDatabaseHelper().deleteDBItem(
                    getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
                    transaction
                ).then(() => {
                    resolve()
                })
            } else {
                getActiveDatabaseHelper().updateDBItem(
                    getDatabaseRoute(DatabaseRoutes.TRANSACTIONS),
                    {
                        ...transaction,
                        date: nextDate
                    }
                ).then(() => {
                    resolve()
                })
            }
        }
    })
}