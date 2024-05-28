import React, {useEffect} from 'react';
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {TransactionGroupModel} from "../../../Data/Transactions/TransactionGroupModel";
import TransactionGroup from "./TransactionGroup/TransactionGroup";
import {SortType} from "../../../Data/SortType";
import {FilterModel} from "../../../Data/FilterModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";

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

    const [transactions, setTransactions] = React.useState<TransactionModel[]>([]);
    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[]>([])
    const [transactionPartners, setTransactionPartners] = React.useState<TransactionPartnerModel[] | null>(null)

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, setTransactionPartners)
    }, [])

    useEffect(() => {
        switch (currentTab) {
            case 0:
                getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, setTransactions)
                break;
            case 1:
                getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, setTransactions)
                break;
            case 2:
                getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, setTransactions)
                break;
        }
    }, [currentTab]);

    useEffect(() => {
        const transactionGroups: TransactionGroupModel[] = [];

        transactions.filter((transaction) => transaction.name.toLowerCase().includes(searchValue.toLowerCase())).forEach(transaction => {
            const date = transaction.date;
            const transactionGroup = transactionGroups.find(transactionGroup => transactionGroup.date === date);
            if (transactionGroup) {
                transactionGroup.transactions.push(transaction);
            } else {
                transactionGroups.push(
                    new TransactionGroupModel(
                        date,
                        [transaction],
                        transactionGroups.length === 0 || transactionGroups[transactionGroups.length - 1].date.split("-")[1] !== date.split("-")[1]
                    )
                );
            }
        });

        setTransactionGroups(transactionGroups);
    }, [transactions, searchValue]);

    return (
        <div className="list-screen">
            <div className="screen-tabs">
                <span className={currentTab === 0 ? "selected" : ""} onClick={() => {
                    setCurrentTab(0)
                }}><div>Past</div></span>
                <span className={currentTab === 1 ? "selected" : ""} onClick={() => {
                    setCurrentTab(1)
                }}><div>Presets</div></span>
                <span className={currentTab === 2 ? "selected" : ""} onClick={() => {
                    setCurrentTab(2)
                }}><div>Upcoming</div></span>
            </div>
            <div className="screen-list-items">
                {
                    transactionGroups.map((transactionGroup, index) => (
                        <TransactionGroup key={index} transactionGroup={transactionGroup} transactionPartners={transactionPartners} />
                    ))
                }
            </div>
        </div>
    );
};

export default TransactionsScreen;