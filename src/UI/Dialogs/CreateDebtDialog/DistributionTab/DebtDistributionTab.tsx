import React, {useEffect} from 'react';
import TextInputComponent from "../../../Components/Input/TextInput/TextInputComponent";
//@ts-ignore
import variables from "../../../../Data/Variables.scss";
import RadioInputComponent from "../../../Components/Input/RadioInput/RadioInputComponent";
import {InputOptionModel} from "../../../../Data/DataModels/Input/InputOptionModel";
import {ExecutionType} from "../../../../Data/EnumTypes/ExecutionType";
import {RepetitionType} from "../../../../Data/EnumTypes/RepetitionType";
import InputBaseComponent from "../../../Components/Input/InputBase/InputBaseComponent";

import './DebtDistributionTab.scss';
import {RepetitionRateType} from "../../../../Data/EnumTypes/RepetitionRateType";
import {DayOfWeekModel} from "../../../../Data/DataModels/Reptition/DayOfWeekModel";
import DateInputComponent from "../../../Components/Input/DateInputComponent/DateInputComponent";
import CheckboxInputComponent from "../../../Components/Input/CheckboxInput/CheckboxInputComponent";
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {RepetitionModel} from "../../../../Data/DataModels/Reptition/RepetitionModel";
import {
    formatDateToStandardString, getCurrentDate,
    getWeekDayNameShort
} from "../../../../Helper/DateHelper";
import {useToast} from "../../../../Providers/Toast/ToastProvider";
import useEffectNotInitial from "../../../../CustomHooks/useEffectNotInitial";
import {RepetitionHelper} from "../../../../Helper/RepetitionHelper";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {useSettings} from "../../../../Providers/SettingsProvider";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
import {DebtModel} from "../../../../Data/DatabaseModels/DebtModel";
import DistributionInputComponent from "../../../Components/Input/DistriutionInput/DistributionInputComponent";
import {DistributionModel} from "../../../../Data/DataModels/DistributionModel";
import {TransactionPartnerModel} from "../../../../Data/DatabaseModels/TransactionPartnerModel";
import {CreateDialogNewItems} from "../../../../Data/DataModels/CreateDialogNewItems";
;

const DebtDistributionTab = ({
    workDebt,
    updateDebt,
    transactionPartners,
    newItems,
}: {
    workDebt: DebtModel,
    updateDebt: (updater: (oldDebt: DebtModel) => DebtModel) => void,
    transactionPartners: TransactionPartnerModel[] | null,
    newItems: CreateDialogNewItems,
}) => {
    const [alreadyChanged, setAlreadyChanged] = React.useState<string[]>([])
    const [lastChanged, setLastChanged] = React.useState<string | null>(null)

    const setDistribution = (distribution: DistributionModel) => {
        const distributionMap: { [key: string]: number } = {};

        workDebt.distributions.forEach((d) => {
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
        updateDebt((oldDebt) => {
            return {
                ...oldDebt,
                distributions: Object.keys(newDistributions).map(tpUid => new DistributionModel(tpUid, newDistributions[tpUid]))
            }
        })
        setAlreadyChanged(updatedAlreadyChanged);
        setLastChanged(distribution.transactionPartnerUid)
    };

    return (
        <>
            {workDebt.distributions.map((distribution, index) => {
                return (
                    <DistributionInputComponent
                        distribution={distribution}
                        onDistributionChange={(newDistribution) => {
                            setDistribution(newDistribution);
                        }}
                        price={workDebt.transactionAmount || 0}
                        currency={workDebt.currency}
                        transactionPartners={transactionPartners ? [...transactionPartners, ...newItems.newTransactionPartners] : []}
                    />
                )
            })}
        </>
    );
};

export default DebtDistributionTab;