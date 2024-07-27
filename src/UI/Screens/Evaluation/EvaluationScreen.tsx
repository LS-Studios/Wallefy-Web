import React, {useEffect, useState} from 'react';
import {MdEmojiEvents, MdLabel, MdPayments, MdPieChart, MdStackedBarChart} from "react-icons/md";
import "../Home/HomeScreen.scss";
import {ChartDataModel} from "../../../Data/DataModels/Chart/ChartDataModel";
import BarChartCard from "../TransactionOverview/TransactionOverviewBalancesCard/BarChartCard";
import {formatCurrency, getTransactionAmount} from "../../../Helper/CurrencyHelper";
import {useTranslation} from "../../../CustomHooks/useTranslation";
import {useSettings} from "../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../Providers/AccountProvider";
import ValueCard from "../Home/ValueCard/ValueCard";
import {useDebts} from "../../../CustomHooks/Database/useDebts";
import {useTransactionPartners} from "../../../CustomHooks/Database/useTransactionPartners";
import TransactionOverviewPieCard from "../TransactionOverview/TransactionOverviewPieCard/TransactionOverviewPieCard";
import {useCategories} from "../../../CustomHooks/Database/useCategories";
import {useLabels} from "../../../CustomHooks/Database/useLabels";
import {DBItem} from "../../../Data/DatabaseModels/DBItem";
import {DebtModel} from "../../../Data/DatabaseModels/DebtModel";
import {DialogModel} from "../../../Data/DataModels/DialogModel";
import PieChartDetailDialog from "../../Dialogs/PieChartDetailDialog/PieChartDetailDialog";
import {useDialog} from "../../../Providers/DialogProvider";

