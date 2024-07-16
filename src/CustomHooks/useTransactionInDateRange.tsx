import {DateRangeModel} from "../Data/DataModels/DateRangeModel";
import React, {useEffect, useMemo, useState} from "react";
import {TransactionModel} from "../Data/DatabaseModels/TransactionModel";
import {calculateBalancesAtDateInDateRange, calculateFutureTransactionsUntilDate} from "../Helper/TransactionHelper";
import {TransactionType} from "../Data/EnumTypes/TransactionType";
import {addMonths, formatDateToStandardString, getEndOfMonth} from "../Helper/DateHelper";
import {getTransactionAmount} from "../Helper/CurrencyHelper";
import {useCurrentAccount} from "../Providers/AccountProvider";
import {useTransactions} from "./useTransactions";
import {useDatabaseRoute} from "./useDatabaseRoute";
import {useHistoryTransactions} from "./useHistoryTransactions";

const useTransactionInDateRange = (dateRange: DateRangeModel) => {
    const getDatabaseRoute = useDatabaseRoute()
    const { currentAccount } = useCurrentAccount();

    const historyTransactions = useHistoryTransactions()
    const presetTransactions = useTransactions()
    const [transactionsUntilDateRange, setTransactionsUntilDateRange] = React.useState<TransactionModel[]>([]);
    const [transactionsInDateRange, setTransactionsInDateRange] = React.useState<TransactionModel[]>([]);

    const [totalIncome, setTotalIncome] = useState<number>(0)
    const [totalExpenses, setTotalExpenses] = useState<number>(0)
    const [totalBalance, setTotalBalance] = useState<number>(0)
    const [totalSavings, setTotalSavings] = useState<number>(0)

    useEffect(() => {
        if (!presetTransactions || !getDatabaseRoute) return

        const futureTransactions = calculateFutureTransactionsUntilDate(getDatabaseRoute, presetTransactions, dateRange.endDate)

        setTransactionsInDateRange((current: TransactionModel[]) => {
            return [...current.filter((transaction) => transaction.history), ...futureTransactions.filter((transaction) => {
                return new Date(transaction.date) >= new Date(dateRange.startDate)
            })];
        })
        setTransactionsUntilDateRange((current: TransactionModel[]) => {
            return [...current.filter((transaction) => transaction.history), ...futureTransactions];
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

        const transactionsInNext4Months = calculateBalancesAtDateInDateRange(
            currentAccount.balance!,
            calculateFutureTransactionsUntilDate(getDatabaseRoute, presetTransactions, formatDateToStandardString(dateThreshold)),
            new DateRangeModel(
                dateRange.startDate,
                formatDateToStandardString(dateThreshold)
            ),
            currentAccount.currencyCode
        ).map(balanceAtDate => balanceAtDate.balance)

        setTotalSavings(
            transactionsInNext4Months.length > 0 ? Math.min(...transactionsInNext4Months) : 0
        )
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