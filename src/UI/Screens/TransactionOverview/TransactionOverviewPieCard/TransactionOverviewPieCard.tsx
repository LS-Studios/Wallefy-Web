import React, {useEffect} from 'react';
import Divider from "../../../Components/Divider/Divider";
import './TransactionOverviewPieCard.scss';
import {PieChart} from "@mui/x-charts"
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import ItemChartCurrencyValueToolTip from "./ItemChartToolTip/ItemChartCurrencyValueToolTip";
import {TransactionType} from "../../../../Data/EnumTypes/TransactionType";
import {ChartDataModel} from "../../../../Data/DataModels/Chart/ChartDataModel";
import {CalculationType} from "../../../../Data/EnumTypes/CalculationType";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useSettings} from "../../../../Providers/SettingsProvider";

const TransactionOverviewPieCard = ({
    icon,
    title,
    valueFormatter,
    noItemSelectedLabel,
    chartData,
    transactionType,
    onTransactionTypeChange,
    selectedItem,
    onItemSelected,
    calculationType = CalculationType.SUM,
    baseCurrency
}: {
    icon: React.ReactNode;
    title: string;
    valueFormatter: (value: number | undefined) => string;
    noItemSelectedLabel: string;
    chartData: ChartDataModel[];
    transactionType?: TransactionType;
    onTransactionTypeChange?: (transactionType: TransactionType) => void;
    selectedItem: ChartDataModel | null;
    onItemSelected: (item: ChartDataModel | null) => void;
    calculationType?: CalculationType;
    baseCurrency: string | null | undefined
}) => {
    const translate = useTranslation()
    const settings = useSettings()

    const getLabelText = () => {
        if (selectedItem === null) {
            return noItemSelectedLabel
        } else {
            return selectedItem.label;
        }
    }

    return (
        <div className="card">
            <div className="card-title-container">
                { icon }
                <span>{ title }</span>
            </div>
            <Divider useOutlineColor={true} />
            <div className="transaction-overview-card-chart-container">
                { chartData.length > 0 ? <>
                    <div className="transaction-overview-card-chart-text">
                        <span id="transaction-overview-card-chart-text-value">{valueFormatter(selectedItem?.value || Math.abs(chartData.reduce((ac, cu) => {
                            if (calculationType === CalculationType.SUM) {
                                return ac + cu.value;
                            } else if (calculationType === CalculationType.SUBTRACT) {
                                return cu.value - ac;
                            } else {
                                return 0;
                            }
                        }, 0)))}</span>
                        <span id="transaction-overview-card-chart-text-label">{getLabelText()}</span>
                    </div>
                    <PieChart
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
                                id: 'pie',
                                // @ts-ignore
                                data: chartData.map((item) => {
                                    if (!item.color) {
                                        const {color, ...rest} = item;
                                        return rest
                                    } else {
                                        return item
                                    }
                                }),
                                innerRadius: 100,
                                cornerRadius: 4,
                                paddingAngle: 2,
                                highlightScope: { faded: 'global', highlighted: 'item' },
                                // arcLabel: (item) => "" + item.value,
                                arcLabelMinAngle: 6,
                            }
                        ]}
                        slots={{
                            itemContent: (props) => (
                                <ItemChartCurrencyValueToolTip {...props} valueFormatter={valueFormatter} settings={settings} baseCurrency={baseCurrency} />
                            )
                        }}
                        slotProps={
                            {
                                legend: {
                                    seriesToDisplay: []
                                },
                            }
                        }
                        width={280}
                        height={280}
                        margin={{ left: 0, top: 0, right: 0, bottom: 0 }}
                        highlightedItem={ selectedItem && { seriesId: 'pie', dataIndex: chartData.indexOf(selectedItem) }}
                        onItemClick={(event, d) => {
                            if (selectedItem === chartData[d.dataIndex]) {
                                onItemSelected(null)
                            } else {
                                onItemSelected(chartData[d.dataIndex])
                            }
                        }}
                    />
                </>: <div className="transaction-overview-card-no-items">{translate("no-data")}</div> }
            </div>
            { transactionType !== undefined && <>
                <Divider useOutlineColor={true} />
                <div className="transaction-overview-income-expense-switch-container">
                    <button
                        className={transactionType === TransactionType.EXPENSE ? "selected" : ""}
                        onClick={() => {
                            onTransactionTypeChange!(TransactionType.EXPENSE)
                            onItemSelected(null)
                        }}
                    >{translate("expenses")}
                    </button>
                    <button
                        className={transactionType === TransactionType.INCOME ? "selected" : ""}
                        onClick={() => {
                            onTransactionTypeChange!(TransactionType.INCOME)
                            onItemSelected(null)
                        }}
                    >{translate("income")}
                    </button>
                </div>
            </>}
        </div>
    );
};

export default TransactionOverviewPieCard;