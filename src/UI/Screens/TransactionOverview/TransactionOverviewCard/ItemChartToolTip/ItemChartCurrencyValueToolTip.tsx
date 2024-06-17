import React, {useEffect} from 'react';
import {ChartsAxisContentProps, ChartsItemContentProps, DefaultizedPieValueType} from "@mui/x-charts";
import Divider from "../../../../Components/Divider/Divider";
import {formatCurrency} from "../../../../../Helper/CurrencyHelper";

const ItemChartCurrencyValueToolTip = ({
    itemData,
    series,
}: ChartsItemContentProps) => {
    const data: DefaultizedPieValueType = series.data[itemData.dataIndex!] as DefaultizedPieValueType;

    return (
        <div className="chart-tool-tip">
            <span>{data.label as string}</span>
            <Divider />
            <span>{formatCurrency(data.value, "EUR")}</span>
        </div>
    );
};

export default ItemChartCurrencyValueToolTip;