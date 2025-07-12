import React, {useEffect, useMemo} from 'react';
import {MdSchedule} from "react-icons/md";
import Divider from "../../../Components/Divider/Divider";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useTransactions} from "../../../../CustomHooks/Database/useTransactions";
import {useTransactionPartners} from "../../../../CustomHooks/Database/useTransactionPartners";
import {groupTransactions} from "../../../../Helper/TransactionHelper";
import {TransactionGroupModel} from "../../../../Data/DataModels/TransactionGroupModel";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import TransactionGroup from "../../Transactions/TransactionGroup/TransactionGroup";
import {useAccountRoute} from "../../../../CustomHooks/Database/useAccountRoute";
import "./UpcomingTransactionsCard.scss";
import {useWebWorker} from "../../../../CustomHooks/useWebWorker";
import {CalculateNFutureTransactionsWorkerData} from "../../../../Workers/CalculateNFutureTransactionsWorker";
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";

const UpcomingTransactionsCard = () => {
    const translate = useTranslation();
    const getDatabaseRoute = useAccountRoute();

    const transactions = useTransactions();
    const [next5Transactions, setNext5Transactions] = React.useState<TransactionModel[] | null>(null);
    const transactionPartners = useTransactionPartners()

    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[] | null>(null)

    const runTask = useWebWorker<CalculateNFutureTransactionsWorkerData, TransactionModel[]>(() => new Worker(
        new URL(
            "../../../../Workers/CalculateNFutureTransactionsWorker.ts",
            import.meta.url
        )
    ), [])

    useEffect(() => {
        if (!getDatabaseRoute || !transactions) return

        runTask({
            getDatabaseRoute: getDatabaseRoute,
            transactions: transactions,
            amount: 5
        }, "calculate-next-5-transactions").then((futureTransactions) => {
            setNext5Transactions(futureTransactions)
        })
    }, [runTask, getDatabaseRoute, transactions]);

    useEffect(() => {
        if (!next5Transactions) {
            setTransactionGroups(null)
            return
        } else if (next5Transactions.length === 0) {
            setTransactionGroups([])
            return
        }

        setTransactionGroups(groupTransactions(
            next5Transactions,
            (date, transactions) => {
                return new TransactionGroupModel(date, transactions as TransactionModel[])
            },
            (transaction) => {
                next5Transactions.sort((a, b) => {
                    return new Date(a.date) > new Date(b.date) ? 1 : -1;
                })
            },
            false
        ) as TransactionGroupModel[]);
    }, [next5Transactions]);

    return (
        <div className="card">
            <div className="card-title-container">
                <MdSchedule />
                <span>{translate("upcoming-transactions")}</span>
            </div>
            <Divider useOutlineColor={true} />
            <div className="upcoming-transactions-card-content">
                { transactionGroups ?
                    transactionGroups.length > 0 ?
                        transactionGroups.map((transactionGroup: TransactionGroupModel, index) => {
                            return <TransactionGroup
                                key={index}
                                transactionGroup={transactionGroup}
                                transactionPartners={transactionPartners}
                            />
                        }) : <span className="no-items">{translate("no-upcoming-transactions")}</span>
                    : <Spinner type={SpinnerType.DOTS} center={true} />
                }
            </div>
        </div>
    );
};

export default UpcomingTransactionsCard;