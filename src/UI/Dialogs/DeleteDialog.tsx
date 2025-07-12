import React from 'react';
import DialogOverlay from "./DialogOverlay/DialogOverlay";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import CheckboxInputComponent from "../Components/Input/CheckboxInput/CheckboxInputComponent";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {useDialog} from "../../Providers/DialogProvider";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useAccountRoute} from "../../CustomHooks/Database/useAccountRoute";
import {getActiveDatabaseHelper} from "../../Helper/Database/ActiveDBHelper";

const DeleteDialog = () => {
    const dialog = useDialog();
    const translate = useTranslation();

    const getDatabaseRoute = useAccountRoute();

    const [deletePresets, setDeletePresets] = React.useState(false);
    const [deleteHistory, setDeleteHistory] = React.useState(false);
    const [deleteTransactions, setDeleteTransactions] = React.useState(false);
    const [deleteCategories, setDeleteCategories] = React.useState(false);
    const [deleteTransactionPartners, setDeleteTransactionPartners] = React.useState(false);
    const [deleteLabels, setDeleteLabels] = React.useState(false);


    return (
        <DialogOverlay actions={[
            new ContentAction(
                "Delete",
                () => {
                    deletePresets && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.PRESETS))
                    deleteHistory && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.HISTORY_TRANSACTIONS))
                    deleteTransactions && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.TRANSACTIONS))
                    deleteTransactions && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.DEBTS))
                    deleteTransactions && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.PAYED_DEBTS))
                    deleteCategories && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.CATEGORIES))
                    deleteTransactionPartners && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.TRANSACTION_PARTNERS))
                    deleteLabels && getActiveDatabaseHelper().deleteDBObject(getDatabaseRoute!(DatabaseRoutes.LABELS))

                    dialog.closeCurrent()
                },
                false,
                getDatabaseRoute === null
            )
        ]}>
            <CheckboxInputComponent
                text={translate("delete-presets")}
                value={deletePresets}
                onValueChange={setDeletePresets}
            />
            <CheckboxInputComponent
                text={translate("delete-past-transactions")}
                value={deleteHistory}
                onValueChange={setDeleteHistory}
            />
            <CheckboxInputComponent
                text={translate("delete-transactions")}
                value={deleteTransactions}
                onValueChange={setDeleteTransactions}
            />
            <CheckboxInputComponent
                text={translate("delete-categories")}
                value={deleteCategories}
                onValueChange={setDeleteCategories}
            />
            <CheckboxInputComponent
                text={translate("delete-transaction-partners")}
                value={deleteTransactionPartners}
                onValueChange={setDeleteTransactionPartners}
            />
            <CheckboxInputComponent
                text={translate("delete-labels")}
                value={deleteLabels}
                onValueChange={setDeleteLabels}
            />
        </DialogOverlay>
    );
};

export default DeleteDialog;