import React from 'react';
import "../../Transactions/Transaction/Transaction.scss"
import {formatCurrency, formatCurrencyFromTransaction} from "../../../../Helper/CurrencyHelper";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import DebtDetailDialog from "../../../Dialogs/DebtDetailDialog/DebtDetailDialog";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {useSettings} from "../../../../Providers/SettingsProvider";

const Debt = ({
    debt,
    transactionPartners,
    isStart,
    isEnd,
    translate
 }: {
    debt: DebtModel,
    transactionPartners: TransactionPartnerModel[] | null,
    isStart: boolean,
    isEnd: boolean,
    translate: (string: string) => string
}) => {
    const dialog = useDialog();
    const settings = useSettings()

    const openTransactionDetail = () => {
        dialog.open(
            new DialogModel(
                translate("transaction-details"),
                <DebtDetailDialog
                    debt={debt}
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
                <span id="transaction-name">{debt.name}</span>
                <span id="transaction-executer">{
                    transactionPartners ? (transactionPartners.find(partner => partner.uid === debt.transactionExecutorUid)?.name || "Unknown") : "Loading..."
                }</span>
            </div>
            <span
                id="transaction-amount"
                className="transaction-expense"
            >{formatCurrency(debt.transactionAmount || 0, settings?.language, debt.currency.currencyCode)}</span>
        </div>
    );
};

export default Debt;