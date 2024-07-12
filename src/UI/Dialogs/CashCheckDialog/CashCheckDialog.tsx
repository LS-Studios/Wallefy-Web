import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {CashCheckModel} from "../../../Data/DataModels/CashCheckModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import "./CashCheckDialog.scss";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useDebts} from "../../../CustomHooks/useDebts";
import {calculateCashChecks} from "../../../Helper/CalculationHelper";
import {useSettings} from "../../../Providers/SettingsProvider";
import {deleteDBObject, getDBObject, getDBObjectOnChange, setDBObject} from "../../../Helper/AceBaseHelper";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {PayedDebtModel} from "../../../Data/DataModels/PayedDebtModel";

const CashCheckDialog = () => {
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()
    const settings = useSettings()
    const getDatabaseRoute = useDatabaseRoute()

    const debts = useDebts()
    const transactionPartners = useTransactionPartners()

    const [cashChecks, setCashChecks] = React.useState<CashCheckModel[]>([])
    const getPaymentTextFromCashCheck = (cashCheck: CashCheckModel) => {
        return translate(
            "payment-text",
            transactionPartners!.find(partner => partner.uid === cashCheck.payerUid)?.name || cashCheck.payerUid,
            formatCurrency(cashCheck.amount, settings?.language, currentAccount?.currencyCode),
            transactionPartners!.find(partner => partner.uid === cashCheck.receiverUid)?.name || cashCheck.receiverUid,
        )
    }

    useEffect(() => {
        if (!debts || !transactionPartners) return
        //deleteDBObject(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS))
        getDBObjectOnChange(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS), (payedDebts: PayedDebtModel[] | null) => {
            setCashChecks(calculateCashChecks(debts,payedDebts || []))
        })

        //TODO geht noch nicht, wenn man neue hinzufügt
    }, [debts, transactionPartners]);

    if (!currentAccount || !debts || !transactionPartners) {
        return <LoadingDialog />
    }

    const checkDone = (cashCheck: CashCheckModel | CashCheckModel[]) => {
        getDBObject(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS)).then((payedDebts: PayedDebtModel[] | null) => {
            let newPayedDebts = payedDebts || []

            if (Array.isArray(cashCheck)) {
                cashCheck.forEach(cashCheck => {
                    newPayedDebts.push(new PayedDebtModel(cashCheck.payerUid, cashCheck.payedDebts))
                })
            } else {
                newPayedDebts.push(new PayedDebtModel(cashCheck.payerUid, cashCheck.payedDebts))
            }

            setDBObject(
                getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                newPayedDebts
            )
        })
    }

    // TODO []: Implement loading dialog

    if (!getDatabaseRoute) {
        return <LoadingDialog />
    }

    return (
        <DialogOverlay
            actions={cashChecks.length > 0 ? [
                new ContentAction(
                    translate("all-payments-done"),
                    () => {
                        checkDone(cashChecks)
                    },
                )
            ] : []}
        >
            { cashChecks.length > 0 ? cashChecks.map((cashCheck, index) => {
                return <div className="cash-check-dialog-item">
                    <div className="cash-check-dialog-item-content">
                        <div className="cash-check-dialog-item-number">{index + 1}</div>
                        <span className="cash-check-dialog-item-text">{getPaymentTextFromCashCheck(cashCheck)}</span>
                    </div>
                    <button className="cash-check-dialog-item-done-button" onClick={() => checkDone(cashCheck)}>{translate("payment-done")}</button>
                </div>
            }) : <div className="no-items">{translate("you-are-balanced")}</div> }
        </DialogOverlay>
    );
};

export default CashCheckDialog;