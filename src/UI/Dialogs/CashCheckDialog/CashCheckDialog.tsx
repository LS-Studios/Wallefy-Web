import React, {useEffect} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {CashCheckModel} from "../../../Data/DataModels/CashCheckModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import "./CashCheckDialog.scss";
import {formatCurrency, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useDebts} from "../../../CustomHooks/useDebts";
import {calculateCashChecks} from "../../../Helper/CalculationHelper";
import {useSettings} from "../../../Providers/SettingsProvider";
import {addDBItem, deleteDBObject, getDBObject, getDBObjectOnChange, setDBObject} from "../../../Helper/AceBaseHelper";
import {useDatabaseRoute} from "../../../CustomHooks/useDatabaseRoute";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {usePayedDebts} from "../../../CustomHooks/usePayedDebts";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtType} from "../../../Data/EnumTypes/DebtType";
import CashCheckCard from "./CashCheckCard";

const CashCheckDialog = () => {
    const translate = useTranslation()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const settings = useSettings()
    const getDatabaseRoute = useDatabaseRoute()

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [cashChecks, setCashChecks] = React.useState<CashCheckModel[]>([])

    useEffect(() => {
        if (!debts || !payedDebts || !currentAccount) return
        //deleteDBObject(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS))
        setCashChecks(calculateCashChecks(debts,payedDebts || [], currentAccount?.currencyCode))
    }, [debts, payedDebts]);

    if (!debts || !transactionPartners || !currentAccount) {
        return <LoadingDialog />
    }

    const checkDone = (cashCheck: CashCheckModel | CashCheckModel[]) => {
        const buildPayedDebtModel = (cashCheck: CashCheckModel) => {
            const newDebt = new DebtModel(currentAccount.currencyCode)
            newDebt.accountUid = currentAccount.uid
            newDebt.transactionAmount = cashCheck.amount
            newDebt.whoHasPaidUid = cashCheck.payerUid
            newDebt.whoWasPaiFor = [cashCheck.receiverUid]
            newDebt.debtType = DebtType.MONEY_TRANSFER
            return newDebt
        }

        if (Array.isArray(cashCheck)) {
            cashCheck.forEach(cashCheck => {
                addDBItem(
                    getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                    buildPayedDebtModel(cashCheck)
                )
            })
        } else {
            addDBItem(
                getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                buildPayedDebtModel(cashCheck)
            )
        }
    }

    return (
        <DialogOverlay
            actions={cashChecks.length > 0 ? [
                new ContentAction(
                    translate("all-payments-done"),
                    () => {
                        checkDone(cashChecks)
                    }
                )
            ] : []}
        >
            { cashChecks.length > 0 ? cashChecks.map((cashCheck, index) => {
                return <CashCheckCard
                        cashCheck={cashCheck}
                        index={index}
                        checkDone={checkDone}
                        transactionPartners={transactionPartners}
                        currentAccount={currentAccount}
                        settings={settings}
                        translate={translate}
                    />
            }) : <div className="no-items">{translate("you-are-balanced")}</div> }
        </DialogOverlay>
    );
};

export default CashCheckDialog;