import React from 'react';

import './DebtDistributionTab.scss';
import DistributionInputComponent from "../../../Components/Input/DistriutionInput/DistributionInputComponent";
import {DistributionModel} from "../../../../Data/DataModels/DistributionModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
import {CurrencyValueModel} from "../../../../Data/DataModels/CurrencyValueModel";

;

const DebtDistributionTab = ({
    distributions,
    onDistributionChange,
    currencyValue,
    transactionPartners,
    newItems,
}: {
    distributions: DistributionModel[],
    onDistributionChange: (newDistributions: DistributionModel[]) => void,
    currencyValue: CurrencyValueModel
    transactionPartners: TransactionPartnerModel[] | null,
    newItems: CreateDialogNewItems,
}) => {
    const [alreadyChanged, setAlreadyChanged] = React.useState<string[]>([])
    const [lastChanged, setLastChanged] = React.useState<string | null>(null)

    const setDistribution = (distribution: DistributionModel) => {
        const distributionMap: { [key: string]: number } = {};

        distributions.forEach((d) => {
            distributionMap[d.transactionPartnerUid] = d.percentage;
        });

        let updatedAlreadyChanged = [...alreadyChanged];

        if (updatedAlreadyChanged.includes(distribution.transactionPartnerUid)) {
            updatedAlreadyChanged = updatedAlreadyChanged.filter(uid => uid !== distribution.transactionPartnerUid);
        }

        const totalDistribution = updatedAlreadyChanged.map(uid => distributionMap[uid] || 0).reduce((a, b) => a + b, 0) + distribution.percentage;

        if ((totalDistribution > 100 || totalDistribution < 100) && updatedAlreadyChanged.length === Object.keys(distributionMap).length - 1) {
            updatedAlreadyChanged.shift();
        }

        // Set the new distribution
        const newDistributions = { ...distributionMap, [distribution.transactionPartnerUid]: distribution.percentage };

        // Calculate the percentage left to distribute on the not already changed distributions
        const remainingPercentage = 100 - (updatedAlreadyChanged.map(uid => newDistributions[uid] || 0).reduce((a, b) => a + b, 0) + distribution.percentage);

        // Calculate the number of distributions to adjust
        const distributionsToAdjust = Object.keys(newDistributions).length - (updatedAlreadyChanged.length + 1);

        // Adjust the distributions
        for (const tpUid in newDistributions) {
            if (tpUid !== distribution.transactionPartnerUid && !updatedAlreadyChanged.includes(tpUid)) {
                newDistributions[tpUid] = remainingPercentage / distributionsToAdjust;
            }
        }

        // Add the changed distribution to the already changed distributions list
        if (lastChanged !== distribution.transactionPartnerUid) {
        }
        updatedAlreadyChanged.push(distribution.transactionPartnerUid);

        // Update state
        onDistributionChange(Object.keys(newDistributions).map(tpUid => new DistributionModel(tpUid, newDistributions[tpUid])))
        setAlreadyChanged(updatedAlreadyChanged);
        setLastChanged(distribution.transactionPartnerUid)
    };

    return (
        <>
            {distributions.map((distribution, index) => {
                return (
                    <DistributionInputComponent
                        distribution={distribution}
                        onDistributionChange={(newDistribution) => {
                            setDistribution(newDistribution);
                        }}
                        price={currencyValue.transactionAmount || 0}
                        currency={currencyValue.currency}
                        transactionPartners={transactionPartners ? [...transactionPartners, ...newItems.newTransactionPartners] : []}
                    />
                )
            })}
        </>
    );
};

export default DebtDistributionTab;