const EvaluationScreen = () => {
    const dialog = useDialog()
    const settings = useSettings()
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();

    const debts = useDebts()
    const transactionPartners = useTransactionPartners()
    const categories = useCategories()
    const labels = useLabels()

    const [totalPayments, setTotalPayments] = useState<number | null>(null)

    const [participantData, setParticipantData] = React.useState<ChartDataModel[]>([]);
    const [selectedParticipantData, setSelectedParticipantData] = React.useState<ChartDataModel | null>(null);

    const [paymentData, setPaymentData] = React.useState<ChartDataModel[]>([]);
    const [selectedPaymentData, setSelectedPaymentData] = React.useState<ChartDataModel | null>(null);

    const [categoryData, setCategoryData] = React.useState<ChartDataModel[]>([]);
    const [selectedCategory, setSelectedCategory] = React.useState<ChartDataModel | null>(null);

    const [labelData, setLabelData] = React.useState<ChartDataModel[]>([]);
    const [selectedLabel, setSelectedLabel] = React.useState<ChartDataModel | null>(null);

    useEffect(() => {
        if (!debts) return

        setTotalPayments(debts.reduce((acc, debt) => acc + (debt.transactionAmount || 0), 0))
    }, [debts]);

    useEffect(() => {
        if (!debts || !transactionPartners) return

        const transactionPartnerMap: { [key: string]: number } = {}
        const payerMap: { [key: string]: number } = {}

        debts.forEach((debt) => {
            if (debt.whoHasPaidUid) {
                payerMap[debt.whoHasPaidUid] = (payerMap[debt.whoHasPaidUid] || 0) + 1
            }

            debt.distributions.forEach((distribution) => {
                transactionPartnerMap[distribution.transactionPartnerUid] = (transactionPartnerMap[distribution.transactionPartnerUid] || 0) + ((debt.transactionAmount || 0) * (distribution.percentage / 100))
            })
        })

        setParticipantData(
            Object.keys(transactionPartnerMap).map((key) => {
                const partner = transactionPartners.find((partner) => partner.uid === key)

                return new ChartDataModel(
                    partner?.uid || "",
                    partner?.name || "",
                    transactionPartnerMap[key]
                )
            })
        )
        setPaymentData(
            Object.keys(payerMap).map((key) => {
                const partner = transactionPartners.find((partner) => partner.uid === key)

                return new ChartDataModel(
                    partner?.uid || "",
                    partner?.name || "",
                    payerMap[key]
                )
            })
        )
    }, [debts, transactionPartners]);

    function setPieChartData<T extends DBItem>(setFunction: (data: ChartDataModel[]) => void, data: T[], uidCheck: (item: T, debt: DebtModel) => boolean) {
        setFunction(data.reduce((result: ChartDataModel[], item) => {
            const foundItems = debts?.filter((debt) => {
                return uidCheck(item, debt)
            }) || []

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
        if (!debts || !categories) return
        setPieChartData(setCategoryData, categories, (category, transaction) => {
            return transaction.categoryUid === category.uid
        })
    }, [debts, categories]);

    useEffect(() => {
        if (!debts || !labels) return
        setPieChartData(setLabelData, labels, (label, transaction) => {
            return (transaction.labels || []).includes(label.uid)
        })
    }, [debts, labels]);

    const valueFormatter = (value: number | undefined) => {
        return formatCurrency(value || 0, settings?.language, currentAccount?.currencyCode)
    }

    return (
        <div className="home-screen">
            <ValueCard
                icon={<MdPayments/>}
                title={translate("total-amount-spend")}
                value={totalPayments !== null && formatCurrency(totalPayments, settings?.language, currentAccount?.currencyCode)}
            />
            <BarChartCard
                icon={<MdStackedBarChart/>}
                title={translate("cost-per-participant")}
                displayLabelAsData={false}
                chartData={participantData}
                valueFormatter={valueFormatter}
                selectedItem={selectedParticipantData}
                onItemSelected={setSelectedParticipantData}
                baseCurrency={currentAccount?.currencyCode}
            />
            <div className="transaction-overview-screen-row">
                <TransactionOverviewPieCard
                    icon={<MdEmojiEvents/>}
                    title={translate("payments")}
                    chartData={paymentData}
                    valueFormatter={(value) => String(value)}
                    selectedItem={selectedPaymentData}
                    onItemSelected={setSelectedPaymentData}
                    noItemSelectedLabel={translate("total")}
                    baseCurrency={currentAccount?.currencyCode}
                    onDetailOpen={() => {
                        const detailDebts: DebtModel[] = []

                        if (!debts) return

                        debts.forEach((debt) => {
                            if (selectedPaymentData && debt.whoHasPaidUid === selectedPaymentData.valueUid) {
                                detailDebts.push(debt)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedCategory?.label || "",
                                <PieChartDetailDialog debts={detailDebts} />
                            )
                        )
                    }}
                />
                <TransactionOverviewPieCard
                    icon={<MdPieChart/>}
                    title={translate("categories")}
                    chartData={categoryData}
                    valueFormatter={valueFormatter}
                    selectedItem={selectedCategory}
                    onItemSelected={setSelectedCategory}
                    noItemSelectedLabel={translate("total")}
                    baseCurrency={currentAccount?.currencyCode}
                    onDetailOpen={() => {
                        const detailDebts: DebtModel[] = []

                        if (!debts) return

                        debts.forEach((debt) => {
                            if (selectedCategory && debt.categoryUid === selectedCategory.valueUid) {
                                detailDebts.push(debt)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedCategory?.label || "",
                                <PieChartDetailDialog debts={detailDebts} />
                            )
                        )
                    }}
                />
                <TransactionOverviewPieCard
                    icon={<MdLabel/>}
                    title={translate("labels")}
                    chartData={labelData}
                    valueFormatter={valueFormatter}
                    selectedItem={selectedLabel}
                    onItemSelected={setSelectedLabel}
                    noItemSelectedLabel={translate("total")}
                    baseCurrency={currentAccount?.currencyCode}
                    onDetailOpen={() => {
                        const detailDebts: DebtModel[] = []

                        if (!debts) return

                        debts.forEach((debt) => {
                            if (selectedCategory && (debt.labels || []).includes(selectedCategory.valueUid)) {
                                detailDebts.push(debt)
                            }
                        })

                        dialog.open(
                            new DialogModel(
                                selectedCategory?.label || "",
                                <PieChartDetailDialog debts={detailDebts} />
                            )
                        )
                    }}
                />
            </div>
        </div>
    );
};

export default EvaluationScreen;