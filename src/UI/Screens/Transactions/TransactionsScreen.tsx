import React, {useEffect} from 'react';
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {TransactionGroupModel} from "../../../Data/DataModels/TransactionGroupModel";
import TransactionGroup from "./TransactionGroup/TransactionGroup";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {calculateNFutureTransactions, groupTransactions} from "../../../Helper/TransactionHelper";
import LoadMoreButton from "./LoadMoreButton/LoadMoreButton";
import {getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useTransactions} from "../../../CustomHooks/useTransactions";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {getDataSetPath} from "acebase/dist/types/test/dataset";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import {useHistoryTransactions} from "../../../CustomHooks/useHistoryTransactions";
import {useDebts} from "../../../CustomHooks/useDebts";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";

const TransactionsScreen = ({
    searchValue,
    sortValue,
    filterValue,
}: {
    searchValue: string,
    sortValue: SortType,
    filterValue: FilterModel
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const getDatabaseRoute = useDatabaseRoute()
    const currentAccount = useCurrentAccount()

    const [currentTab, setCurrentTab] = React.useState<number>(1);

    const historyTransactions = useHistoryTransactions()
    const presetTransactions = useTransactions()
    const debtTransactions = useDebts()
    const transactionPartners = useTransactionPartners()

    const [futureTransactions, setFutureTransactions] = React.useState<TransactionModel[]>([]);
    const [futureTransactionsAmount, setFutureTransactionsAmount] = React.useState<number>(30);
    const [transactions, setTransactions] = React.useState<TransactionModel[] | null>(null);
    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[] | null>(null)

    useEffect(() => {
        switch (currentTab) {
            case 0:
                if (historyTransactions) setTransactions(historyTransactions)
                break;
            case 1:
                if (presetTransactions) setTransactions(presetTransactions)
                break;
            case 2:
                if (futureTransactions) setTransactions(futureTransactions)
                break;
        }
    }, [historyTransactions, presetTransactions, futureTransactions, debtTransactions, currentTab]);

    useEffect(() => {
        if (currentTab !== 2 || !presetTransactions || !getDatabaseRoute) return

        const nextFutureTransactions = calculateNFutureTransactions(getDatabaseRoute, presetTransactions, futureTransactionsAmount);
        setFutureTransactions(nextFutureTransactions)
    }, [getDatabaseRoute, presetTransactions, futureTransactionsAmount]);

    useEffect(() => {
        if (!currentAccount) return

        let filteredTransactions = []

        if (transactions === null) {
            setTransactionGroups(null)
            return
        }

        //Search
        filteredTransactions = transactions.filter((transaction) => transaction.name.toLowerCase().includes(searchValue.toLowerCase()))

        //Sort
        const sortTransactions = (transactions: TransactionModel[]) => {
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
            if (filterValue.transactionType !== null) {
                if (transaction.transactionType !== filterValue.transactionType) {
                    return false
                }
            }

            return true
        })

        // Group
        if (filteredTransactions.length <= 0) {
            setTransactionGroups([])
            return
        }

        sortTransactions(filteredTransactions)

        const groups: TransactionGroupModel[] = [];

        const pausedTransactions = filteredTransactions.filter(transaction => transaction.repetition.isPaused)
        pausedTransactions.length > 0 && groups.push(
            new TransactionGroupModel(
                translate("paused"),
                pausedTransactions
            )
        )

        const pendingTransactions = filteredTransactions.filter(transaction => transaction.repetition.isPending)
        pendingTransactions.length > 0 && groups.push(
            new TransactionGroupModel(
                translate("pending"),
                pendingTransactions
            )
        )

        setTransactionGroups(groupTransactions(
            [
                ...pausedTransactions,
                ...pendingTransactions,
                ...filteredTransactions.filter(transaction => {
                    return !transaction.repetition.isPending && !transaction.repetition.isPaused
                })
            ],
            (date, transactions) => {
                return new TransactionGroupModel(date, transactions as TransactionModel[])
            },
            (transactions) => {
                sortTransactions(transactions as TransactionModel[])
            }
        ) as TransactionGroupModel[]);
    }, [transactions, currentAccount, searchValue, sortValue, filterValue]);

    return (
        <div className="list-screen">
            <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>{translate("past")}</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>{translate("presets")}</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>{translate("upcoming")}</span>
            </div>
            <div className="screen-list-items">
                { transactionGroups ? (
                    transactionGroups.length > 0 ? <>
                        {
                            transactionGroups.map((transactionGroup, index) => (
                                <TransactionGroup
                                    key={index}
                                    transactionGroup={transactionGroup}
                                    transactionPartners={transactionPartners}
                                    settings={settings}
                                    translate={translate}
                                />
                            ))
                        }
                        {currentTab === 2 && <LoadMoreButton onClick={() => {
                            setFutureTransactionsAmount((oldValue) => {
                                return oldValue + 30
                            })
                        }}/>}
                    </> : <span className="no-items">{translate("no-transactions-found")}</span>
                ) : <Spinner type={SpinnerType.CYCLE} /> }
            </div>
        </div>
    );
};

export default TransactionsScreen;