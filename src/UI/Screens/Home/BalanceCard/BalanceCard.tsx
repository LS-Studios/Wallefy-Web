import React, {useEffect, useMemo} from 'react';
import Divider from "../../../Components/Divider/Divider";
import {MdBalance} from "react-icons/md";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {BalanceModel} from "../../../../Data/DataModels/BalanceModel";
import {useDebts} from "../../../../CustomHooks/Database/useDebts";
import {usePayedDebts} from "../../../../CustomHooks/Database/usePayedDebts";
import {useTransactionPartners} from "../../../../CustomHooks/Database/useTransactionPartners";
import BalanceCardRow from "./BalanceCardRow";
import "./BalanceCard.scss";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {calculateBalances, roundToNearest} from "../../../../Helper/CalculationHelper";
import {getTransactionAmount} from "../../../../Helper/CurrencyHelper";
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";
import {useWebWorker} from "../../../../CustomHooks/useWebWorker";
import {SortFilterGroupWorkerData} from "../../../../Workers/SortFilterGroupWorker";
import {DebtGroupModel} from "../../../../Data/DataModels/DebtGroupModel";
import {CalculateBalancesWorkerData} from "../../../../Workers/CalculateBalancesWorker";

const BalanceCard = () => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const settings = useSettings()

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [balances, setBalances] = React.useState<BalanceModel[] | null>(null);

    const runCalculateBalances = useWebWorker<CalculateBalancesWorkerData, BalanceModel[]>(() => new Worker(
        new URL(
            "../../../../Workers/CalculateBalancesWorker.ts",
            import.meta.url
        )
    ), [])

    useEffect(() => {
        if (!debts || !payedDebts || !currentAccount) {
            setBalances(null)
            return
        }

        runCalculateBalances({
            debts,
            payedDebts,
            baseCurrency: currentAccount.currencyCode
        }, "calculate-balances").then((balances) => {
            setBalances(balances)
        })
    }, [debts, payedDebts, currentAccount]);

    return (
        <div className="card">
            <div className="card-title-container">
                <MdBalance />
                <span>{translate("balance-card")}</span>
            </div>
            <Divider useOutlineColor={true} />
            <div className="balance-card-content">
                {
                    balances ?
                        balances.length > 0 ?
                            balances.map((balance) => {
                                return <BalanceCardRow
                                    highesBalance={balances.reduce((acc, balance) => Math.max(acc, Math.abs(balance.balance)), 0)}
                                    balance={balance}
                                    transactionPartners={transactionPartners}
                                    settings={settings}
                                    currentAccount={currentAccount} />
                            }) : <span className="no-items">{translate("no-balances")}</span>
                        : <Spinner type={SpinnerType.CYCLE} />
                }
            </div>
        </div>
    );
};

export default BalanceCard;