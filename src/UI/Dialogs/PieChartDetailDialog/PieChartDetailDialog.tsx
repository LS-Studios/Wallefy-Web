import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import Transaction from "../../Screens/Transactions/Transaction/Transaction";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import TransactionGroup from "../../Screens/Transactions/TransactionGroup/TransactionGroup";
import {TransactionGroupModel} from "../../../Data/DataModels/TransactionGroupModel";
import {groupTransactions} from "../../../Helper/TransactionHelper";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import DebtGroup from "../../Screens/Debts/DebtGroup/DebtGroup";

const PieChartDetailDialog = ({
    transactions,
    debts
}: {
    transactions?: TransactionModel[],
    debts?: DebtModel[]
}) => {
    const transactionPartners = useTransactionPartners()

    const [transactionGroups, setTransactionGroups] = React.useState<TransactionGroupModel[]>([])
    const [debtGroups, setDebtGroups] = React.useState<DebtGroupModel[]>([])

    useEffect(() => {
        if (transactions) {
            setTransactionGroups(
                groupTransactions(
                    transactions,
                    (date, transactions) => {
                        return new TransactionGroupModel(date, transactions as TransactionModel[])
                    },
                    (transactions) => {
                        transactions.sort((a, b) => {
                            return new Date(a.date) > new Date(b.date) ? 1 : -1;
                        })
                    }
                ) as TransactionGroupModel[]
            )
        } else if (debts) {
            setDebtGroups(
                groupTransactions(
                    debts,
                    (date, debts) => {
                        return new DebtGroupModel(date, debts as DebtModel[])
                    },
                    (debts) => {
                        debts.sort((a, b) => {
                            return new Date(a.date) > new Date(b.date) ? 1 : -1;
                        })
                    }
                ) as DebtGroupModel[]
            )
        }
    }, []);

    return (
        <DialogOverlay
            actions={[]}
        >
            {
                transactions ? transactionGroups.map((transactionGroup, index) => {
                    return <TransactionGroup
                        key={index}
                        transactionGroup={transactionGroup}
                        transactionPartners={transactionPartners}
                        backgroundColor="var(--primary)"
                    />
                }) : debts && debtGroups.map((debtGroup, index) => {
                    return <DebtGroup
                        key={index}
                        debtGroup={debtGroup}
                        transactionPartners={transactionPartners}
                        backgroundColor="var(--primary)"
                    />
                })
            }
        </DialogOverlay>
    );
};

export default PieChartDetailDialog;