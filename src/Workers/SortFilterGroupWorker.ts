/* eslint-disable no-restricted-globals */

import {calculateNFutureTransactions, groupTransactions} from "../Helper/TransactionHelper";
import {DatabaseRoutes} from "../Helper/DatabaseRoutes";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {SortType} from "../Data/EnumTypes/SortType";
import {getTransactionAmount} from "../Helper/CurrencyHelper";
import {TransactionGroupModel} from "../Data/DataModels/TransactionGroupModel";
import {FilterModel} from "../Data/DataModels/FilterModel";
import {AccountModel} from "../Data/DatabaseModels/AccountModel";
import transaction from "../UI/Screens/Transactions/Transaction/Transaction";
import {DebtModel} from "../Data/DatabaseModels/DebtModel";
import {DebtGroupModel} from "../Data/DataModels/DebtGroupModel";

export type SortFilterGroupWorkerData = {
    translate: ((key: string) => string),
    currentAccount: AccountModel,
    transactions: (TransactionModel | DebtModel)[],
    sortValue: SortType,
    filterValue: FilterModel,
    isDebtScreen?: boolean
}

self.onmessage = (e: MessageEvent<string>) => {
    const { translate, currentAccount, transactions, sortValue, filterValue, isDebtScreen }: SortFilterGroupWorkerData = JSON.parse(e.data)

    let filteredTransactions = [...transactions]

    if (transactions === null) {
        self.postMessage(null)
        return
    }

    //Sort
    const sortTransactions = (transactions: (TransactionModel | DebtModel)[]) => {
        switch (sortValue) {
            case SortType.NEWEST_FIRST:
                transactions.sort((a, b) => {
                    return new Date(a.date) > new Date(b.date) ? 1 : -1;
                })
                break;
            case SortType.PRICE_HIGH_TO_LOW:
                transactions.sort((a, b) => {
                    return (getTransactionAmount(a, currentAccount?.currencyCode) || 0) < (getTransactionAmount(b, currentAccount?.currencyCode) || 0) ? 1 : -1;
                })
                break;
            case SortType.PRICE_LOW_TO_HIGH:
                transactions.sort((a, b) => {
                    return (getTransactionAmount(a, currentAccount?.currencyCode) || 0) > (getTransactionAmount(b, currentAccount?.currencyCode) || 0) ? 1 : -1;
                })
                break;
        }
    }

    //Filter
    filteredTransactions = filteredTransactions.filter((transaction) => {
        if (filterValue.searchName) {
            if (!transaction.name.toLowerCase().includes(filterValue.searchName.toLowerCase())) {
                return false
            }
        }
        if (filterValue.transactionPartners && filterValue.transactionPartners.length > 0) {
            if (!filterValue.transactionPartners.includes(transaction.transactionExecutorUid!)) {
                return false
            }
        }
        if (filterValue.categories && filterValue.categories.length > 0) {
            if (!filterValue.categories.includes(transaction.categoryUid!)) {
                return false
            }
        }
        if (filterValue.labels && filterValue.labels.length > 0) {
            if (!filterValue.labels.some((label) => transaction.labels?.includes(label))) {
                return false
            }
        }
        if (filterValue.dateRange) {
            if (new Date(transaction.date) < new Date(filterValue.dateRange.startDate) || new Date(transaction.date) > new Date(filterValue.dateRange.endDate)) {
                return false
            }
        }
        if (filterValue.priceRange) {
            if ((getTransactionAmount(transaction, filterValue.priceRange.currency) || 0) < filterValue.priceRange.minPrice || (getTransactionAmount(transaction, filterValue.priceRange.currency) || 0) > filterValue.priceRange.maxPrice) {
                return false
            }
        }
        if (filterValue.transactionType !== null && !isDebtScreen) {
            if ((transaction as TransactionModel).transactionType !== filterValue.transactionType) {
                return false
            }
        }

        return true
    })

    // Group
    if (filteredTransactions.length <= 0) {
        self.postMessage([])
        return
    }

    sortTransactions(filteredTransactions)

    const groups: (TransactionGroupModel | DebtGroupModel)[] = [];

    if (!isDebtScreen) {
        const pausedTransactions = filteredTransactions.filter(transaction => (transaction as TransactionModel).repetition.isPaused)
        pausedTransactions.length > 0 && groups.push(
            new TransactionGroupModel(
                translate("paused"),
                pausedTransactions as TransactionModel[]
            )
        )
        const pendingTransactions = filteredTransactions.filter(transaction => (transaction as TransactionModel).repetition.isPending)
        pendingTransactions.length > 0 && groups.push(
            new TransactionGroupModel(
                translate("pending"),
                pendingTransactions as TransactionModel[]
            )
        )
    }

    if (isDebtScreen) {
        self.postMessage(groupTransactions(
            filteredTransactions,
            (date, debts) => {
                return new DebtGroupModel(date, debts as DebtModel[])
            },
            (debts) => {
                sortTransactions(debts as DebtModel[])
            }
        ) as DebtGroupModel[])
    } else {
        self.postMessage([...groups, ...groupTransactions(
            [
                ...filteredTransactions.filter(transaction => {
                    return !(transaction as TransactionModel).repetition.isPending && !(transaction as TransactionModel).repetition.isPaused
                })
            ],
            (date, transactions) => {
                return new TransactionGroupModel(date, transactions as TransactionModel[])
            },
            (transactions) => {
                sortTransactions(transactions as TransactionModel[])
            }
        ) as TransactionGroupModel[]]);
    }
};

export {};