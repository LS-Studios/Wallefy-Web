import React, {useEffect, useMemo} from 'react';
import BarChartCard from "./TransactionOverviewBalancesCard/BarChartCard";
import {MdAccountBalance, MdLabel, MdPeople, MdPieChart, MdSavings, MdTrendingDown, MdTrendingUp} from "react-icons/md";
import './TransactionOverviewScreen.scss';
import {calculateBalancesAtDateInDateRange} from "../../../Helper/TransactionHelper";
import {DateRangeModel} from "../../../Data/DataModels/DateRangeModel";
import {TransactionModel} from "../../../Data/DatabaseModels/TransactionModel";
import {BalanceAtDateModel} from "../../../Data/DataModels/Chart/BalanceAtDateModel";
import {TransactionType} from "../../../Data/EnumTypes/TransactionType";
import {DBItem} from "../../../Data/DatabaseModels/DBItem";
import {getCurrentDate, speakableDateRange,} from "../../../Helper/DateHelper";
import TransactionOverviewPieCard from "./TransactionOverviewPieCard/TransactionOverviewPieCard";
import useTransactionsInDateRange from "../../../CustomHooks/Database/useTransactionInDateRange";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import ValueCard from "../Home/ValueCard/ValueCard";
import {formatCurrency, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useDialog} from "../../../Providers/DialogProvider";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import PieChartDetailDialog from "../../Dialogs/PieChartDetailDialog/PieChartDetailDialog";
import {useWebWorker} from "../../../CustomHooks/useWebWorker";
import {SortFilterGroupWorkerData} from "../../../Workers/SortFilterGroupWorker";
import {DebtGroupModel} from "../../../Data/DataModels/DebtGroupModel";
import {CalculateBalancesAtDateInDateRangeWorkerData} from "../../../Workers/CalculateBalancesAtDateInDateRangeWorker";

