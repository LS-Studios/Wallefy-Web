import React, {useEffect} from 'react';
import TransactionOverviewCard from "./TransactionOverviewCard/TransactionOverviewCard";
import {MdLabel, MdPeople, MdPieChart, MdTrendingUp} from "react-icons/md";
import {ChartType} from "../../../Data/TransactionOverview/ChartType";
import './TransactionOverviewScreen.scss';
import {BarChartDataModel} from "../../../Data/TransactionOverview/BarChartDataModel";
import {formatDateToStandardString} from "../../../Helper/DateHelper";
// @ts-ignore
import variables from '../../../Data/Variables.scss';
import {getDBItemsOnChange} from "../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../Helper/DatabaseRoutes";
import {
    calculateBalancesAtDateInDateRange,
    calculateFutureTransactionsUntilDate, getTransactionAmount
} from "../../../Helper/TransactionHelper";
import {DateRange} from "../../../Data/DateRange";
import {TransactionModel} from "../../../Data/Transactions/TransactionModel";
import {PieChartDataModel} from "../../../Data/TransactionOverview/PieChartDataModel";
import {BalanceAtDateModel} from "../../../Data/TransactionOverview/BalanceAtDateModel";
import {CategoryModel} from "../../../Data/CategoryModel";
import {TransactionPartnerModel} from "../../../Data/TransactionPartnerModel";
import {LabelModel} from "../../../Data/LabelModel";
import {TransactionType} from "../../../Data/Transactions/TransactionType";

