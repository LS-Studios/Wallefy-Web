import React, {useEffect, useMemo} from 'react';
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {CashCheckModel} from "../../../Data/DataModels/CashCheckModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import "./CashCheckDialog.scss";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import LoadingDialog from "../LoadingDialog/LoadingDialog";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import {calculateCashChecks} from "../../../Helper/CalculationHelper";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {usePayedDebts} from "../../../CustomHooks/Database/usePayedDebts";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtType} from "../../../Data/EnumTypes/DebtType";
import CashCheckCard from "./CashCheckCard";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import {useWebWorker} from "../../../CustomHooks/useWebWorker";
import {CalculateBalancesWorkerData} from "../../../Workers/CalculateBalancesWorker";
import {BalanceModel} from "../../../Data/DataModels/BalanceModel";
import {CalculateCashCheckWorkerData} from "../../../Workers/CalculateCashCheckWorker";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";

const CashCheckDialog = () => {
    const translate = useTranslation()
    const { currentAccount, updateAccountBalance } = useCurrentAccount();
    const settings = useSettings()
    const getDatabaseRoute = useAccountRoute()

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [cashChecks, setCashChecks] = React.useState<CashCheckModel[] | null>(null)

    const runCalculateCashChecks = useWebWorker<CalculateCashCheckWorkerData, CashCheckModel[]>(() => new Worker(
        new URL(
            "../../../Workers/CalculateCashCheckWorker.ts",
            import.meta.url
        )
    ), [])

    useEffect(() => {
        if (!debts || !payedDebts || !currentAccount) {
            setCashChecks(null)
            return
        }
        runCalculateCashChecks({
            debts,
            payedDebts,
            baseCurrency: currentAccount.currencyCode
        }).then((cashChecks) => {
            setCashChecks(cashChecks)
        })
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
                getActiveDatabaseHelper().addDBItem(
                    getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                    buildPayedDebtModel(cashCheck)
                )
            })
        } else {
            getActiveDatabaseHelper().addDBItem(
                getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS),
                buildPayedDebtModel(cashCheck)
            )
        }
    }

    return (
        <DialogOverlay
            actions={(!cashChecks || cashChecks.length > 0) ? [
                new ContentAction(
                    translate("all-payments-done"),
                    () => {
                        checkDone(cashChecks!)
                    },
                    cashChecks === null
                )
            ] : []}
        >
            { cashChecks ?
                (cashChecks.length > 0 ? cashChecks.map((cashCheck, index) => {
                    return <CashCheckCard
                            cashCheck={cashCheck}
                            index={index}
                            checkDone={checkDone}
                            transactionPartners={transactionPartners}
                            currentAccount={currentAccount}
                            settings={settings}
                            translate={translate}
                        />
                }) : <div className="no-items">{translate("you-are-balanced")}</div>) :
                <Spinner type={SpinnerType.CYCLE} />
            }
        </DialogOverlay>
    );
};

export default CashCheckDialog;