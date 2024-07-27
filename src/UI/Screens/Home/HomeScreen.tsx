import React, {useEffect, useState} from 'react';
import ValueCard from "./ValueCard/ValueCard";
import {MdPeople} from "react-icons/md";
import "./HomeScreen.scss";
import TransactionOverviewPieCard from "../TransactionOverview/TransactionOverviewPieCard/TransactionOverviewPieCard";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {speakableDate} from "../../../Helper/DateHelper";
import CardContentRow from "../TransactionOverview/TransactionOverviewBalancesCard/CardContentRow";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import BalanceCard from "./BalanceCard/BalanceCard";
import UpcomingTransactionsCard from "./UpcomingTransactionsCard/UpcomingTransactionsCard";
import {getActiveDatabaseHelper} from "../../../Helper/Database/ActiveDBHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {UserDataModel} from "../../../Data/DatabaseModels/UserDataModel";
import {DatabaseType} from "../../../Data/EnumTypes/DatabaseType";
import {SettingsModel} from "../../../Data/DataModels/SettingsModel";
import {AccountVisibilityType} from "../../../Data/EnumTypes/AccountVisibilityType";
import Joyride from "react-joyride";

const HomeScreen = () => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();

    const accounts = useAccounts()

    const [currentUser, setCurrentUser] = useState<UserDataModel | null>(null)

    const [accountData, setAccountData] = useState<ChartDataModel[]>([]);
    const [selectedAccountData, setSelectedAccountData] = useState<ChartDataModel | null>(null);

    useEffect(() => {
        if (!settings) return

        getActiveDatabaseHelper().getDBObjectOnChange(DatabaseRoutes.USER_DATA + "/" + settings.currentUserUid, (user) => {
            setCurrentUser(user)
        })
    }, [settings]);

    useEffect(() => {
        if (!accounts) return

        setAccountData(accounts.map((account) => {
            const castedAccount = account as AccountModel;
            return new ChartDataModel(castedAccount.uid, castedAccount.name, Math.abs(castedAccount.balance) || 0);
        }));
    }, [accounts]);

    const valueFormatter = (value: number | undefined) => {
        return formatCurrency(value || 0, settings?.language, currentAccount?.currencyCode)
    }

    const myRef = React.createRef<HTMLElement>();

    return (
        <div className="home-screen">
            <ValueCard
                title={translate("hello, x", currentUser?.name || "")}
                value={<CardContentRow
                    firstLabel={translate("account")}
                    firstValue={currentAccount?.name}
                    secondLabel={translate("date")}
                    secondValue={speakableDate(new Date(), settings?.language || "de", translate)}
                />}
            />
            <ValueCard
                title={translate("account-balance")}
                value={currentAccount && formatCurrency(currentAccount?.balance, settings?.language, currentAccount?.currencyCode)}
            />
            { currentAccount?.type === AccountType.DEFAULT ? <UpcomingTransactionsCard /> : <BalanceCard /> }
            <div className="value-card-row" id="joyride-home">
                <TransactionOverviewPieCard
                    icon={<MdPeople />}
                    title={translate("accounts")}
                    noItemSelectedLabel={translate("all-accounts")}
                    chartData={accountData}
                    valueFormatter={valueFormatter}
                    selectedItem={selectedAccountData}
                    onItemSelected={setSelectedAccountData}
                    baseCurrency={currentAccount?.currencyCode}
                />
            </div>
        </div>
    );
};

export default HomeScreen;