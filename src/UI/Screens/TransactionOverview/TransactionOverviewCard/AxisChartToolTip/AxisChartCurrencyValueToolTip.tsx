import React from 'react';
import {ChartsAxisContentProps} from "@mui/x-charts";
import "./AxisChartCurrencyValueToolTip.scss"
import Divider from "../../../../Components/Divider/Divider";
import {formatCurrency} from "../../../../../Helper/CurrencyHelper";

const AxisChartCurrencyValueToolTip = ({
    axisValue,
    dataIndex,
    series,
}: ChartsAxisContentProps) => {
    return (
        <div className="chart-tool-tip">
            <span>{axisValue as string}</span>
            <Divider />
            <span>{formatCurrency(series[0].data[dataIndex!] as number, "EUR")}</span>
        </div>
    );
};

export default AxisChartCurrencyValueToolTip;