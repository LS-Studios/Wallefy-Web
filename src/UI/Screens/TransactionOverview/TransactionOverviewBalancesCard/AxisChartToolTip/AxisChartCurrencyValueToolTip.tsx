import React, {useEffect} from 'react';
import {ChartsAxisContentProps} from "@mui/x-charts";
import "./AxisChartCurrencyValueToolTip.scss"
import Divider from "../../../../Components/Divider/Divider";
import {formatCurrency} from "../../../../../Helper/CurrencyHelper";
import {ThemeType} from "../../../../../Data/EnumTypes/ThemeType";
import {useSettings} from "../../../../../Providers/SettingsProvider";
import {useThemeDetector} from "../../../../../CustomHooks/useThemeDetector";
import {useToolTip} from "../../../../../CustomHooks/useToolTip";
import {SettingsModel} from "../../../../../Data/DataModels/SettingsModel";

interface AxisChartCurrencyValueToolTipProps extends ChartsAxisContentProps {
    valueFormatter: (value: number | undefined) => string
    settings: SettingsModel | null
}

const AxisChartCurrencyValueToolTip = ({
    axisValue,
    dataIndex,
    series,
    valueFormatter,
    settings,
}: AxisChartCurrencyValueToolTipProps) => {
    const { isOnRight, isOnBottom } = useToolTip(settings)

    return (
        <div className={"chart-tool-tip " + (isOnRight ? "onRight" : "onLeft") + (isOnBottom ? " onBottom" : " onTop")}>
            <span>{axisValue as string}</span>
            <Divider />
            <span>{valueFormatter(series[0].data[dataIndex!] as number)}</span>
        </div>
    );
};

export default AxisChartCurrencyValueToolTip;