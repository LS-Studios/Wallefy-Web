import React, {useEffect} from 'react';
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {BalanceModel} from "../../../../Data/DataModels/BalanceModel";
import "./BalanceCard.scss";
import {roundToNearest} from "../../../../Helper/CalculationHelper";
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import {AccountModel} from "../../../../Data/DatabaseModels/AccountModel";
import {SettingsModel} from "../../../../Data/DataModels/SettingsModel";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import InfoDialog from "../../../Dialogs/InfoDialog/InfoDialog";
import {useTranslation} from "../../../../CustomHooks/useTranslation";

const BalanceCardRow = ({
    highesBalance,
    balance,
    transactionPartners,
    settings,
    currentAccount
}: {
    highesBalance: number,
    balance: BalanceModel,
    transactionPartners: TransactionPartnerModel[] | null,
    settings: SettingsModel | null,
    currentAccount: AccountModel | null
}) => {
    const dialog = useDialog()
    const translate = useTranslation()

    const [width, setWidth] = React.useState("50%")
    const [backgroundColor, setBackgroundColor] = React.useState("")

    const [transactionPartnerName, setTransactionPartnerName] = React.useState<string>("")

    useEffect(() => {
        if (balance.balance === 0) {
            setWidth("50px")
            setBackgroundColor("var(--income-bar-past-color)")
        } else {
            setWidth(`calc(${50 / (highesBalance / Math.abs(balance.balance))}% + 10px )`)
            setBackgroundColor(balance.balance < 0 ? "var(--expenses-bar-color)" : "var(--income-bar-color)")
        }
    }, []);

    useEffect(() => {
        if (!transactionPartners) return

        setTransactionPartnerName(transactionPartners.find(partner => partner.uid === balance.transactionPartnerUid)?.name || "")
    }, [transactionPartners]);

    const onClick = () => {
        dialog.open(
            new DialogModel(
                transactionPartnerName,
                <InfoDialog infos={[
                    ...[translate(
                        "balance-info-1",
                        transactionPartnerName.slice(0, 2),
                        transactionPartnerName
                    )],
                    ...[balance.balance > 0 ? translate(
                        "balance-info-2-receives",
                        transactionPartnerName,
                        formatCurrency(balance.balance, settings?.language, currentAccount?.currencyCode)
                    ) : translate(
                        "balance-info-2-pays",
                        transactionPartnerName,
                        formatCurrency(Math.abs(balance.balance), settings?.language, currentAccount?.currencyCode)
                    )]
                ]} />
            )
        )
    }

    return (
        <div className={"balance-card-row" + (balance.balance === 0 ? " isBalanced" : (balance.balance < 0 ? " isNegative" : " isPositive"))}>
            <div className="balance-card-row-bar" style={{width, backgroundColor}}/>
            <span className="balance-card-row-transaction-partner" onClick={onClick}>
                {transactionPartnerName.slice(0, 2)}
            </span>
            <span className="balance-card-row-balance">
                {formatCurrency(balance.balance, settings?.language, currentAccount?.currencyCode)}
            </span>
        </div>
    );
};

export default BalanceCardRow;