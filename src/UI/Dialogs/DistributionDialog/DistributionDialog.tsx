import React from 'react';
import DebtDistributionTab from "../CreateDebtDialog/DistributionTab/DebtDistributionTab";
import {CurrencyValueModel} from "../../../Data/DataModels/CurrencyValueModel";
import DialogOverlay from "../DialogOverlay/DialogOverlay";
import {DistributionModel} from "../../../Data/DataModels/DistributionModel";
import {TransactionPartnerModel} from "../../../Data/DatabaseModels/TransactionPartnerModel";
import {CreateDialogNewItems} from "../../../Data/DataModels/CreateDialogNewItems";
import {ContentAction} from "../../../Data/ContentAction/ContentAction";
import {useDialog} from "../../../Providers/DialogProvider";
import {useTranslation} from "../../../CustomHooks/useTranslation";

const DistributionDialog = ({
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
    const translate = useTranslation()
    const dialog = useDialog()

    const [tempDistributions, setTempDistributions] = React.useState<DistributionModel[]>(distributions)

    return (
        <DialogOverlay actions={[
            new ContentAction(
                translate("done"),
                () => {
                    onDistributionChange(tempDistributions);
                    dialog.closeCurrent();
                },
            )
        ]}>
            <DebtDistributionTab
                distributions={tempDistributions}
                onDistributionChange={setTempDistributions}
                currencyValue={currencyValue}
                transactionPartners={transactionPartners}
                newItems={newItems}
            />
        </DialogOverlay>
    )
};

export default DistributionDialog;