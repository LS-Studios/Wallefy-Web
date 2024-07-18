import React, {useEffect} from 'react';
import {MdBalance, MdPunchClock, MdSchedule} from "react-icons/md";
import Divider from "../../../Components/Divider/Divider";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useTransactions} from "../../../../CustomHooks/Database/useTransactions";
import useTransactionInDateRange from "../../../../CustomHooks/Database/useTransactionInDateRange";
import {DateRangeModel} from "../../../../Data/DataModels/DateRangeModel";
import {formatDateToStandardString} from "../../../../Helper/DateHelper";
import Transaction from "../../Transactions/Transaction/Transaction";
import {useTransactionPartners} from "../../../../CustomHooks/Database/useTransactionPartners";
import {calculateNFutureTransactions, groupTransactions} from "../../../../Helper/TransactionHelper";
import {TransactionGroupModel} from "../../../../Data/DataModels/TransactionGroupModel";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import TransactionGroup from "../../Transactions/TransactionGroup/TransactionGroup";
import {useDatabaseRoute} from "../../../../CustomHooks/Database/useDatabaseRoute";
import "./UpcomingTransactionsCard.scss";

const UpcomingTransactionsCard = () => {
    const translate = useTranslation();
    const getDatabaseRoute = useDatabaseRoute();

    const transactions = useTransactions();
    const [next5Transactions, setNext5Transactions] = React.useState<TransactionModel[]>([]);
    const transactionPartners = useTransactionPartners()

    const [transactionGroups, setTransactionGroups] = React.useState<any[]>([])

    useEffect(() => {
        if (!getDatabaseRoute || !transactions) return

        setNext5Transactions(calculateNFutureTransactions(getDatabaseRoute, transactions, 5))
    }, [getDatabaseRoute, transactions]);

    useEffect(() => {
        if (!next5Transactions || next5Transactions.length === 0) {
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
                { transactionGroups.map((transactionGroup: TransactionGroupModel, index) => {
                    return <TransactionGroup
                        key={index}
                        transactionGroup={transactionGroup}
                        transactionPartners={transactionPartners}
                    />
                })}
            </div>
        </div>
    );
};

export default UpcomingTransactionsCard;