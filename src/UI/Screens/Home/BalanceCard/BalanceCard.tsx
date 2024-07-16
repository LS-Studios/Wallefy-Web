import React, {useEffect} from 'react';
import Divider from "../../../Components/Divider/Divider";
import {MdBalance} from "react-icons/md";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import {BalanceModel} from "../../../../Data/DataModels/BalanceModel";
import {useDebts} from "../../../../CustomHooks/useDebts";
import {usePayedDebts} from "../../../../CustomHooks/usePayedDebts";
import {useTransactionPartners} from "../../../../CustomHooks/useTransactionPartners";
import BalanceCardRow from "./BalanceCardRow";
import "./BalanceCard.scss";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {calculateBalances, roundToNearest} from "../../../../Helper/CalculationHelper";
import {getTransactionAmount} from "../../../../Helper/CurrencyHelper";

const BalanceCard = () => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const settings = useSettings()

    const debts = useDebts()
    const payedDebts = usePayedDebts()
    const transactionPartners = useTransactionPartners()

    const [balances, setBalances] = React.useState<BalanceModel[] | null>(null);

    useEffect(() => {
        if (!debts || !payedDebts || !currentAccount) return

        setBalances(calculateBalances(debts, payedDebts, currentAccount.currencyCode))
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
                    balances?.map((balance) => {
                        return <BalanceCardRow
                            highesBalance={balances.reduce((acc, balance) => Math.max(acc, Math.abs(balance.balance)), 0)}
                            balance={balance}
                            transactionPartners={transactionPartners}
                            settings={settings}
                            currentAccount={currentAccount} />
                    })
                }
            </div>
        </div>
    );
};

export default BalanceCard;