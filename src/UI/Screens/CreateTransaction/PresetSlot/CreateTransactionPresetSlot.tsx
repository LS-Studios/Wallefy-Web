import React, {useEffect} from 'react';

import './CreateTransactionPresetSlot.scss';
import {TransactionModel} from "../../../../Data/DatabaseModels/TransactionModel";
import {useDialog} from "../../../../Providers/DialogProvider";
import {DialogModel} from "../../../../Data/DataModels/DialogModel";
import CreateTransactionDialog from "../../../Dialogs/CreateTransactionDialog/CreateTransactionDialog";
import {TransactionPresetModel} from "../../../../Data/DatabaseModels/TransactionPresetModel";
import * as MDIcons from "react-icons/md";
import {ContextMenuModel} from "../../../../Data/DataModels/ContextMenuModel";
import ContextMenuBase from "../../../Components/ContextMenuBase/ContextMenuBase";
import {ContentAction} from "../../../../Data/ContentAction/ContentAction";
import {useContextMenu} from "../../../../Providers/ContextMenuProvider";
import {deleteDBItem} from "../../../../Helper/AceBaseHelper";
import {DatabaseRoutes} from "../../../../Helper/DatabaseRoutes";
import {useTranslation} from "../../../../CustomHooks/useTranslation";
import {DebtPresetModel} from "../../../../Data/DatabaseModels/DebtPresetModel";
import {useCurrentAccount} from "../../../../Providers/AccountProvider";
import {AccountType} from "../../../../Data/EnumTypes/AccountType";
import CreateDebtDialog from "../../../Dialogs/CreateDebtDialog/CreateDebtDialog";
import {getIcon} from "../../../../Helper/IconMapper";
import {useDatabaseRoute} from "../../../../CustomHooks/useDatabaseRoute";
import PresetDialog from "../../../Dialogs/PresetDialog";

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
    const getDatabaseRoute = useDatabaseRoute()

    const openCreateTransactionDialog = () => {
        dialog.open(
            new DialogModel(
                preset.name + " - " + translate("create-transaction"),
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
                new ContentAction("Edit", () => {

                }, isBasic),
                new ContentAction("Delete", () => {
                    if (!getDatabaseRoute) return

                    deleteDBItem(getDatabaseRoute(DatabaseRoutes.PRESETS), preset)
                })
            ])}
        >
            <Icon className="create-transaction-preset-slot-icon" />
            <span className="create-transaction-preset-slot-title">{preset.name}</span>
        </div>
    </>
};

export default CreateTransactionPresetSlot;