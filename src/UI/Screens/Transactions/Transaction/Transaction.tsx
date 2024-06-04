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

const Transaction = ({
    transaction,
    transactionPartners,
    isStart,
    isEnd,
 }: {
    transaction: TransactionModel,
    transactionPartners: TransactionPartnerModel[] | null,
    isStart: boolean,
    isEnd: boolean,
}) => {
    const dialog = useDialog();

    const openTransactionDetail = () => {
        dialog.open(
            new DialogModel(
                "Transaction detail",
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
            style={{
                borderRadius: isStart && isEnd ? "12px" : isStart ? "12px 12px 0 0" : isEnd ? "0 0 12px 12px" : 0,
            }}
            onClick={openTransactionDetail}
        >
            <div className="transaction-block-1">
                <span id="transaction-name">{transaction.name}</span>
                <span id="transaction-executer">{
                    transactionPartners ? (transactionPartners.find(partner => partner.uid === transaction.transactionExecutorUid)?.name || "Unknown") : "Loading..."
                }</span>
            </div>
            <span
                id="transaction-amount"
                className={transaction.transactionType === TransactionType.INCOME ? "transaction-income" : "transaction-expense"}
            >{(transaction.transactionType === TransactionType.EXPENSE ? "-" : "") + formatCurrency(transaction.transactionAmount || 0, transaction.currencyCode)}</span>
        </div>
    );
};

export default Transaction;