import React from 'react';
import Spinner from "../../../Components/Spinner/Spinner";
import {SpinnerType} from "../../../../Data/EnumTypes/SpinnerType";

const CardContentRow = ({
    firstLabel,
    firstValue,
    secondLabel,
    secondValue
  }: {
    firstLabel: string,
    firstValue: string | null | undefined,
    secondLabel: string,
    secondValue: string | null | undefined
}) => {
    return (
        <div className="transaction-overview-card-chart-content-rows">
            <div id="transaction-overview-card-chart-first-row" className="transaction-overview-card-chart-row">
                <span className="transaction-overview-card-chart-label">{firstLabel}</span>
                { firstValue ? <span>{firstValue}</span> : <Spinner type={SpinnerType.DOTS} /> }
            </div>
            <div className="transaction-overview-card-chart-row">
                <span className="transaction-overview-card-chart-label">{secondLabel}</span>
                { secondValue ? <span>{secondValue}</span> : <Spinner type={SpinnerType.DOTS} /> }
            </div>
        </div>
    );
};

export default CardContentRow;