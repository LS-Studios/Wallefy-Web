import React, {useEffect} from 'react';
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {TransactionGroupModel} from "../../../Data/Transactions/TransactionGroupModel";
import TransactionGroup from "./TransactionGroup/TransactionGroup";
import {SortType} from "../../../Data/SortType";
import {FilterModel} from "../../../Data/FilterModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {formatDateToStandardString, getDateFromStandardString} from "../../../Helper/DateHelper";
import {calculateFutureTransactions, getTransactionAmount} from "../../../Helper/TransactionHelper";
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
                getDBItemsOnChange(DatabaseRoutes.PAST_TRANSACTIONS, setHistoryTransactions)
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

        const {nextFutureTransactions, transactionQueue} = calculateFutureTransactions(futureTransactionsQueue || presetTransactions, futureTransactionsAmount - futureTransactions.length);
        setFutureTransactions([...futureTransactions, ...nextFutureTransactions])
        setFutureTransactionsQueue(transactionQueue)
    }, [presetTransactions, futureTransactionsAmount]);

    useEffect(() => {
        const transactionGroups: TransactionGroupModel[] = [];

        let filteredTransactions = []

        //Search
        filteredTransactions = transactions.filter((transaction) => transaction.name.toLowerCase().includes(searchValue.toLowerCase()))

        //Sort
        switch (sortValue) {
            case SortType.NEWEST_FIRST:
                filteredTransactions.sort((a, b) => {
                    return getDateFromStandardString(a.date) > getDateFromStandardString(b.date) ? 1 : -1;
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
                if (getDateFromStandardString(transaction.date) < getDateFromStandardString(filterValue.dateRange.startDate) || getDateFromStandardString(transaction.date) > getDateFromStandardString(filterValue.dateRange.endDate)) {
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

        let date = filteredTransactions[0].date;
        let subTransactions = [filteredTransactions[0]];

        filteredTransactions.forEach((transaction, index) => {
            if (index === 0) return;

            if (transaction.date === date) {
                subTransactions.push(transaction);
            } else {
                subTransactions.sort((a, b) => {
                    return a.name > b.name ? 1 : -1;
                })
                transactionGroups.push(
                    new TransactionGroupModel(
                        date,
                        subTransactions,
                        getDateFromStandardString(date).getMonth() !== getDateFromStandardString(transaction.date).getMonth() ||
                            getDateFromStandardString(date).getFullYear() !== getDateFromStandardString(transaction.date).getFullYear() ||
                                transactionGroups.length === 0
                    )
                );
                date = transaction.date;
                subTransactions = [transaction]
            }
        });

        subTransactions.sort((a, b) => {
            return a.name > b.name ? 1 : -1;
        })
        console.log(date, subTransactions)
        transactionGroups.push(
            new TransactionGroupModel(
                date,
                subTransactions,
                getDateFromStandardString(date).getMonth() !== getDateFromStandardString(transactionGroups[transactionGroups.length - 1].date).getMonth() ||
                getDateFromStandardString(date).getFullYear() !== getDateFromStandardString(transactionGroups[transactionGroups.length - 1].date).getFullYear()
            )
        );

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