const TransactionOverviewScreen = () => {
    const [dateRange, setDateRange] = React.useState<DateRange>(new DateRange(
        formatDateToStandardString(new Date(2024, 6, 1)),
        formatDateToStandardString(new Date(2024, 6, 30))
    ));
    const [historyTransactions, setHistoryTransactions] = React.useState<TransactionModel[]>([]);
    const [presetTransactions, setPresetTransactions] = React.useState<TransactionModel[]>([]);
    const [transactionsInDateRange, setTransactionsInDateRange] = React.useState<TransactionModel[]>([]);

    const [categories, setCategories] = React.useState<CategoryModel[]>([]);
    const [transactionPartners, setTransactionPartners] = React.useState<TransactionPartnerModel[]>([]);
    const [labels, setLabels] = React.useState<LabelModel[]>([]);

    const [balancesData, setBalancesData] = React.useState<BarChartDataModel[]>([]);
    const [categoryData, setCategoryData] = React.useState<PieChartDataModel[]>([]);
    const [categoryTransactionType, setCategoryTransactionType] = React.useState<TransactionType>(TransactionType.INCOME);
    const [transactionPartnerData, setTransactionPartnerData] = React.useState<PieChartDataModel[]>([]);
    const [transactionPartnerTransactionType, setTransactionPartnerTransactionType] = React.useState<TransactionType>(TransactionType.INCOME);
    const [labelData, setLabelData] = React.useState<PieChartDataModel[]>([]);
    const [labelTransactionType, setLabelTransactionType] = React.useState<TransactionType>(TransactionType.INCOME);

    useEffect(() => {
        getDBItemsOnChange(DatabaseRoutes.HISTORY_TRANSACTIONS, setHistoryTransactions)
        getDBItemsOnChange(DatabaseRoutes.TRANSACTIONS, setPresetTransactions)
        getDBItemsOnChange(DatabaseRoutes.CATEGORIES, setCategories)
        getDBItemsOnChange(DatabaseRoutes.TRANSACTION_PARTNERS, setTransactionPartners)
        getDBItemsOnChange(DatabaseRoutes.LABELS, setLabels)
    }, []);

    useEffect(() => {
        const futureTransactions = calculateFutureTransactionsUntilDate(presetTransactions, dateRange.endDate).filter((transaction) => {
            return new Date(transaction.date) >= new Date(dateRange.startDate) &&
                new Date(transaction.date) <= new Date(dateRange.endDate)
        });

        setTransactionsInDateRange((current: TransactionModel[]) => {
            return [...current.filter((transaction) => transaction.history), ...futureTransactions];
        })
    }, [presetTransactions, dateRange]);

    useEffect(() => {
        const newHistoryTransactions = historyTransactions.filter((transaction) => {
            return new Date(transaction.date) >= new Date(dateRange.startDate) &&
                new Date(transaction.date) <= new Date(dateRange.endDate)
        })

        setTransactionsInDateRange((current: TransactionModel[]) => {
            return [...newHistoryTransactions, ...current.filter((transaction) => !transaction.history)];
        })
    }, [historyTransactions, dateRange]);

    useEffect(() => {
        setBalancesData(calculateBalancesAtDateInDateRange(1000, transactionsInDateRange, dateRange).map((balanceAtDate) => {
            return new BarChartDataModel(
                balanceAtDate.date,
                balanceAtDate.balance,
                getBarColorForBalanceAtDate(balanceAtDate)
            )
        }))
    }, [transactionsInDateRange]);

    useEffect(() => {
        setCategoryData(categories.map((category) => {
            return new PieChartDataModel(
                category.name,
                transactionsInDateRange.filter((transaction) => {
                    return transaction.transactionType === categoryTransactionType && transaction.categoryUid === category.uid
                }).reduce((a, b) => a + b.transactionAmount!, 0)!
            )
        }))
    }, [transactionsInDateRange, categoryTransactionType]);

    useEffect(() => {
        setTransactionPartnerData(transactionPartners.map((transactionPartner) => {
            return new PieChartDataModel(
                transactionPartner.name,
                transactionsInDateRange.filter((transaction) => {
                    return transaction.transactionType === transactionPartnerTransactionType && transaction.transactionExecutorUid === transactionPartner.uid
                }).reduce((a, b) => a + b.transactionAmount!, 0)!
            )
        }))
    }, [transactionsInDateRange, transactionPartnerTransactionType]);

    useEffect(() => {
        setLabelData(labels.map((label) => {
            return new PieChartDataModel(
                label.name,
                transactionsInDateRange.filter((transaction) => {
                    return transaction.transactionType === labelTransactionType && transaction.labels.includes(label.uid)
                }).reduce((a, b) => a + b.transactionAmount!, 0)!
            )
        }))
    }, [transactionsInDateRange, labelTransactionType]);

    const getBarColorForBalanceAtDate = (balanceAtDate: BalanceAtDateModel) => {
        if (new Date(balanceAtDate.date) < new Date()) {
            if (balanceAtDate.balance < 0) {
                return variables.expenses_bar_past_color
            } else {
                return variables.income_bar_past_color;
            }
        } else {
            if (balanceAtDate.balance < 0) {
                return variables.expenses_bar_color
            } else {
                return variables.income_bar_color
            }
        }
    }

    return (
        <div className="transaction-overview-screen">
            <TransactionOverviewCard
                icon={<MdTrendingUp />}
                title="Balances"
                chartType={ChartType.BAR}
                chartData={balancesData}
            />
            <div className="transaction-overview-screen-row">
                <TransactionOverviewCard
                    icon={<MdPieChart />}
                    title="Categories"
                    chartType={ChartType.PIE}
                    chartData={categoryData}
                    transactionType={categoryTransactionType}
                    onTransactionTypeChange={setCategoryTransactionType}
                />
                <TransactionOverviewCard
                    icon={<MdPeople />}
                    title="Transaction partners"
                    chartType={ChartType.PIE}
                    chartData={transactionPartnerData}
                    transactionType={transactionPartnerTransactionType}
                    onTransactionTypeChange={setTransactionPartnerTransactionType}
                />
                <TransactionOverviewCard
                    icon={<MdLabel />}
                    title="Labels"
                    chartType={ChartType.PIE}
                    chartData={labelData}
                    transactionType={labelTransactionType}
                    onTransactionTypeChange={setLabelTransactionType}
                />
            </div>
        </div>
    );
};

export default TransactionOverviewScreen;