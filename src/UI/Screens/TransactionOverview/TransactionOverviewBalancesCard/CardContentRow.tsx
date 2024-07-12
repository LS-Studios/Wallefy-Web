import React from 'react';
import {formatDate} from "../../../../Helper/DateHelper";
import {formatCurrency} from "../../../../Helper/CurrencyHelper";

const CardContentRow = ({
    firstLabel,
    firstValue,
    secondLabel,
    secondValue
  }: {
    firstLabel: string,
    firstValue: string,
    secondLabel: string,
    secondValue: string,
}) => {
    return (
        <div className="transaction-overview-card-chart-content-row">
            <div>
                <span className="transaction-overview-card-chart-label">{firstLabel}</span>
                <span
                    className="transaction-overview-card-chart-value">{firstValue}</span>
            </div>
            <div>
                <span className="transaction-overview-card-chart-label">{secondLabel}</span>
                <span
                    className="transaction-overview-card-chart-value">{secondValue}</span>
            </div>
        </div>
    );
};

export default CardContentRow;