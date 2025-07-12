import React, {useEffect} from 'react';
import CurrencyInputComponent from "../CurrencyInput/CurrencyInputComponent";
import InputBaseComponent from "../InputBase/InputBaseComponent";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {DistributionModel} from "../../../../Data/DataModels/DistributionModel";
import {CurrencyModel} from "../../../../Data/DataModels/CurrencyModel";
import SliderInputComponent from "../SliderInput/SliderInputComponent";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {roundToNearest} from "../../../../Helper/CalculationHelper";

const DistributionInputComponent = ({
    distribution,
    onDistributionChange,
    price,
    currency,
    transactionPartners
}: {
    distribution: DistributionModel,
    onDistributionChange: (distribution: DistributionModel) => void,
    price: number,
    currency: CurrencyModel,
    transactionPartners: TransactionPartnerModel[]
}) => {
    const translate = useTranslation();

    useEffect(() => {
        if (distribution.percentage > 100) {
            onDistributionChange(new DistributionModel(distribution.transactionPartnerUid, 100));
        } else if (distribution.percentage < 0) {
            onDistributionChange(new DistributionModel(distribution.transactionPartnerUid, 0));
        }
    }, [distribution.percentage]);

    return (
        <InputBaseComponent
            title={"Distribution of " + transactionPartners.find((partner) => partner.uid === distribution.transactionPartnerUid)?.name}
        >
            <div className="filter-transaction-dialog-price-range">
                <CurrencyInputComponent
                    value={roundToNearest(price * (distribution.percentage / 100))}
                    onValueChange={(value) => {
                        onDistributionChange(new DistributionModel(distribution.transactionPartnerUid, value / price * 100));
                    }}
                    changeOnBlur={true}
                    currency={currency}
                    currencyRateIsDisabled={true}
                />
                <CurrencyInputComponent
                    value={distribution.percentage}
                    onValueChange={(value) => {
                        onDistributionChange(new DistributionModel(distribution.transactionPartnerUid, value));
                    }}
                    changeOnBlur={true}
                    currency={new CurrencyModel("%", "%", 1)}
                    currencyRateIsDisabled={true}
                    min={0}
                    max={100}
                />
            </div>
            <SliderInputComponent
                value={distribution.percentage}
                onValueChange={(value) => {
                    onDistributionChange(new DistributionModel(distribution.transactionPartnerUid, value));
                }}
                min={0}
                max={100}
            />
        </InputBaseComponent>
    );
};

export default DistributionInputComponent;