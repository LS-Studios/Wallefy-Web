import React, {useEffect} from 'react';
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {TransactionGroupModel} from "../../../Data/Transactions/TransactionGroupModel";
import TransactionGroup from "./TransactionGroup/TransactionGroup";
import {SortType} from "../../../Data/SortType";
import {FilterModel} from "../../../Data/FilterModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {formatDateToStandardString} from "../../../Helper/DateHelper";
import {calculateNFutureTransactions, getTransactionAmount} from "../../../Helper/TransactionHelper";
import {TransactionType} from "../../../Data/Transactions/TransactionType";
import LoadMoreButton from "./LoadMoreButton/LoadMoreButton";

const TransactionsScreen = ({
    searchValue,
    sortValue,
    filterValue,
}: {
    searchValue: string,
    sortValue: SortType,
    filterValue: FilterModel
}) => {
    const [currentTab, setCurrentTab] = React.useState<number>(0);

    const [historyTransactions, setHistoryTransactions] = React.useState<TransactionModel[]>([]);
    const [presetTransactions, setPresetTransactions] = React.useState<TransactionModel[]>([]);
    const [futureTransactions, setFutureTransactions] = React.useState<TransactionModel[]>([]);
    const [futureTransactionsAmount, setFutureTransactionsAmount] = React.useState<number>(30);
    const [futureTransactionsQueue, setFutureTransactionsQueue] = React.useState<TransactionModel[] | null>(null);
    const [transactions, setTransactions] = React.useState<TransactionModel[]>([]);
    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[]>([])
    const [transactionPartners, setTransactionPartners] = React.useState<TransactionPartnerModel[] | null>(null)


    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, setTransactionPartners)
    }, [])

    useEffect(() => {
        switch (currentTab) {
            case 0:
                getDBItemsOnChange(DatabaseRoutes.HISTORY_TRANSACTIONS, setHistoryTransactions)
                break;
            default:
                getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, setPresetTransactions)
                break;
        }
    }, [currentTab]);

    useEffect(() => {
        switch (currentTab) {
            case 0:
                setTransactions(historyTransactions)
                break;
            case 1:
                setTransactions(presetTransactions)
                break;
            case 2:
                setTransactions(futureTransactions)
                break;
        }
    }, [historyTransactions, presetTransactions, futureTransactions, currentTab]);

    useEffect(() => {
        if (futureTransactions.length >= futureTransactionsAmount) return
        if (currentTab !== 2) return

        const {nextFutureTransactions, transactionQueue} = calculateNFutureTransactions(futureTransactionsQueue || presetTransactions, futureTransactionsAmount - futureTransactions.length);
        setFutureTransactions([...futureTransactions, ...nextFutureTransactions])
        setFutureTransactionsQueue(transactionQueue)
    }, [presetTransactions, futureTransactionsAmount]);

    useEffect(() => {
        let filteredTransactions = []

        //Search
        filteredTransactions = transactions.filter((transaction) => transaction.name.toLowerCase().includes(searchValue.toLowerCase()))

        //Sort
        switch (sortValue) {
            case SortType.NEWEST_FIRST:
                filteredTransactions.sort((a, b) => {
                    return new Date(a.date) > new Date(b.date) ? 1 : -1;
                })
                break;
            case SortType.PRICE_HIGH_TO_LOW:
                filteredTransactions.sort((a, b) => {
                    return (getTransactionAmount(a) || 0) < (getTransactionAmount(b) || 0) ? 1 : -1;
                })
                break;
            case SortType.PRICE_LOW_TO_HIGH:
                filteredTransactions.sort((a, b) => {
                    return (getTransactionAmount(a) || 0) > (getTransactionAmount(b) || 0) ? 1 : -1;
                })
                break;
        }

        //Filter
        filteredTransactions = filteredTransactions.filter((transaction) => {
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
                if ((getTransactionAmount(transaction) || 0) < filterValue.priceRange.minPrice || (getTransactionAmount(transaction) || 0) > filterValue.priceRange.maxPrice) {
                    return false
                }
            }
            if (filterValue.transactionType !== null) {
                if (transaction.transactionType !== filterValue.transactionType) {
                    return false
                }
            }

            return true
        })

        if (filteredTransactions.length <= 0) {
            setTransactionGroups([])
            return
        }

        filteredTransactions.sort((a, b) => new Date(a.date) > new Date(b.date) ? 1 : -1);

        const transactionMap: { [key: string]: TransactionModel[] } = {};

        filteredTransactions.forEach((transaction) => {
            if (!transactionMap[transaction.date]) {
                transactionMap[transaction.date] = []
            }
            transactionMap[transaction.date].push(transaction)
        })

        let previousMonth: number | null = null;
        let previousYear: number | null = null;

        const transactionGroups = Object.keys(transactionMap).map(date => {
            const dateObj = new Date(date);
            const currentMonth = dateObj.getMonth();
            const currentYear = dateObj.getFullYear();

            const isStartOfMonth = previousMonth !== currentMonth || previousYear !== currentYear;

            previousMonth = currentMonth;
            previousYear = currentYear;

            return {
                date,
                transactions: transactionMap[date],
                isStartOfMonth
            };
        });

        setTransactionGroups(transactionGroups);
    }, [transactions, searchValue, sortValue, filterValue]);

    return (
        <div className="list-screen">
            <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>Past</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>Presets</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>Upcoming</span>
            </div>
            <div className="screen-list-items">
                {
                    transactionGroups.map((transactionGroup, index) => (
                        <TransactionGroup key={index} transactionGroup={transactionGroup} transactionPartners={transactionPartners} />
                    ))
                }
                { currentTab === 2 && transactions.length > 0 && <LoadMoreButton onClick={() => {
                    setFutureTransactionsAmount((oldValue) => {
                        return oldValue + 30
                    })
                }} /> }
            </div>
        </div>
    );
};

export default TransactionsScreen;