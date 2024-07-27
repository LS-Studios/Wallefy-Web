import React, {useEffect, useMemo} from 'react';
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {TransactionGroupModel} from "../../../Data/DataModels/TransactionGroupModel";
import TransactionGroup from "./TransactionGroup/TransactionGroup";
import {SortType} from "../../../Data/EnumTypes/SortType";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import LoadMoreButton from "./LoadMoreButton/LoadMoreButton";
import {getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useTransactions} from "../../../CustomHooks/Database/useTransactions";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {useHistoryTransactions} from "../../../CustomHooks/Database/useHistoryTransactions";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import SelectionInput from "../../Components/SelectionInput/SelectionInput";
import {InputOptionModel} from "../../../Data/DataModels/Input/InputOptionModel";
import {useScreenScaleStep} from "../../../CustomHooks/useScreenScaleStep";
import {useWebWorker} from "../../../CustomHooks/useWebWorker";
import {CalculateNFutureTransactionsWorkerData} from "../../../Workers/CalculateNFutureTransactionsWorker";
import {SortFilterGroupWorkerData} from "../../../Workers/SortFilterGroupWorker";
import transaction from "./Transaction/Transaction";

const TransactionsScreen = ({
    sortValue,
    filterValue,
}: {
    sortValue: SortType,
    filterValue: FilterModel
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const getDatabaseRoute = useAccountRoute()
    const { currentAccount } = useCurrentAccount();
    const screenScaleStep = useScreenScaleStep()

    const [currentTab, setCurrentTab] = React.useState<number>(1);

    const historyTransactions = useHistoryTransactions()
    const presetTransactions = useTransactions()
    const debtTransactions = useDebts()
    const transactionPartners = useTransactionPartners()

    const [futureTransactions, setFutureTransactions] = React.useState<TransactionModel[]>([]);
    const [futureTransactionsAmount, setFutureTransactionsAmount] = React.useState<number>(30);
    const [transactions, setTransactions] = React.useState<TransactionModel[] | null>(null);
    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[] | null>(null)

    const [isLoadingMore, setIsLoadingMore] = React.useState<boolean>(false)

    const tabOptions= [
        new InputOptionModel(translate("past"), 0),
        new InputOptionModel(translate("presets"), 1),
        new InputOptionModel(translate("upcoming"), 2)
    ]

    const runLoadMore = useWebWorker<CalculateNFutureTransactionsWorkerData, TransactionModel[]>(() => new Worker(
        new URL(
            "../../../Workers/CalculateNFutureTransactionsWorker.ts",
            import.meta.url
        )
    ), [])
    const runSortFilterGroup = useWebWorker<SortFilterGroupWorkerData, TransactionGroupModel[]>(() => new Worker(
        new URL(
            "../../../Workers/SortFilterGroupWorker.ts",
            import.meta.url
        )
    ), [transactions, sortValue, filterValue])

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
        if (!presetTransactions || !getDatabaseRoute) return

        setIsLoadingMore(true)

        runLoadMore({
            getDatabaseRoute: getDatabaseRoute,
            transactions: presetTransactions,
            amount: futureTransactionsAmount
        }).then((futureTransactions) => {
            setIsLoadingMore(false)
            setFutureTransactions(futureTransactions)
        })
    }, [runLoadMore, getDatabaseRoute, presetTransactions, futureTransactionsAmount]);

    useEffect(() => {
        if (!currentAccount || !transactions) {
            setTransactionGroups(null)
            return
        }

        runSortFilterGroup({
            translate: translate,
            currentAccount: currentAccount,
            transactions: transactions || [],
            sortValue: sortValue,
            filterValue: filterValue
        }).then((transactionGroups) => {
            setTransactionGroups(transactionGroups)
        })
    }, [transactions, currentAccount, sortValue, filterValue]);

    return (
        <div className="list-screen">
            { screenScaleStep === 2 ? <SelectionInput
                value={tabOptions.find((option) => option.value === currentTab) || tabOptions[0]}
                onValueChanged={(value) => setCurrentTab(value.value)}
                options={tabOptions}
            /> : <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}>{translate("past")}</span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}>{translate("presets")}</span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}>{translate("upcoming")}</span>
            </div> }
            <div className="screen-list-items">
                {transactionGroups ? (
                    transactionGroups.length > 0 ? <>
                        {
                            transactionGroups.map((transactionGroup, index) => (
                                <TransactionGroup
                                    key={index}
                                    transactionGroup={transactionGroup}
                                    transactionPartners={transactionPartners}
                                />
                            ))
                        }
                        {currentTab === 2 && <LoadMoreButton onClick={() => {
                            setFutureTransactionsAmount((oldValue) => {
                                return oldValue + 30
                            })
                        }} isLoading={isLoadingMore}/>}
                    </> : <span className="no-items">{translate("no-transactions-found")}</span>
                ) : <Spinner type={SpinnerType.CYCLE}/>}
            </div>
        </div>
    );
};

export default TransactionsScreen;