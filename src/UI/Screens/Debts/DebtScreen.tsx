import React, {useEffect, useMemo} from 'react';
import {SortType} from "../../../Data/EnumTypes/SortType";
import {FilterModel} from "../../../Data/DataModels/FilterModel";
import {groupTransactions} from "../../../Helper/TransactionHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import Spinner from "../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../Data/EnumTypes/SpinnerType";
import {useAccountRoute} from "../../../CustomHooks/Database/useAccountRoute";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import DebtGroup from "./DebtGroup/DebtGroup";
import {usePayedDebts} from "../../../CustomHooks/Database/usePayedDebts";
import {getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useWebWorker} from "../../../CustomHooks/useWebWorker";
import {SortFilterGroupWorkerData} from "../../../Workers/SortFilterGroupWorker";
import {TransactionGroupModel} from "../../../Data/DataModels/TransactionGroupModel";

const DebtScreen = ({
    sortValue,
    filterValue,
}: {
    sortValue: SortType,
    filterValue: FilterModel
}) => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [debtGroups, setDebtGroups] = React.useState<DebtGroupModel[] | null>(null)

    const runSortFilterGroup = useWebWorker<SortFilterGroupWorkerData, DebtGroupModel[]>(() => new Worker(
        new URL(
            "../../../Workers/SortFilterGroupWorker.ts",
            import.meta.url
        )
    ), [])

    useEffect(() => {
        if (!currentAccount || !debts || !payedDebts) {
            setDebtGroups(null)
            return
        }

        runSortFilterGroup({
            translate,
            currentAccount,
            transactions: [...debts, ...payedDebts.map((payedDebt) => {
                const payerName = transactionPartners?.find(tp => tp.uid === payedDebt.whoHasPaidUid)?.name || "Unknown"
                const receiverName = transactionPartners?.find(tp => tp.uid === payedDebt.whoWasPaiFor[0])?.name || "Unknown"

                return {
                    ...payedDebt,
                    name: translate("money-transfer"),
                    subName: translate("money-transfer-from-to", payerName, receiverName),
                    icon: "money-transfer"
                }
            })],
            sortValue,
            filterValue,
            isDebtScreen: true
        }).then((debtGroups) => {
            setDebtGroups(debtGroups)
        })
    }, [debts, payedDebts, currentAccount, sortValue, filterValue]);

    return (
        <div className="list-screen">
            <div className="screen-list-items">
                { debtGroups ? (
                    debtGroups.length > 0 ? <>
                        {
                            debtGroups.map((debtGroup, index) => (
                                <DebtGroup
                                    key={index}
                                    debtGroup={debtGroup}
                                    transactionPartners={transactionPartners}
                                />
                            ))
                        }
                    </> : <span className="no-items">{translate("no-transactions-found")}</span>
                ) : <Spinner type={SpinnerType.CYCLE} /> }
            </div>
        </div>
    );
};

export default DebtScreen;