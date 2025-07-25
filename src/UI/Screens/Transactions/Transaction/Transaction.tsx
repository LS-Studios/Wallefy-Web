import React from 'react';
import './Transaction.scss';
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {formatCurrencyFromTransaction} from "../../../../Helper/CurrencyHelper";
import {useDialog} from "../../../../Providers/DialogProvider";
import TransactionDetailDialog from "../../../Dialogs/TransactionDetailDialog/TransactionDetailDialog";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import {TransactionType} from "../../../../Data/EnumTypes/TransactionType";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {getIcon} from "../../../../Helper/IconMapper";

const Transaction = ({
    transaction,
    transactionPartners,
    isStart,
    isEnd,
    translate,
    backgroundColor = "var(--background)"
 }: {
    transaction: TransactionModel,
    transactionPartners: TransactionPartnerModel[] | null,
    isStart: boolean,
    isEnd: boolean,
    translate: (string: string) => string,
    backgroundColor?: string
}) => {
    const dialog = useDialog();
    const settings = useSettings()

    const openTransactionDetail = () => {
        dialog.open(
            new DialogModel(
                translate("transaction-details"),
                <TransactionDetailDialog
                    transaction={transaction}
                    preFetchedTransactionPartners={transactionPartners}
                />,
                500
            )
        );
    }

    const Icon =  getIcon(transaction.icon) as any

    return (
        <div
            className="transaction"
            style={{
                backgroundColor: backgroundColor,
                borderRadius: isStart && isEnd ? "12px" : isStart ? "12px 12px 0 0" : isEnd ? "0 0 12px 12px" : 0,
            }}
            onClick={openTransactionDetail}
        >
            <div className="transaction-content">
                <Icon id="transaction-icon" />
                <div className="transaction-info">
                    <span id="transaction-name">{transaction.name}</span>
                    <span id="transaction-executer">{
                        transactionPartners ? (transactionPartners.find(partner => partner.uid === transaction.transactionExecutorUid)?.name || "Unknown") : "Loading..."
                    }</span>
                </div>
            </div>
            <span
                id="transaction-amount"
                className={transaction.transactionType === TransactionType.INCOME ? "transaction-income" : "transaction-expense"}
            >{formatCurrencyFromTransaction(transaction, settings?.language)}</span>
        </div>
    );
};

export default Transaction;