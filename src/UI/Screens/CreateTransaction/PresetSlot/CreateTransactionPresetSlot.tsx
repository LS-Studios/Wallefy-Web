import React from 'react';

import './CreateTransactionPresetSlot.scss';
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import {TransactionPresetModel} from "../../../../Data/DatabaseModels/TransactionPresetModel";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {DebtPresetModel} from "../../../../Data/DatabaseModels/DebtPresetModel";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {AccountType} from "../../../../Data/EnumTypes/AccountType";
import {getIcon} from "../../../../Helper/IconMapper";
import {useAccountRoute} from "../../../../CustomHooks/Database/useAccountRoute";
import PresetDialog from "../../../Dialogs/PresetDialog";
import {getActiveDatabaseHelper} from "../../../../Helper/Database/ActiveDBHelper";

const CreateTransactionPresetSlot = ({
    preset,
    isBasic,
}: {
    preset: TransactionPresetModel | DebtPresetModel,
    isBasic: boolean,
}) => {
    const translate = useTranslation()
    const { currentAccount } = useCurrentAccount();
    const dialog = useDialog()
    const contextMenu = useContextMenu()
    const getDatabaseRoute = useAccountRoute()

    const openCreateTransactionDialog = () => {
        dialog.open(
            new DialogModel(
                translate("create-transaction"),
                <PresetDialog
                    preset={preset}
                    isDebt={currentAccount?.type === AccountType.DEBTS}
                />,
            )
        )
    }

    const Icon = getIcon(preset.icon)

    return <>
        <div
            className="create-transaction-preset-slot" onClick={openCreateTransactionDialog}
            onContextMenu={(e) => contextMenu.handleOnContextMenu(e, [
                new ContentAction(translate("edit"), () => {

                }, isBasic),
                new ContentAction(translate("delete"), () => {
                    if (!getDatabaseRoute) return

                    getActiveDatabaseHelper().deleteDBItem(getDatabaseRoute(DatabaseRoutes.PRESETS), preset)
                })
            ])}
        >
            <Icon className="create-transaction-preset-slot-icon" />
            <span className="create-transaction-preset-slot-title">{preset.name}</span>
        </div>
    </>
};

export default CreateTransactionPresetSlot;