const TransactionOverviewScreen = ({
    dateRange,
}: {
    dateRange: DateRangeModel;
}) => {
    const dialog = useDialog()
    const translate = useTranslation()
    const settings = useSettings()
    const { currentAccount } = useCurrentAccount();;
    const { transactionsInDateRange, transactionsUntilDateRange, totalIncome, totalExpenses, totalSavings, totalBalance } = useTransactionsInDateRange(dateRange);

    const categories = useCategories()
    const transactionPartners = useTransactionPartners()
    const labels = useLabels()

    const [balancesData, setBalancesData] = React.useState<ChartDataModel[] | null>(null);
    const [categoryData, setCategoryData] = React.useState<ChartDataModel[] | null>(null);
    const [categoryTransactionType, setCategoryTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);
    const [transactionPartnerData, setTransactionPartnerData] = React.useState<ChartDataModel[] | null>(null);
    const [transactionPartnerTransactionType, setTransactionPartnerTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);
    const [labelData, setLabelData] = React.useState<ChartDataModel[] | null>(null);
    const [labelTransactionType, setLabelTransactionType] = React.useState<TransactionType>(TransactionType.EXPENSE);

    const [selectedBalanceData, setSelectedBalanceData] = React.useState<ChartDataModel | null>(null);
    const [selectedCategory, setSelectedCategory] = React.useState<ChartDataModel | null>(null);
    const [selectedTransactionPartner, setSelectedTransactionPartner] = React.useState<ChartDataModel | null>(null);
    const [selectedLabel, setSelectedLabel] = React.useState<ChartDataModel | null>(null);

    const runBalancesAtDateInDateRange = useWebWorker<CalculateBalancesAtDateInDateRangeWorkerData, BalanceAtDateModel[]>(() => new Worker(
        new URL(
            "../../../Workers/CalculateBalancesAtDateInDateRangeWorker.ts",
            import.meta.url
        )
    ), [])

    useEffect(() => {
        setSelectedBalanceData(null)
        setSelectedCategory(null)
        setSelectedTransactionPartner(null)
        setSelectedLabel(null)
    }, [dateRange]);

    useEffect(() => {
        if (!currentAccount) return

        setBalancesData(null)

        runBalancesAtDateInDateRange({
            currentBalance: currentAccount.balance!,
            transactionsInRage: transactionsUntilDateRange,
            dateRange: dateRange,
            baseCurrency: currentAccount.currencyCode
        }).then((balances) => {
            setBalancesData(balances.map((balanceAtDate) => {
                return new ChartDataModel(
                    "",
                    balanceAtDate.date,
                    balanceAtDate.balance,
                    getBarColorForBalanceAtDate(balanceAtDate)
                )
            }))
        })
    }, [transactionsUntilDateRange, currentAccount]);

    useEffect(() => {
        setBalancesData((current) => {
            return current?.map((barChartData) => {
                return {
                    ...barChartData,
                    color: getBarColorForBalanceAtDate(
                        new BalanceAtDateModel(
                            barChartData.label,
                            barChartData.value
                        )
                    )
                }
            }) || null
        })
    }, [selectedBalanceData]);

    const getBarColorForBalanceAtDate = (balanceAtDate: BalanceAtDateModel) => {
        if (new Date(balanceAtDate.date) < getCurrentDate()) {
            if (!selectedBalanceData || balanceAtDate.date === selectedBalanceData.label) {
                if (balanceAtDate.balance < 0) {
                    return "var(--expenses-bar-past-color)"
                } else {
                    return "var(--income-bar-past-color)"
                }
            } else {
                if (balanceAtDate.balance < 0) {
                    return "var(--expenses-bar-past-not-selected-color)"
                } else {
                    return "var(--income-bar-past-not-selected-color)"
                }
            }
        } else {
            if (!selectedBalanceData || balanceAtDate.date === selectedBalanceData.label) {
                if (balanceAtDate.balance < 0) {
                    return "var(--expenses-bar-color)"
                } else {
                    return "var(--income-bar-color)"
                }
            } else {
                if (balanceAtDate.balance < 0) {
                    return "var(--expenses-bar-not-selected-color)"
                } else {
                    return "var(--income-bar-not-selected-color)"
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
                        item.uid,
                        item.name || "",
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
            return (transaction.labels || []).includes(label.uid)
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
                <ValueCard icon={<MdTrendingUp />} title={translate("income-this-month")} value={totalIncome !== null && settings && currentAccount && formatCurrency(totalIncome, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdTrendingDown />} title={translate("expenses-this-month")} value={totalExpenses !== null && settings && currentAccount && formatCurrency(totalExpenses, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdAccountBalance />} title={translate("balance-this-month")} value={totalBalance !== null && settings && currentAccount && formatCurrency(totalBalance, settings?.language, currentAccount?.currencyCode)} />
                <ValueCard icon={<MdSavings />} title={translate("savings-this-month")} value={totalSavings !== null && settings && currentAccount && formatCurrency(totalSavings, settings?.language, currentAccount?.currencyCode)} />
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
                    onDetailOpen={() => {
                        const detailTransactions: TransactionModel[] = []

                        transactionsInDateRange.forEach((transaction) => {
                            if (selectedCategory && transaction.categoryUid === selectedCategory.valueUid) {
                                detailTransactions.push(transaction)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedCategory?.label || "",
                                <PieChartDetailDialog transactions={detailTransactions} />
                            )
                        )
                    }}
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
                    onDetailOpen={() => {
                        const detailTransactions: TransactionModel[] = []

                        transactionsInDateRange.forEach((transaction) => {
                            if (selectedTransactionPartner && transaction.transactionExecutorUid === selectedTransactionPartner.valueUid) {
                                detailTransactions.push(transaction)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedTransactionPartner?.label || "",
                                <PieChartDetailDialog transactions={detailTransactions} />
                            )
                        )
                    }}
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
                    onDetailOpen={() => {
                        const detailTransactions: TransactionModel[] = []

                        transactionsInDateRange.forEach((transaction) => {
                            if (selectedTransactionPartner && (transaction.labels || []).includes(selectedTransactionPartner.valueUid)) {
                                detailTransactions.push(transaction)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedTransactionPartner?.label || "",
                                <PieChartDetailDialog transactions={detailTransactions} />
                            )
                        )
                    }}
                />
            </div>
        </div>
    );
};

export default TransactionOverviewScreen;