import {DateRangeModel} from "../../Data/DataModels/DateRangeModel";
import React, {useEffect, useMemo, useState} from "react";
import {TransactionModel} from "../../Data/DatabaseModels/TransactionModel";
import {calculateBalancesAtDateInDateRange, calculateFutureTransactionsUntilDate} from "../../Helper/TransactionHelper";
import {TransactionType} from "../../Data/EnumTypes/TransactionType";
import {addMonths, formatDateToStandardString, getEndOfMonth} from "../../Helper/DateHelper";
import {getTransactionAmount} from "../../Helper/CurrencyHelper";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import {useTransactions} from "./useTransactions";
import {useAccountRoute} from "./useAccountRoute";
import {useHistoryTransactions} from "./useHistoryTransactions";
import {useWebWorker} from "../useWebWorker";
import {CalculateBalancesAtDateInDateRangeWorkerData} from "../../Workers/CalculateBalancesAtDateInDateRangeWorker";
import {BalanceAtDateModel} from "../../Data/DataModels/Chart/BalanceAtDateModel";
import {CalculateFutureTransactionsUntilDateWorkerData} from "../../Workers/CalculateFutureTransactionsUntilDateWorker";

const useTransactionInDateRange = (dateRange: DateRangeModel) => {
    const getDatabaseRoute = useAccountRoute()
    const { currentAccount } = useCurrentAccount();

    const historyTransactions = useHistoryTransactions()
    const presetTransactions = useTransactions()
    const [transactionsUntilDateRange, setTransactionsUntilDateRange] = React.useState<TransactionModel[]>([]);
    const [transactionsInDateRange, setTransactionsInDateRange] = React.useState<TransactionModel[]>([]);

    const [totalIncome, setTotalIncome] = useState<number | null>(null)
    const [totalExpenses, setTotalExpenses] = useState<number | null>(null)
    const [totalBalance, setTotalBalance] = useState<number | null>(null)
    const [totalSavings, setTotalSavings] = useState<number | null>(null)

    const runBalancesAtDateInDateRange = useWebWorker<CalculateBalancesAtDateInDateRangeWorkerData, BalanceAtDateModel[]>(() => new Worker(
        new URL(
            "../../Workers/CalculateBalancesAtDateInDateRangeWorker.ts",
            import.meta.url
        )
    ), [])

    const runCalculateFutureTransactionsUntilDate = useWebWorker<CalculateFutureTransactionsUntilDateWorkerData, TransactionModel[]>(() => new Worker(
        new URL(
            "../../Workers/CalculateFutureTransactionsUntilDateWorker.ts",
            import.meta.url
        )
    ), [])


    useEffect(() => {
        if (!presetTransactions || !getDatabaseRoute) return

        setTotalIncome(null)
        setTotalExpenses(null)
        setTotalBalance(null)
        setTotalSavings(null)

        runCalculateFutureTransactionsUntilDate({
            getDatabaseRoute,
            transactions: presetTransactions,
            date: dateRange.endDate
        }).then((futureTransactions) => {
            setTransactionsInDateRange((current: TransactionModel[]) => {
                return [...current.filter((transaction) => transaction.history), ...futureTransactions.filter((transaction) => {
                    return new Date(transaction.date) >= new Date(dateRange.startDate)
                })];
            })
            setTransactionsUntilDateRange((current: TransactionModel[]) => {
                return [...current.filter((transaction) => transaction.history), ...futureTransactions];
            })
        })
    }, [getDatabaseRoute, presetTransactions, dateRange]);

    useEffect(() => {
        if (!historyTransactions) return

        setTransactionsInDateRange((current: TransactionModel[]) => {
            return [...historyTransactions, ...current.filter((transaction) => !transaction.history)];
        })
        setTransactionsUntilDateRange((current: TransactionModel[]) => {
            return [...historyTransactions, ...current.filter((transaction) => !transaction.history)];
        })
    }, [historyTransactions, dateRange]);

    useEffect(() => {
        const totalIncome = transactionsInDateRange.filter((transaction) => {
            return transaction.transactionType === TransactionType.INCOME
        }).reduce((acc, transaction) => acc + getTransactionAmount(transaction, currentAccount?.currencyCode, true), 0)
        const totalExpenses = transactionsInDateRange.filter((transaction) => {
            return transaction.transactionType === TransactionType.EXPENSE
        }).reduce((acc, transaction) => acc + getTransactionAmount(transaction, currentAccount?.currencyCode, true), 0)

        setTotalIncome(totalIncome)
        setTotalExpenses(totalExpenses)
        setTotalBalance(totalIncome - totalExpenses)

        const dateThreshold = getEndOfMonth(addMonths(new Date(dateRange.startDate), 4))

        if (!getDatabaseRoute || !currentAccount || !presetTransactions) return

        runCalculateFutureTransactionsUntilDate({
            getDatabaseRoute,
            transactions: presetTransactions,
            date: dateRange.endDate
        }).then((futureTransactions) => {
            runBalancesAtDateInDateRange({
                currentBalance: currentAccount.balance!,
                transactionsInRage: futureTransactions,
                dateRange: new DateRangeModel(
                    dateRange.startDate,
                    formatDateToStandardString(dateThreshold)
                ),
                baseCurrency: currentAccount.currencyCode
            }).then((balances) => {
                setTotalSavings(balances.length > 0 ? Math.min(...balances.map((balance) => balance.balance)) : 0)
            })
        })
    }, [presetTransactions, transactionsInDateRange, getDatabaseRoute, currentAccount]);

    return {
        transactionsInDateRange,
        transactionsUntilDateRange,
        totalIncome,
        totalExpenses,
        totalBalance,
        totalSavings
    }
}

export default useTransactionInDateRange;