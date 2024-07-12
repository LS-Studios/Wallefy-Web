import React, {useEffect, useState} from 'react';
import BarChartCard from "./TransactionOverviewBalancesCard/BarChartCard";
import {MdAccountBalance, MdLabel, MdPeople, MdPieChart, MdSavings, MdTrendingDown, MdTrendingUp} from "react-icons/md";
import './TransactionOverviewScreen.scss';
// @ts-ignore
import variables from '../../../Data/Variables.scss';
import {
    getDBItemByUid,
    getDBItemsOnChange,
    getDBObject,
} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {
    calculateBalancesAtDateInDateRange,
    calculateFutureTransactionsUntilDate
} from "../../../Helper/TransactionHelper";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {BalanceAtDateModel} from "../../../Data/DataModels/Chart/BalanceAtDateModel";
import {CategoryModel} from "../../../Data/DatabaseModels/CategoryModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {LabelModel} from "../../../Data/DatabaseModels/LabelModel";
import {TransactionType} from "../../../Data/EnumTypes/TransactionType";
import {DBItem} from "../../../Data/DatabaseModels/DBItem";
import {
    dateRangeIsMonth,
    getCurrentDate,
    getMonthAndYear, speakableDateRange,
} from "../../../Helper/DateHelper";
import TransactionOverviewPieCard from "./TransactionOverviewPieCard/TransactionOverviewPieCard";
import useTransactionsInDateRange from "../../../CustomHooks/useTransactionInDateRange";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import ValueCard from "../Home/ValueCard/ValueCard";
import {formatCurrency, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {DateRangeType} from "../../../Data/EnumTypes/DateRangeType";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useLabels} from "../../../CustomHooks/useLabels";
import {useCategories} from "../../../CustomHooks/useCategories";
import {useTransactionPartners} from "../../../CustomHooks/useTransactionPartners";
import {useSettings} from "../../../Providers/SettingsProvider";

