import React, {useEffect, useState} from 'react';
import ValueCard from "./ValueCard/ValueCard";
import {
    MdAccountBalance,
    MdCalendarMonth,
    MdChair,
    MdPeople,
    MdSavings,
    MdTrendingDown,
    MdTrendingUp
} from "react-icons/md";
import "./HomeScreen.scss";
import TransactionOverviewPieCard from "../TransactionOverview/TransactionOverviewPieCard/TransactionOverviewPieCard";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {AccountModel} from "../../../Data/DatabaseModels/AccountModel";
import BarChartCard
    from "../TransactionOverview/TransactionOverviewBalancesCard/BarChartCard";
import useTransactionInDateRange from "../../../CustomHooks/useTransactionInDateRange";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import {
    formatDate,
    formatDateToStandardString, getCurrentDate,
    getEndOfMonth,
    getStartOfMonth,
    speakableDate
} from "../../../Helper/DateHelper";
// @ts-ignore
import variables from "../../../Data/Variables.scss";
import {CalculationType} from "../../../Data/EnumTypes/CalculationType";
import CardContentRow from "../TransactionOverview/TransactionOverviewBalancesCard/CardContentRow";
import Divider from "../../Components/Divider/Divider";
import {formatCurrency} from "../../../Helper/CurrencyHelper";
import {calculateBalancesAtDateInDateRange} from "../../../Helper/TransactionHelper";
import {BalanceAtDateModel} from "../../../Data/DataModels/Chart/BalanceAtDateModel";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useAccounts} from "../../../CustomHooks/useAccounts";

const HomeScreen = () => {
    const settings = useSettings()
    const translate = useTranslation()
    const currentAccount = useCurrentAccount()

    const [dateRange, setDateRange] = useState(new DateRangeModel(
        formatDateToStandardString(getStartOfMonth(new Date())),
        formatDateToStandardString(getEndOfMonth(new Date()))
    ))

    const { transactionsUntilDateRange, totalIncome, totalExpenses, totalBalance, totalSavings} = useTransactionInDateRange(dateRange)

    const [balancesData, setBalancesData] = React.useState<ChartDataModel[]>([]);
    const [selectedBalanceData, setSelectedBalanceData] = useState<ChartDataModel | null>(null);

    const accounts = useAccounts()

    const [piBalanceData, setPieBalanceData] = useState<ChartDataModel[]>([]);
    const [selectedPieBalanceData, setSelectedPieBalanceData] = useState<ChartDataModel | null>(null);
    const [accountData, setAccountData] = useState<ChartDataModel[]>([]);
    const [selectedAccountData, setSelectedAccountData] = useState<ChartDataModel | null>(null);

    useEffect(() => {
        if (!accounts) return

        setAccountData(accounts.map((account) => {
            const castedAccount = account as AccountModel;
            return new ChartDataModel(castedAccount.name, castedAccount.balance || 0);
        }));
    }, [accounts]);

    useEffect(() => {
        setPieBalanceData([
            new ChartDataModel(translate("income"), totalIncome, variables.income_bar_color),
            new ChartDataModel(translate("expenses"), totalExpenses, variables.expenses_bar_color),
        ]);
    }, [totalIncome, totalExpenses]);

    useEffect(() => {
        if (!currentAccount) return

        setBalancesData(
            calculateBalancesAtDateInDateRange(
                currentAccount.balance!,
                transactionsUntilDateRange,
                dateRange,
                currentAccount.currencyCode
            ).map((balanceAtDate) => {
                return new ChartDataModel(
                    balanceAtDate.date,
                    balanceAtDate.balance,
                    getBarColorForBalanceAtDate(balanceAtDate)
                )
            })
        )
    }, [transactionsUntilDateRange, currentAccount, currentAccount]);

    useEffect(() => {
        setBalancesData((current) => {
            return current.map((barChartData) => {
                return {
                    ...barChartData,
                    color: getBarColorForBalanceAtDate(
                        new BalanceAtDateModel(
                            barChartData.label,
                            barChartData.value
                        )
                    )
                }
            })
        })
    }, [selectedBalanceData]);

    const getBarColorForBalanceAtDate = (balanceAtDate: BalanceAtDateModel) => {
        if (new Date(balanceAtDate.date) < getCurrentDate()) {
            if (!selectedBalanceData || balanceAtDate.date === selectedBalanceData.label) {
                if (balanceAtDate.balance < 0) {
                    return variables.expenses_bar_past_color
                } else {
                    return variables.income_bar_past_color;
                }
            } else {
                if (balanceAtDate.balance < 0) {
                    return variables.expenses_bar_past_not_selected_color
                } else {
                    return variables.income_bar_past_not_selected_color;
                }
            }
        } else {
            if (!selectedBalanceData || balanceAtDate.date === selectedBalanceData.label) {
                if (balanceAtDate.balance < 0) {
                    return variables.expenses_bar_color
                } else {
                    return variables.income_bar_color
                }
            } else {
                if (balanceAtDate.balance < 0) {
                    return variables.expenses_bar_not_selected_color
                } else {
                    return variables.income_bar_not_selected_color
                }
            }
        }
    }

    const valueFormatter = (value: number | undefined) => {
        return formatCurrency(value || 0, settings?.language, currentAccount?.currencyCode)
    }

    return (
        <div className="home-screen">
            <ValueCard
                title={translate("hello, x", "Lennard Stubbe")}
                value={<CardContentRow
                    firstLabel={translate("account")}
                    firstValue={currentAccount?.name || ""}
                    secondLabel={translate("date")}
                    secondValue={speakableDate(new Date(), settings?.language || "de", translate)}
                />}
            />
            <BarChartCard
                icon={<MdCalendarMonth />}
                title={translate("month-overview")}
                chartData={balancesData}
                valueFormatter={valueFormatter}
                selectedItem={selectedBalanceData}
                onItemSelected={setSelectedBalanceData}
                baseCurrency={currentAccount?.currencyCode}
            />
            <ValueCard icon={<MdSavings />} title={translate("total-savings")} value={formatCurrency(totalSavings, settings?.language, currentAccount?.currencyCode)} />
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
                <TransactionOverviewPieCard
                    icon={<MdPeople />}
                    title={translate("balance")}
                    noItemSelectedLabel={translate("balance")}
                    chartData={piBalanceData}
                    valueFormatter={valueFormatter}
                    selectedItem={selectedPieBalanceData}
                    onItemSelected={setSelectedPieBalanceData}
                    calculationType={CalculationType.SUBTRACT}
                    baseCurrency={currentAccount?.currencyCode}
                />
            </div>
        </div>
    );
};

export default HomeScreen;