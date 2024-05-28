import React from 'react';
import './Transaction.scss';
import {TransactionModel} from "../../../../Data/Transactions/TransactionModel";
// @ts-ignore
import variables from "../../../../Data/Variables.scss"
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import {useDialog} from "../../../../Providers/DialogProvider";
import TransactionDetailDialog from "../../../Dialogs/TransactionDetailDialog/TransactionDetailDialog";
import {DialogModel} from "../../../../Data/Providers/DialogModel";
import {TransactionType} from "../../../../Data/Transactions/TransactionType";
import {TransactionPartnerModel} from "../../../../Data/TransactionPartnerModel";
import {CategoryModel} from "../../../../Data/CategoryModel";
import {LabelModel} from "../../../../Data/LabelModel";

const Transaction = ({
    transaction,
    transactionPartners,
    isDetail = false
 }: {
    transaction: TransactionModel,
    transactionPartners: TransactionPartnerModel[] | null,
    isDetail?: boolean,
}) => {
    const dialog = useDialog();

    const openTransactionDetail = () => {
        dialog.open(
            new DialogModel(
                "StorageItem detail",
                <TransactionDetailDialog
                    transaction={transaction}
                    preFetchedTransactionPartners={transactionPartners}
                />
            )
        );
    }

    return (
        <div
            className="transaction"
            onClick={openTransactionDetail}
            style={{
                border: isDetail ? `2px solid ${variables.stroke_color}` : `2px solid ${variables.primary}`
            }}
        >
            <div className="transaction-block-1">
                <span id="transaction-name">{transaction.name}</span>
                <span id="transaction-executer">{
                    transactionPartners ? (transactionPartners.find(partner => partner.uid === transaction.transactionExecutorUid)?.name || "Unknown") : "Loading..."
                }</span>
            </div>
            <span
                id="transaction-amount"
                style={{
                    color: transaction.transactionType === TransactionType.INCOME ? variables.income_color : variables.expenses_color
                }}
            >{(transaction.transactionType === TransactionType.EXPENSE ? "-" : "") + formatCurrency(transaction.transactionAmount || 0, transaction.currencyCode)}</span>
        </div>
    );
};

export default Transaction;