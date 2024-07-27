import React from 'react';
import Divider from "../../../Components/Divider/Divider";
import '../TransactionOverviewCard.scss';
import {BarChart} from "@mui/x-charts"
import {formatCurrency} from "../../../../Helper/CurrencyHelper";
import {formatDate} from "../../../../Helper/DateHelper";
import {ChartDataModel} from "../../../../Data/DataModels/Chart/ChartDataModel";
import "./BarChartCard.scss"
import CardContentRow from "./CardContentRow";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import AxisChartCurrencyValueToolTip from "./AxisChartToolTip/AxisChartCurrencyValueToolTip";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {useScreenScaleStep} from "../../../../CustomHooks/useScreenScaleStep";
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";
import {heIL} from "@mui/material/locale";

const BarChartCard = ({
    icon,
    title,
    displayLabelAsData=true,
    chartData,
    valueFormatter,
    selectedItem,
    onItemSelected,
    baseCurrency
}: {
    icon: React.ReactNode;
    title: string;
    displayLabelAsData?: boolean;
    chartData: ChartDataModel[] | null;
    valueFormatter: (value: number | undefined) => string;
    selectedItem: ChartDataModel | null;
    onItemSelected: (item: ChartDataModel | null) => void;
    baseCurrency: string | null | undefined
}) => {
    const translate = useTranslation()
    const settings = useSettings()

    const screenScaleStep = useScreenScaleStep()

    const colors = [
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
    ]

    return (
        <div className="card">
            <div className="card-title-container">
                { icon }
                <span>{ title }</span>
            </div>
            <Divider useOutlineColor={true} />

            <div style={{
                overflow: "hidden",
                width: "100%",
                overflowX: "auto",
            }}>
                { chartData ?
                    chartData.length > 0 ? <BarChart
                        xAxis={[{
                            id: "bar",
                            data: chartData.map((item) => item.label),
                            scaleType: 'band',
                            colorMap: {
                                type: "ordinal",
                                colors: chartData[0]?.color ? chartData.map((item) => item.color!) : chartData.map((item, index) => {
                                    if (selectedItem && selectedItem !== item) return colors[index % colors.length] + "80"
                                    return colors[index % colors.length]
                                })
                            },
                            valueFormatter: (value) => displayLabelAsData ? formatDate(new Date(value)) : value,
                        }]}
                        yAxis={[{
                            tickNumber: 8,
                            valueFormatter: valueFormatter,
                        }]}
                        series={
                            [{
                                data: chartData.map((item) => item.value),
                                valueFormatter: (value) => formatCurrency(value!, settings?.language, baseCurrency)
                            }]
                        }
                        width={screenScaleStep > 0 ? 800 : undefined}
                        layout="vertical"
                        height={350}
                        sx={{
                            "& .MuiChartsAxis-left .MuiChartsAxis-tickLabel":{
                                strokeWidth: 1,
                                fill:"var(--text)"
                            },
                            "& .MuiChartsAxis-tickContainer .MuiChartsAxis-tickLabel":{
                                fill:"var(--text)"
                            },
                            "& .MuiChartsAxis-bottom .MuiChartsAxis-tickLabel":{
                                strokeWidth: 1,
                                fill:"var(--text)"
                            },
                            "& .MuiChartsAxis-bottom .MuiChartsAxis-line":{
                                stroke:"var(--text)",
                                strokeWidth: 1
                            },
                            "& .MuiChartsAxis-left .MuiChartsAxis-line":{
                                stroke:"var(--text)",
                                strokeWidth: 1
                            },
                            "& .MuiChartsAxis-tick":{
                                stroke:"var(--text)",
                                strokeWidth: 2
                            },
                        }}
                        margin={{ left: 100, top: 10, right: 30, bottom: 30 }}
                        slots={{
                            axisContent: (props) => (
                                <AxisChartCurrencyValueToolTip {...props} valueFormatter={valueFormatter} settings={settings} />
                            )
                        }}
                        onItemClick={(event, d) => {
                            if (selectedItem?.label === chartData[d.dataIndex].label) {
                                onItemSelected(null)
                            } else {
                                onItemSelected(chartData[d.dataIndex])
                            }
                        }}
                        highlightedItem={{ seriesId: 'bar', dataIndex: 0 }}
                    /> : <span className="no-items" style={{height:340}}>{translate("no-data")}</span> :
                <Spinner type={SpinnerType.CYCLE} style={{height:340}} />}
            </div>
            <div className="transaction-overview-card-chart-content">
                <Divider useOutlineColor={true}/>
                <CardContentRow
                    firstLabel={translate("selected-value-name")}
                    firstValue={selectedItem ? (displayLabelAsData ? formatDate(new Date(selectedItem?.label)) : selectedItem?.label) : translate("no-date-selected")}
                    secondLabel={translate("selected-value")}
                    secondValue={selectedItem ? formatCurrency(selectedItem?.value!, settings?.language, baseCurrency) : translate("no-date-selected")}
                />
            </div>
        </div>
    );
};

export default BarChartCard;