const TransactionOverviewScreen = ({
    dateRange,
}: {
    dateRange: DateRangeModel;
}) => {
    const translate = useTranslation()
    const settings = useSettings()
    const currentAccount = useCurrentAccount();
    const { transactionsInDateRange, transactionsUntilDateRange, totalIncome, totalExpenses, totalSavings, totalBalance } = useTransactionsInDateRange(dateRange);

    const categories = useCategories()
    const transactionPartners = useTransactionPartners()
    const labels = useLabels()

    const [balancesData, setBalancesData] = React.useState<ChartDataModel[]>([]);
    const [categoryData, setCategoryData] = React.useState<ChartDataModel[]>([]);
    const [categoryTransactionType, setCategoryTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);
    const [transactionPartnerData, setTransactionPartnerData] = React.useState<ChartDataModel[]>([]);
    const [transactionPartnerTransactionType, setTransactionPartnerTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);
    const [labelData, setLabelData] = React.useState<ChartDataModel[]>([]);
    const [labelTransactionType, setLabelTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);

    const [selectedBalanceData, setSelectedBalanceData] = React.useState<ChartDataModel | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<ChartDataModel | null>(null);
    const [selectedTransactionPartner, setSelectedTransactionPartner] = React.useState<ChartDataModel | null>(null);
    const [selectedLabel, setSelectedLabel] = React.useState<ChartDataModel | null>(null);

    useEffect(() => {
        setSelectedBalanceData(null)
        setSelectedCategory(null)
        setSelectedTransactionPartner(null)
        setSelectedLabel(null)
    }, [dateRange]);

    useEffect(() => {
        if (!currentAccount) return

        setBalancesData(
            calculateBalancesAtDateInDateRange(
                currentAccount.balance!,
                transactionsUntilDateRange,
                dateRange,
                currentAccount?.currencyCode
            ).map((balanceAtDate) => {
                return new ChartDataModel(
                    balanceAtDate.date,
                    balanceAtDate.balance,
                    getBarColorForBalanceAtDate(balanceAtDate)
                )
            })
        )
    }, [transactionsUntilDateRange, currentAccount]);

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

    function setPieChartData<T extends DBItem>(setFunction: (data: ChartDataModel[]) => void, data: T[], transactionType: TransactionType, uidCheck: (item: T, transaction: TransactionModel) => boolean) {
        setFunction(data.reduce((result: ChartDataModel[], item) => {
            const foundItems = transactionsInDateRange.filter((transaction) => {
                return transaction.transactionType === transactionType && uidCheck(item, transaction)
            })
            if (foundItems.length > 0) {
                result.push(
                    new ChartDataModel(
                        item.name,
                        foundItems.reduce((a, b) => a + getTransactionAmount(b, currentAccount?.currencyCode, true), 0)!,
                    )
                )
            }
            return result
        }, []))
    }

    useEffect(() => {
        if (!categories) return
        setPieChartData(setCategoryData, categories, categoryTransactionType, (category, transaction) => {
            return transaction.categoryUid === category.uid
        })
    }, [transactionsInDateRange, categories, categoryTransactionType]);

    useEffect(() => {
        if (!transactionPartners) return
        setPieChartData(setTransactionPartnerData, transactionPartners, transactionPartnerTransactionType, (transactionPartner, transaction) => {
            return transaction.transactionExecutorUid === transactionPartner.uid
        })
    }, [transactionsInDateRange, transactionPartners, transactionPartnerTransactionType]);

    useEffect(() => {
        if (!labels) return
        setPieChartData(setLabelData, labels, labelTransactionType, (label, transaction) => {
            return transaction.labels?.includes(label.uid)
        })
    }, [transactionsInDateRange, labels, labelTransactionType]);

    const valueFormatter = (value: number | undefined) => {
        return formatCurrency(value || 0, settings?.language, currentAccount?.currencyCode)
    }

    return (
        <div className="transaction-overview-screen">
            <BarChartCard
                icon={<MdTrendingUp />}
                title={translate("chart")}
                chartData={balancesData}
                valueFormatter={valueFormatter}
                selectedItem={selectedBalanceData}
                // @ts-ignore
                onItemSelected={setSelectedBalanceData}
                baseCurrency={currentAccount?.currencyCode}
            />
            <div className="value-card-row">
                <ValueCard icon={<MdTrendingUp />} title={translate("income-this-month")} value={formatCurrency(totalIncome, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdTrendingDown />} title={translate("expenses-this-month")} value={formatCurrency(totalExpenses, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdAccountBalance />} title={translate("balance-this-month")} value={formatCurrency(totalBalance, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdSavings />} title={translate("savings-this-month")} value={formatCurrency(totalSavings, settings?.language, currentAccount?.currencyCode)} />
            </div>
            <div className="transaction-overview-screen-row">
                <TransactionOverviewPieCard
                    icon={<MdPieChart />}
                    title={translate("categories")}
                    chartData={categoryData}
                    valueFormatter={valueFormatter}
                    transactionType={categoryTransactionType}
                    onTransactionTypeChange={setCategoryTransactionType}
                    selectedItem={selectedCategory}
                    onItemSelected={setSelectedCategory}
                    noItemSelectedLabel={speakableDateRange(dateRange)}
                    baseCurrency={currentAccount?.currencyCode}
                />
                <TransactionOverviewPieCard
                    icon={<MdPeople />}
                    title={translate("transaction-partners")}
                    chartData={transactionPartnerData}
                    valueFormatter={valueFormatter}
                    transactionType={transactionPartnerTransactionType}
                    onTransactionTypeChange={setTransactionPartnerTransactionType}
                    selectedItem={selectedTransactionPartner}
                    onItemSelected={setSelectedTransactionPartner}
                    noItemSelectedLabel={speakableDateRange(dateRange)}
                    baseCurrency={currentAccount?.currencyCode}
                />
                <TransactionOverviewPieCard
                    icon={<MdLabel />}
                    title={translate("labels")}
                    chartData={labelData}
                    valueFormatter={valueFormatter}
                    transactionType={labelTransactionType}
                    onTransactionTypeChange={setLabelTransactionType}
                    selectedItem={selectedLabel}
                    onItemSelected={setSelectedLabel}
                    noItemSelectedLabel={speakableDateRange(dateRange)}
                    baseCurrency={currentAccount?.currencyCode}
                />
            </div>
        </div>
    );
};

export default TransactionOverviewScreen;