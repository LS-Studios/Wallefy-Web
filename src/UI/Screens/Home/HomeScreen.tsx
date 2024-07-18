import React, {useEffect, useState} from 'react';
import ValueCard from "./ValueCard/ValueCard";
import {MdPeople} from "react-icons/md";
import "./HomeScreen.scss";
import TransactionOverviewPieCard from "../TransactionOverview/TransactionOverviewPieCard/TransactionOverviewPieCard";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import {formatDateToStandardString, getEndOfMonth, getStartOfMonth, speakableDate} from "../../../Helper/DateHelper";
import CardContentRow from "../TransactionOverview/TransactionOverviewBalancesCard/CardContentRow";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useAccounts} from "../../../CustomHooks/Database/useAccounts";
import {useUsers} from "../../../CustomHooks/Database/useUsers";
import {UserModel} from "../../../Data/DatabaseModels/UserModel";
import {AccountType} from "../../../Data/EnumTypes/AccountType";
import BalanceCard from "./BalanceCard/BalanceCard";
import UpcomingTransactionsCard from "./UpcomingTransactionsCard/UpcomingTransactionsCard";

const HomeScreen = () => {
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();

    const [dateRange, setDateRange] = useState(new DateRangeModel(
        formatDateToStandardString(getStartOfMonth(new Date())),
        formatDateToStandardString(getEndOfMonth(new Date()))
    ))

    const accounts = useAccounts()
    const users = useUsers()

    const [currentUser, setCurrentUser] = useState<UserModel | null>(null)

    const [accountData, setAccountData] = useState<ChartDataModel[]>([]);
    const [selectedAccountData, setSelectedAccountData] = useState<ChartDataModel | null>(null);

    useEffect(() => {
        if (!users || !settings) return

        setCurrentUser(users.find((user) => user.uid === settings.currentUserUid) || null)
    }, [users, settings]);

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

    return (
        <div className="home-screen">
            <ValueCard
                title={translate("hello, x", currentUser?.name || "")}
                value={<CardContentRow
                    firstLabel={translate("account")}
                    firstValue={currentAccount?.name || ""}
                    secondLabel={translate("date")}
                    secondValue={speakableDate(new Date(), settings?.language || "de", translate)}
                />}
            />
            <ValueCard
                title={translate("account-balance")}
                value={formatCurrency(currentAccount?.balance || 0, settings?.language, currentAccount?.currencyCode)}
            />
            { currentAccount?.type === AccountType.DEFAULT ? <UpcomingTransactionsCard /> : <BalanceCard /> }
            <div className="value-card-row">
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