import React, {useEffect} from 'react';
import {ChartsAxisContentProps, ChartsItemContentProps, DefaultizedPieValueType} from "@mui/x-charts";
import Divider from "../../../../Components/Divider/Divider";
import {formatCurrency} from "../../../../../Helper/CurrencyHelper";
import {ThemeType} from "../../../../../Data/EnumTypes/ThemeType";
import {useToolTip} from "../../../../../CustomHooks/useToolTip";
import {SettingsModel} from "../../../../../Data/DataModels/SettingsModel";

interface ItemChartCurrencyValueToolTipProps extends ChartsItemContentProps {
    valueFormatter: (value: number | undefined) => string
    settings: SettingsModel | null
    baseCurrency: string | null | undefined
}

const ItemChartCurrencyValueToolTip = ({
    itemData,
    series,
    valueFormatter,
    settings
}: ItemChartCurrencyValueToolTipProps) => {
    const data: DefaultizedPieValueType | null = series.data[itemData.dataIndex!] as DefaultizedPieValueType | null;

    const { isOnRight, isOnBottom } = useToolTip(settings)

    return (
        <div className={"chart-tool-tip " + (isOnRight ? "onRight" : "onLeft") + (isOnBottom ? " onBottom" : " onTop")}>
            <span>{data?.label as string}</span>
            <Divider/>
            <span>{valueFormatter(data?.value)}</span>
        </div>
    );
};

export default ItemChartCurrencyValueToolTip;