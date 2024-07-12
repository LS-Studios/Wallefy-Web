import React from 'react';
import DialogOverlay from "./DialogOverlay/DialogOverlay";
import {ContentAction} from "../../Data/ContentAction/ContentAction";
import CheckboxInputComponent from "../Components/Input/CheckboxInput/CheckboxInputComponent";
import {useTranslation} from "../../CustomHooks/useTranslation";
import {useDialog} from "../../Providers/DialogProvider";
import {deleteDBItem, deleteDBObject} from "../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../Helper/DatabaseRoutes";
import {useCurrentAccount} from "../../Providers/AccountProvider";
import {useDatabaseRoute} from "../../CustomHooks/useDatabaseRoute";

const DeleteDialog = () => {
    const dialog = useDialog();
    const translate = useTranslation();

    const getDatabaseRoute = useDatabaseRoute();

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
                    deletePresets && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.PRESETS))
                    deleteHistory && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.HISTORY_TRANSACTIONS))
                    deleteTransactions && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.TRANSACTIONS))
                    deleteTransactions && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.DEBTS))
                    deleteCategories && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.CATEGORIES))
                    deleteTransactionPartners && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.TRANSACTION_PARTNERS))
                    deleteLabels && deleteDBObject(getDatabaseRoute!(DatabaseRoutes.LABELS))

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