import React from 'react';
import Divider from "../../../Components/Divider/Divider";
import './TransactionOverviewCard.scss';
import {BarChart, PieChart} from "@mui/x-charts"
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import AxisChartCurrencyValueToolTip from "./AxisChartToolTip/AxisChartCurrencyValueToolTip";
import {ChartType} from "../../../../Data/TransactionOverview/ChartType";
import ItemChartCurrencyValueToolTip from "./ItemChartToolTip/ItemChartCurrencyValueToolTip";
import {formatDate} from "../../../../Helper/DateHelper";
import {PieChartDataModel} from "../../../../Data/TransactionOverview/PieChartDataModel";
import {BarChartDataModel} from "../../../../Data/TransactionOverview/BarChartDataModel";
import {TransactionType} from "../../../../Data/Transactions/TransactionType";

const TransactionOverviewCard = ({
    icon,
    title,
    chartData,
    chartType,
    transactionType,
    onTransactionTypeChange
}: {
    icon: React.ReactNode;
    title: string;
    chartData: PieChartDataModel[] | BarChartDataModel[];
    chartType: ChartType;
    transactionType?: TransactionType;
    onTransactionTypeChange?: (transactionType: TransactionType) => void;
}) => {
    const getBarByChartType = () => {
        switch (chartType) {
            case ChartType.BAR:
                const castedChartData = chartData as BarChartDataModel[];
                return <BarChart
                    // dataset={chartData}
                    xAxis={[{
                        data: castedChartData.map((item) => item.label),
                        scaleType: 'band',
                        colorMap: {
                            type: "ordinal",
                            values: castedChartData.map((item) => item.label),
                            colors: castedChartData.map((item) => item.color),
                        },
                        valueFormatter: (value) => formatDate(new Date(value)),
                    }]}
                    yAxis={[{
                        tickNumber: 8,
                        valueFormatter: (value: number) => formatCurrency(value, "EUR"),
                    }]}
                    series={
                        [{
                            data: castedChartData.map((item) => item.value),
                            valueFormatter: (value) => formatCurrency(value!, "EUR")
                        }]
                    }
                    layout="vertical"
                    // width={350}
                    height={350}
                    sx={{
                        "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                            strokeWidth: 1,
                            fill:"#ffffff"
                        },
                        "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                            stroke:"#ffffff",
                            strokeWidth: 1
                        },
                        "& .MuiChartsAxis-tick":{
                            stroke:"#ffffff",
                            strokeWidth: 2
                        },
                    }}
                    margin={{ left: 100, top: 10, right: 30, bottom: 30 }}
                    slots={{
                        axisContent: AxisChartCurrencyValueToolTip,
                    }}
                />;
            case ChartType.PIE:
                return <PieChart
                    colors={[
                        '#FFC107',
                        '#4CAF50',
                        '#2196F3',
                        '#E46138',
                        '#CD66DF',
                        '#FF9800',
                        '#566BDF',
                        '#CE4070',
                        '#00BCD4',
                        '#9071C5',
                        '#FFEB3B',
                        '#795548',
                        '#ffffff'
                    ]}
                    series={[
                        {
                            data: chartData as PieChartDataModel[],
                            innerRadius: 120,
                            cornerRadius: 4,
                            paddingAngle: 2,
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            // arcLabel: (item) => "" + item.value,
                            arcLabelMinAngle: 6,
                        }
                    ]}
                    slots={{
                        // axisContent: AxisChartCurrencyValueToolTip,
                        itemContent: ItemChartCurrencyValueToolTip
                    }}
                    slotProps={
                        {
                            legend: {
                                seriesToDisplay: []
                            },
                        }
                    }
                    width={455}
                    height={350}
                    margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                />
        }
    }

    return (
        <div className="transaction-overview-card">
            <div className="transaction-overview-card-title-container">
                { icon }
                <span>{ title }</span>
            </div>
            <Divider useOutlineColor={true} />
            { chartData.length > 0 && getBarByChartType() }

            { chartType === ChartType.PIE && <>
                <Divider useOutlineColor={true} />
                <div className="transaction-overview-income-expense-switch-container">
                    <button
                        className={transactionType === TransactionType.INCOME ? "selected" : ""}
                        onClick={() => onTransactionTypeChange && onTransactionTypeChange(TransactionType.INCOME)}
                    >Income</button>
                    <button
                        className={transactionType === TransactionType.EXPENSE ? "selected" : ""}
                        onClick={() => onTransactionTypeChange && onTransactionTypeChange(TransactionType.EXPENSE)}
                    >Expenses</button>
                </div>
            </>}
        </div>
    );
};

export default TransactionOverviewCard;