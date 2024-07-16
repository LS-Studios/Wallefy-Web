import React from 'react';
import {CashCheckModel} from "../../../Data/DataModels/CashCheckModel";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtType} from "../../../Data/EnumTypes/DebtType";
import {addDBItem} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {SettingsModel} from "../../../Data/DataModels/SettingsModel";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import "./CashCheckDialog.scss";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";

const CashCheckCard = ({
    cashCheck,
    index,
    checkDone,
    transactionPartners,
    currentAccount,
    settings,
    translate
}: {
    cashCheck: CashCheckModel,
    index: number,
    checkDone: (cashCheck: CashCheckModel) => void,
    transactionPartners: TransactionPartnerModel[] | null,
    currentAccount: AccountModel | null,
    settings: SettingsModel | null,
    translate: (key: string, ...args: any[]) => string
}) => {
    const getPaymentTextFromCashCheck = (cashCheck: CashCheckModel) => {
        return translate(
            "payment-text",
            transactionPartners!.find(partner => partner.uid === cashCheck.payerUid)?.name || cashCheck.payerUid,
            formatCurrency(cashCheck.amount, settings?.language, currentAccount?.currencyCode),
            transactionPartners!.find(partner => partner.uid === cashCheck.receiverUid)?.name || cashCheck.receiverUid,
        )
    }

    return (
        <div className="cash-check-dialog-item">
            <div className="cash-check-dialog-item-content">
                <div className="cash-check-dialog-item-number">{index + 1}</div>
                <span className="cash-check-dialog-item-text">{getPaymentTextFromCashCheck(cashCheck)}</span>
            </div>
            <button className="cash-check-dialog-item-done-button"
                    onClick={() => checkDone(cashCheck)}>{translate("payment-done")}</button>
        </div>
    );
};

export default CashCheckCard;